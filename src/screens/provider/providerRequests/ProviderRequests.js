// screens/ProviderRequests.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
  TextInput,
  Animated
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Import your live API calls from the correct Provider endpoint paths
import { fetchBookings, acceptOrRejectBooking, updateBookingStatus } from '../../../../api/ProviderAPI';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: "#08B36A",
  primaryLight: "rgba(8, 179, 106, 0.08)",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E2E8F0",
  white: "#FFFFFF",
  danger: "#EF4444",
  dangerLight: "rgba(239, 68, 68, 0.08)",
  warning: "#F59E0B",
  warningLight: "rgba(245, 158, 11, 0.08)",
  info: "#3B82F6",
  infoLight: "rgba(59, 130, 246, 0.08)"
};

const TABS = ["Requested", "Accepted", "Ongoing", "Completed", "Cancelled"];
const EXPIRATION_LIMIT_MS = 6 * 60 * 60 * 1000; // 6 Hours in Milliseconds

// Reusable Sub-Component for Live Countdown Rendering
const RequestTimer = ({ createdAt, onExpire, isModalVariant = false }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const createdTime = new Date(createdAt).getTime();
      const expirationTime = createdTime + EXPIRATION_LIMIT_MS;
      const now = new Date().getTime();
      const difference = expirationTime - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        if (onExpire) onExpire();
        return false;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const pad = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      return true;
    };

    calculateTime();
    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (isExpired) {
    if (isModalVariant) {
      return (
        <View style={styles.modalTimerExpiredContainer}>
          <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
          <Text style={styles.modalTimerExpiredText}>Request Expiration Limit Reached</Text>
        </View>
      );
    }
    return (
      <View style={[styles.timerBadge, styles.timerExpired]}>
        <Ionicons name="time-outline" size={12} color={COLORS.danger} />
        <Text style={styles.timerExpiredText}>Expired</Text>
      </View>
    );
  }

  if (isModalVariant) {
    return (
      <View style={styles.modalTimerActiveContainer}>
        <View style={styles.modalTimerLeftColumn}>
          <Ionicons name="time" size={20} color={COLORS.warning} />
          <Text style={styles.modalTimerActiveLabel}>Time Remaining to Respond:</Text>
        </View>
        <Text style={styles.modalTimerActiveValue}>{timeLeft}</Text>
      </View>
    );
  }

  return (
    <View style={styles.timerBadge}>
      <Ionicons name="time-outline" size={12} color={COLORS.warning} />
      <Text style={styles.timerText}>{timeLeft}</Text>
    </View>
  );
};

const ProviderRequests = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Layout Configurations
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Custom Toast Architecture
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const swipeFlatListRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadProviderBookingsPipeline();
    }, [])
  );

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const loadProviderBookingsPipeline = async () => {
    try {
      setLoading(true);
      const response = await fetchBookings();
      if (response?.data?.success) {
        setRequests(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Pipeline Fetch Error:", error);
      showToast("Failed to pull linked allocation portfolios", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkIsRequestTimedOut = (item) => {
    if (item.bookingStatus !== "requested") return false;
    const createdTime = new Date(item.createdAt).getTime();
    return createdTime + EXPIRATION_LIMIT_MS < new Date().getTime();
  };

  const handleAcceptRequest = async (bookingId) => {
    try {
      setActionLoading(true);
      const response = await acceptOrRejectBooking(bookingId, { action: "accepted" });

      if (response?.data?.success) {
        setRequests(prev =>
          prev.map(b => b._id === bookingId ? { ...b, bookingStatus: "accepted" } : b)
        );
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking(prev => ({ ...prev, bookingStatus: "accepted" }));
        }
        showToast("Job assignment accepted successfully!", "success");
      } else {
        showToast(response?.data?.message || "Failed to accept booking response.", "error");
      }
    } catch (err) {
      console.error("Accept error:", err);
      showToast(err.response?.data?.message || "Error running task transition.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const initRejectWorkflow = (booking) => {
    setSelectedBooking(booking);
    setRejectionReason("");
    setDetailModalVisible(false);
    setRejectModalVisible(true);
  };

  const submitRejectionAPI = async () => {
    if (!selectedBooking) return;
    try {
      setActionLoading(true);
      const response = await acceptOrRejectBooking(selectedBooking._id, {
        action: "rejected",
        rejectionReason: rejectionReason
      });

      if (response?.data?.success) {
        setRequests(prev =>
          prev.map(b => b._id === selectedBooking._id ? { ...b, bookingStatus: "rejected" } : b)
        );
        setRejectModalVisible(false);
        showToast("Booking request declined successfully.", "success");
      } else {
        showToast(response?.data?.message || "Failed to process rejection.", "error");
      }
    } catch (err) {
      console.error("Rejection error:", err);
      showToast(err.response?.data?.message || "Error finalizing runtime rejection.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusLifecycleTransition = async (bookingId, nextStatus) => {
    try {
      setActionLoading(true);
      const response = await updateBookingStatus(bookingId, { status: nextStatus });

      if (response?.data?.success) {
        setRequests(prev =>
          prev.map(b => b._id === bookingId ? { ...b, bookingStatus: nextStatus } : b)
        );
        if (selectedBooking?._id === bookingId) {
          setSelectedBooking(prev => ({ ...prev, bookingStatus: nextStatus }));
        }
        showToast(`Task configuration updated to: ${nextStatus}`, "success");
      } else {
        showToast(response?.data?.message || "Could not execute progress lifecycle step.", "error");
      }
    } catch (err) {
      console.error("Workflow adjustment exception:", err);
      showToast(err.response?.data?.message || "Error modifying lifecycle updates.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const formatBackendDate = (dateString) => {
    try {
      if (!dateString) return "N/A";
      const dateObj = new Date(dateString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch (e) {
      return dateString;
    }
  };

  const onTabPress = (index) => {
    setActiveTab(index);
    swipeFlatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const getStatusBadgeStyle = (status, isTimedOut) => {
    if (isTimedOut) return styles.badgeError;
    switch (status) {
      case 'requested': return styles.badgeWarning;
      case 'accepted': return styles.badgeInfo;
      case 'ongoing': return styles.badgePrimary;
      case 'completed': return styles.badgeSuccess;
      case 'rejected':
      case 'cancelled': return styles.badgeError;
      default: return styles.badgeWarning;
    }
  };

  const getStatusTextStyle = (status, isTimedOut) => {
    if (isTimedOut) return styles.textError;
    switch (status) {
      case 'requested': return styles.textWarning;
      case 'accepted': return styles.textInfo;
      case 'ongoing': return styles.textPrimary;
      case 'completed': return styles.textSuccess;
      case 'rejected':
      case 'cancelled': return styles.textError;
      default: return styles.textWarning;
    }
  };

  const renderRequestItem = ({ item }) => {
    const userAvatar = item.user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150';
    const isTimedOut = checkIsRequestTimedOut(item);
    const displayStatus = isTimedOut ? "cancelled" : item.bookingStatus;

    return (
      <TouchableOpacity
        style={styles.requestCard}
        activeOpacity={0.85}
        onPress={() => openDetailsModal(item)}
      >
        {/* Header Block */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: userAvatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.user?.fullName || "Client Profiling Null"}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.subtext} />
              <Text style={styles.locationText} numberOfLines={1}>
                {item.address?.street}, {item.address?.city}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>₹{item.pricing?.grandTotal?.toLocaleString()}</Text>
            </View>
            {item.bookingStatus === "requested" && (
              <RequestTimer
                createdAt={item.createdAt}
                onExpire={() => setRequests(prev => [...prev])}
              />
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details Context Block */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Execution Target Date</Text>
            <Text style={styles.detailValue}>
              {formatBackendDate(item.schedule?.bookingDate)} at {item.schedule?.startTime}
            </Text>
          </View>
          <View style={styles.metaBadgeRow}>
            <View style={[styles.statusIndicatorBadge, getStatusBadgeStyle(displayStatus, isTimedOut)]}>
              <Text style={[styles.statusIndicatorBadgeText, getStatusTextStyle(displayStatus, isTimedOut)]}>
                {displayStatus}
              </Text>
            </View>
            <View style={styles.durationTag}>
              <Text style={styles.durationTagText}>{item.schedule?.durationDays || 1} Day(s)</Text>
            </View>
          </View>
        </View>

        {/* Card Action Controls Footer Block */}
        {item.bookingStatus === "requested" && !isTimedOut && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => initRejectWorkflow(item)}
              disabled={actionLoading}
            >
              <Text style={styles.rejectButtonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => handleAcceptRequest(item._id)}
              disabled={actionLoading}
            >
              <Text style={styles.acceptButtonText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderListPage = (tabName) => {
    const filteredData = requests.filter((b) => {
      const isTimedOut = checkIsRequestTimedOut(b);

      if (tabName === "Requested") return b.bookingStatus === "requested" && !isTimedOut;
      if (tabName === "Cancelled") return b.bookingStatus === "cancelled" || b.bookingStatus === "rejected" || isTimedOut;

      return b.bookingStatus?.toLowerCase() === tabName.toLowerCase();
    });

    return (
      <View style={{ width, paddingHorizontal: 20 }}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderRequestItem}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="layers-outline" size={44} color={COLORS.subtext} />
            </View>
            <Text style={styles.emptyTitle}>No Allocations Registered</Text>
            <Text style={styles.emptySub}>No active orders matching this layout pipeline were found.</Text>
          </View>
        )}
      </View>
    );
  };

  const activeBookingTimedOut = selectedBooking ? checkIsRequestTimedOut(selectedBooking) : false;
  const targetModalStatus = activeBookingTimedOut ? "cancelled" : selectedBooking?.bookingStatus;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Dynamic Fading Toast Banner Overlay */}
      <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }, toastType === "error" ? styles.toastError : styles.toastSuccess]}>
        <Ionicons
          name={toastType === "error" ? "alert-circle" : "checkmark-circle"}
          size={18}
          color={toastType === "error" ? COLORS.danger : COLORS.primary}
        />
        <Text style={[styles.toastText, toastType === "error" ? styles.toastTextError : styles.toastTextSuccess]}>
          {toastMessage}
        </Text>
      </Animated.View>

      {/* Top Application Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Request Pipeline</Text>
        <TouchableOpacity style={styles.historyBtn} onPress={loadProviderBookingsPipeline} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Multi-Segmented Custom Navigation Scroll Header */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScrollContainer}
        >
          {TABS.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => onTabPress(index)}
                style={styles.tabItem}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
                {isActive && <Animated.View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Syncing live portfolio allocations...</Text>
        </View>
      ) : (
        <FlatList
          ref={swipeFlatListRef}
          data={TABS}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveTab(index);
          }}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => renderListPage(item)}
        />
      )}

      {/* Primary Detail Modal Sheet Engine */}
      {selectedBooking && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitleText}>Task Parameter Matrix</Text>
                  <Text style={styles.modalSubId}>Order Ref: {selectedBooking._id}</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollBody}>

                {/* Premium High Visibility Live Countdown Timer Integration Block */}
                {selectedBooking.bookingStatus === "requested" && (
                  <RequestTimer
                    createdAt={selectedBooking.createdAt}
                    isModalVariant={true}
                    onExpire={() => setRequests(prev => [...prev])}
                  />
                )}

                {/* User Snapshot Block */}
                <View style={styles.modalSectionCard}>
                  <View style={styles.modalFlexRow}>
                    <Image
                      source={{ uri: selectedBooking.user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150' }}
                      style={styles.modalUserImg}
                    />
                    <View style={{ marginLeft: 14, flex: 1 }}>
                      <Text style={styles.modalUserName}>{selectedBooking.user?.fullName}</Text>
                      <Text style={styles.modalEmailTag}>{selectedBooking.user?.email}</Text>
                      <Text style={styles.modalPhoneText}>
                        <Ionicons name="call" size={12} color={COLORS.subtext} /> {selectedBooking.address?.phone || selectedBooking.user?.phone}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Logistics Destination Address */}
                <Text style={styles.sectionLabel}>Target Workspace Address</Text>
                <View style={styles.modalSectionCard}>
                  <Text style={styles.addressBoldLine}>
                    {selectedBooking.address?.houseNumber ? `${selectedBooking.address.houseNumber}, ` : ""}
                    {selectedBooking.address?.street}
                  </Text>
                  <Text style={styles.addressSubLine}>
                    {selectedBooking.address?.city}, {selectedBooking.address?.state} - {selectedBooking.address?.postalCode}
                  </Text>
                  {selectedBooking.address?.deliveryInstructions ? (
                    <View style={styles.instructionBox}>
                      <Ionicons name="alert-circle" size={16} color={COLORS.warning} />
                      <Text style={styles.instructionText}>{selectedBooking.address.deliveryInstructions}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Financial Yield Matrix */}
                <Text style={styles.sectionLabel}>Financial Yield Matrix</Text>
                <View style={styles.modalSectionCard}>
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.pricingLabel}>Base Wage Accrued</Text>
                    <Text style={styles.pricingVal}>₹{selectedBooking.pricing?.basePrice}</Text>
                  </View>
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.pricingLabel}>Duration Multiplier</Text>
                    <Text style={styles.pricingVal}>x {selectedBooking.schedule?.durationDays} Days</Text>
                  </View>
                  {selectedBooking.pricing?.overtimeTotal > 0 && (
                    <View style={styles.pricingItemRow}>
                      <Text style={styles.pricingLabel}>Overtime Premium</Text>
                      <Text style={styles.pricingVal}>+ ₹{selectedBooking.pricing?.overtimeTotal}</Text>
                    </View>
                  )}
                  <View style={styles.modalDivider} />
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.grandTotalLabel}>Net Provider Payout</Text>
                    <Text style={[styles.grandTotalVal, { color: COLORS.primary }]}>₹{selectedBooking.pricing?.grandTotal?.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.pricingItemRow, { marginTop: 12 }]}>
                    <Text style={styles.pricingLabel}>Payment Method: <Text style={{ fontWeight: '700', color: COLORS.secondary }}>{selectedBooking.payment?.method}</Text></Text>
                    <Text style={[styles.detailValue, { fontSize: 13, textTransform: 'uppercase', color: COLORS.warning }]}>
                      {selectedBooking.payment?.status}
                    </Text>
                  </View>
                </View>

                {/* Dynamic Modal Controls Layer */}
                <View style={{ marginBottom: 30 }}>
                  {targetModalStatus === "requested" && (
                    <View style={styles.modalActionRow}>
                      <TouchableOpacity
                        style={[styles.button, styles.rejectButton, { height: 52 }]}
                        onPress={() => initRejectWorkflow(selectedBooking)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.rejectButtonText}>Decline Request</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.button, styles.acceptButton, { height: 52 }]}
                        onPress={async () => {
                          await handleAcceptRequest(selectedBooking._id);
                          setDetailModalVisible(false);
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.acceptButtonText}>Accept Job</Text>}
                      </TouchableOpacity>
                    </View>
                  )}

                  {targetModalStatus === "accepted" && (
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton, { height: 52 }]}
                      onPress={async () => {
                        await handleStatusLifecycleTransition(selectedBooking._id, "ongoing");
                        setDetailModalVisible(false);
                      }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.acceptButtonText}>Start Service Deployment</Text>}
                    </TouchableOpacity>
                  )}

                  {targetModalStatus === "ongoing" && (
                    <View style={styles.ongoingActiveBanner}>
                      <Ionicons name="construct" size={20} color={COLORS.info} />
                      <Text style={styles.ongoingActiveBannerText}>Service Deployment In Progress (Ongoing)</Text>
                    </View>
                  )}

                  {targetModalStatus === "completed" && (
                    <View style={styles.completedSuccessBanner}>
                      <Ionicons name="checkmark-done-circle" size={20} color={COLORS.primary} />
                      <Text style={styles.completedSuccessBannerText}>Assignment Fully Settled & Finished</Text>
                    </View>
                  )}

                  {targetModalStatus === "cancelled" && (
                    <View style={styles.rejectedBanner}>
                      <Ionicons name="close-circle" size={20} color={COLORS.danger} />
                      <Text style={styles.rejectedBannerText}>
                        {activeBookingTimedOut ? "Cancelled: No response from Provider" : (selectedBooking.cancellation?.reason || "This task arrangement has been dropped.")}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Absolute Layer Rejection Sub-Form Sheet */}
      {selectedBooking && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={rejectModalVisible}
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: height * 0.52 }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitleText, { color: COLORS.danger }]}>Decline Allocation</Text>
                  <Text style={styles.modalSubId}>Provide dynamic feedback for dashboard cancellation logging</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setRejectModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalScrollBody}>
                <Text style={styles.inputLabel}>Reason for Rejection</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="e.g., Scheduling conflict, out of coverage zone, time constraints..."
                  placeholderTextColor={COLORS.subtext}
                  multiline
                  numberOfLines={4}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  maxLength={300}
                />

                <View style={[styles.modalFlexRow, { marginTop: 24, gap: 12 }]}>
                  <TouchableOpacity
                    style={styles.cancelModalCloseBtn}
                    onPress={() => setRejectModalVisible(false)}
                    disabled={actionLoading}
                  >
                    <Text style={styles.cancelModalCloseBtnText}>Go Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelModalSubmitBtn}
                    onPress={submitRejectionAPI}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.cancelModalSubmitBtnText}>Decline Permanently</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 10,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: "#ECFDF5",
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  toastError: {
    backgroundColor: "#FEF2F2",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  toastText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1,
  },
  toastTextSuccess: { color: COLORS.primary },
  toastTextError: { color: COLORS.danger },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 15 : 45,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  historyBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBarWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBarScrollContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  tabItem: {
    paddingVertical: 14,
    marginRight: 24,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subtext,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  badge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 10,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.subtext,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.subtext,
    marginLeft: 4,
    fontWeight: '500',
    paddingRight: 10,
  },
  priceBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginTop: 4,
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.warning,
    fontVariant: ['tabular-nums'],
  },
  timerExpired: { backgroundColor: COLORS.dangerLight },
  timerExpiredText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  detailsRow: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusIndicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusIndicatorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  durationTag: {
    backgroundColor: "rgba(15, 23, 42, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  badgeWarning: { backgroundColor: COLORS.warningLight },
  textWarning: { color: COLORS.warning },
  badgeInfo: { backgroundColor: COLORS.infoLight },
  textInfo: { color: COLORS.info },
  badgePrimary: { backgroundColor: COLORS.primaryLight },
  textPrimary: { color: COLORS.primary },
  badgeSuccess: { backgroundColor: "rgba(8, 179, 106, 0.12)" },
  textSuccess: { color: COLORS.primary },
  badgeError: { backgroundColor: COLORS.dangerLight },
  textError: { color: COLORS.danger },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  rejectButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rejectButtonText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.88,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleText: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  modalSubId: {
    fontSize: 11,
    color: COLORS.subtext,
    fontWeight: '500',
    marginTop: 2,
  },
  modalCloseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalSectionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalFlexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalUserImg: {
    width: 54,
    height: 54,
    borderRadius: 12,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  modalEmailTag: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 1,
  },
  modalPhoneText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 3,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressBoldLine: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  addressSubLine: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 2,
    fontWeight: '500',
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '600',
    flex: 1,
  },
  pricingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  pricingLabel: {
    fontSize: 13,
    color: COLORS.subtext,
    fontWeight: '500',
  },
  pricingVal: {
    fontSize: 13,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  modalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  grandTotalVal: {
    fontSize: 17,
    fontWeight: '900',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ongoingActiveBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoLight,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)",
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ongoingActiveBannerText: {
    fontSize: 13,
    color: COLORS.info,
    fontWeight: '700',
  },
  completedSuccessBanner: {
    flexDirection: 'row',
    backgroundColor: "rgba(8, 179, 106, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(8, 179, 106, 0.15)",
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  completedSuccessBannerText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  rejectedBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  rejectedBannerText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  reasonInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    height: 100,
    textAlignVertical: 'top',
  },
  cancelModalCloseBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelModalCloseBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  cancelModalSubmitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
  },
  cancelModalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Premium Layout Styles Specific to Modal Variance Countdowns
  modalTimerActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warningLight,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  modalTimerLeftColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTimerActiveLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  modalTimerActiveValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.warning,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  modalTimerExpiredContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerLight,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 6,
  },
  modalTimerExpiredText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.danger,
  }
});

export default ProviderRequests;