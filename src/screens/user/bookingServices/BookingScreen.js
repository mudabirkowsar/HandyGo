// screens/BookingScreen.js
import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
  TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Import your live API calls
import { fetchUserBookings, cancelBooking, updateStatus, submitBookingReview } from '../../../../api/UserAPI';

const { width, height } = Dimensions.get("window");

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
  error: "#EF4444",
  errorLight: "rgba(239, 68, 68, 0.08)",
  warning: "#F59E0B",
  warningLight: "rgba(245, 158, 11, 0.08)",
  info: "#3B82F6",
  infoLight: "rgba(59, 130, 246, 0.08)"
};

const TABS = ["Upcoming", "Accepted", "Ongoing", "Completed", "Cancelled"];

const BookingScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals UI States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Input Form Parameters
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Submission Loaders
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Custom Toast Notification States
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);

  useFocusEffect(
    ...[useCallback(() => {
      loadBookings();
    }, [])]
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

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetchUserBookings();
      if (response?.data?.success) {
        setBookings(response.data.data);
      } else if (Array.isArray(response?.data)) {
        setBookings(response.data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error extracting bookings:", error);
      showToast("Could not fetch active history data profiles.", "error");
    } finally {
      setLoading(false);
    }
  };

  const initCancelWorkflow = () => {
    setDetailModalVisible(false);
    setCancelReason("");
    setCancelModalVisible(true);
  };

  const initReviewWorkflow = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(false);
    setRatingScore(5);
    setReviewComment("");
    setReviewModalVisible(true);
  };

  const submitCancellationAPI = async () => {
    if (!selectedBooking) return;
    try {
      setSubmittingCancel(true);
      const response = await cancelBooking(selectedBooking._id, cancelReason);
      if (response?.data?.success) {
        setBookings(prev =>
          prev.map(b => b._id === selectedBooking._id ? { ...b, bookingStatus: "cancelled" } : b)
        );
        setCancelModalVisible(false);
        showToast("Booking cancelled successfully", "success");
      } else {
        showToast(response?.data?.message || "Failed to terminate booking transaction.", "error");
      }
    } catch (err) {
      console.error("Cancellation exception:", err);
      showToast(err.response?.data?.message || "Error processing terminal updates.", "error");
    } finally {
      setSubmittingCancel(false);
    }
  };

  const submitCompletionAPI = async () => {
    if (!selectedBooking) return;

    // Safety check: If it's a digital payment that hasn't been paid yet, route to Payment Screen
    if (selectedBooking.payment?.method !== "COD" && selectedBooking.payment?.status !== "paid") {
      setDetailModalVisible(false);
      navigation.navigate("ProviderPaymentScreen", { booking: selectedBooking });
      return;
    }

    try {
      setSubmittingComplete(true);
      const response = await updateStatus(selectedBooking._id);

      if (response?.data?.success) {
        setBookings(prev =>
          prev.map(b => b._id === selectedBooking._id ? {
            ...b,
            bookingStatus: "completed",
            payment: { ...b.payment, status: b.payment.method === "COD" ? "paid" : b.payment.status }
          } : b)
        );
        setDetailModalVisible(false);

        setTimeout(() => {
          initReviewWorkflow(selectedBooking);
        }, 600);

      } else {
        showToast(response?.data?.message || "Failed to update lifecycle status.", "error");
      }
    } catch (err) {
      console.error("Completion error exception:", err);
      showToast(err.response?.data?.message || "Error processing task conclusion updates.", "error");
    } finally {
      setSubmittingComplete(false);
    }
  };

  const submitReviewFormAPI = async () => {
    if (!selectedBooking) return;
    try {
      setSubmittingReview(true);
      const response = await submitBookingReview(selectedBooking._id, {
        rating: ratingScore,
        comment: reviewComment
      });

      if (response?.data?.success) {
        setBookings(prev =>
          prev.map(b => b._id === selectedBooking._id ? { ...b, isReviewed: true } : b)
        );
        setReviewModalVisible(false);
        showToast("Thank you for your valuable feedback!", "success");
      } else {
        showToast(response?.data?.message || "Could not save your review feedback.", "error");
      }
    } catch (err) {
      console.error("Review creation exception:", err);
      showToast(err.response?.data?.message || "Failed to connect to review engine.", "error");
    } finally {
      setSubmittingReview(false);
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

  // FIXED: Removed the buggy scrollToIndex engine call to bypass the offscreen indexing crash completely
  const onTabPress = (index) => {
    setActiveTab(index);
  };

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const renderBookingCard = (item) => {
    const providerImage = item.provider?.profileImage || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200";

    const getStatusStyles = (status) => {
      if (status === "cancelled" || status === "rejected") return { badge: styles.badgeError, text: styles.textError };
      if (status === "completed") return { badge: styles.badgeSuccess, text: styles.textSuccess };
      if (status === "ongoing") return { badge: styles.badgeInfo, text: styles.textInfo };
      return { badge: styles.badgeWarning, text: styles.textWarning };
    };

    const statusStyle = getStatusStyles(item.bookingStatus);

    return (
      <TouchableOpacity
        key={item._id}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => openDetailsModal(item)}
      >
        <View style={styles.cardTop}>
          <Image source={{ uri: providerImage }} style={styles.serviceImg} />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.serviceName}>{item.provider?.serviceProvided || "Professional Service"}</Text>
            <Text style={styles.providerName}>{item.provider?.fullName || "Assigned Provider"}</Text>

            <View style={styles.badgeWrapperRow}>
              <View style={[styles.statusIndicatorBadge, statusStyle.badge]}>
                <Text style={[styles.statusIndicatorBadgeText, statusStyle.text]}>
                  {item.bookingStatus}
                </Text>
              </View>
              {item.schedule?.requiresOvertime && (
                <View style={styles.overtimeBadge}>
                  <Text style={styles.overtimeBadgeText}>+{item.schedule.overtimeHours}h Overtime</Text>
                </View>
              )}
              <View style={styles.durationBadge}>
                <Text style={styles.durationBadgeText}>{item.schedule?.durationDays || 1} Days</Text>
              </View>
            </View>
          </View>
          <Text style={styles.priceText}>₹{item.pricing?.grandTotal?.toLocaleString() || "0"}</Text>
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.cardBottom}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{formatBackendDate(item.schedule?.bookingDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.metaText}>{item.schedule?.startTime || "10:00 AM"}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderListPage = (tabName) => {
    const filteredData = bookings.filter((b) => {
      if (tabName === "Upcoming") return b.bookingStatus === "requested";
      if (tabName === "Accepted") return b.bookingStatus === "accepted";
      if (tabName === "Ongoing") return b.bookingStatus === "ongoing";
      if (tabName === "Completed") return b.bookingStatus === "completed";
      if (tabName === "Cancelled") return b.bookingStatus === "cancelled" || b.bookingStatus === "rejected";
      return false;
    });

    return (
      <View style={{ width, paddingHorizontal: 20 }}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => renderBookingCard(item)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
          />
        ) : (
          /* UPDATED: Beautiful, premium style wrapper block for the empty collection state scenario */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-clear-outline" size={38} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyText}>No {tabName.toLowerCase()} bookings</Text>
            <Text style={styles.emptySubtext}>You don't have any appointments listed under this category section right now.</Text>
          </View>
        )}
      </View>
    );
  };

  const isBookingCancelable = selectedBooking?.bookingStatus === "requested" ||
    selectedBooking?.bookingStatus === "accepted";

  const isBookingOngoing = selectedBooking?.bookingStatus === "ongoing";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Dynamic Fading Toast Overlay Engine */}
      <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }, toastType === "error" ? styles.toastError : styles.toastSuccess]}>
        <Ionicons
          name={toastType === "error" ? "alert-circle" : "checkmark-circle"}
          size={18}
          color={toastType === "error" ? COLORS.error : COLORS.primary}
        />
        <Text style={[styles.toastText, toastType === "error" ? styles.toastTextError : styles.toastTextSuccess]}>
          {toastMessage}
        </Text>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My <Text style={{ color: COLORS.primary }}>Bookings</Text></Text>
        <TouchableOpacity style={styles.historyBtn} onPress={loadBookings} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Premium Tab Bar Wrapper Line Layout */}
      <View style={styles.tabBarContainer}>
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
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic Content Switching Engine Layout Node */}
      {loading ? (
        <View style={styles.loadingCenterContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingSyncText}>Syncing booking data history...</Text>
        </View>
      ) : (
        /* Render only the currently highlighted tab list module to stay performant & completely remove horizontal scrolling dependencies */
        <View style={styles.pageDisplayWrapper}>
          {renderListPage(TABS[activeTab])}
        </View>
      )}

      {/* Detail Modal Engine */}
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
                  <Text style={styles.modalTitleText}>Booking Details</Text>
                  <Text style={styles.modalSubId}>ID: {selectedBooking._id}</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollBody}>
                {/* Section 1: Provider Information */}
                <View style={styles.modalSectionCard}>
                  <View style={styles.modalFlexRow}>
                    <Image
                      source={{ uri: selectedBooking.provider?.profileImage || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=200" }}
                      style={styles.modalProviderImg}
                    />
                    <View style={{ marginLeft: 14, flex: 1 }}>
                      <Text style={styles.modalProviderName}>{selectedBooking.provider?.fullName}</Text>
                      <Text style={styles.modalServiceTag}>{selectedBooking.provider?.serviceProvided}</Text>
                      <Text style={styles.modalPhoneText}>
                        <Ionicons name="call" size={12} color={COLORS.subtext} /> {selectedBooking.provider?.phone}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Section 2: Address Parameters */}
                <Text style={styles.sectionLabel}>Service Address</Text>
                <View style={styles.modalSectionCard}>
                  <Text style={styles.addressBoldLine}>
                    {selectedBooking.address?.houseNumber ? `${selectedBooking.address.houseNumber}, ` : ""}
                    {selectedBooking.address?.street}
                  </Text>
                  <Text style={styles.addressSubLine}>
                    {selectedBooking.address?.city}, {selectedBooking.address?.state} - {selectedBooking.address?.postalCode}
                  </Text>
                  <Text style={styles.addressSubLine}>{selectedBooking.address?.country}</Text>

                  {selectedBooking.address?.deliveryInstructions ? (
                    <View style={styles.instructionBox}>
                      <Ionicons name="information-circle" size={16} color={COLORS.warning} />
                      <Text style={styles.instructionText}>{selectedBooking.address.deliveryInstructions}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Section 3: Pricing Breakdown Matrix */}
                <Text style={styles.sectionLabel}>Payment & Bill Details</Text>
                <View style={styles.modalSectionCard}>
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.pricingLabel}>Base Service Price</Text>
                    <Text style={styles.pricingVal}>₹{selectedBooking.pricing?.basePrice}</Text>
                  </View>
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.pricingLabel}>Duration Factor</Text>
                    <Text style={styles.pricingVal}>x {selectedBooking.schedule?.durationDays} Days</Text>
                  </View>
                  {selectedBooking.pricing?.overtimeTotal > 0 && (
                    <View style={styles.pricingItemRow}>
                      <Text style={styles.pricingLabel}>Overtime Charges</Text>
                      <Text style={styles.pricingVal}>₹{selectedBooking.pricing?.overtimeTotal}</Text>
                    </View>
                  )}
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.pricingLabel}>Platform Fee</Text>
                    <Text style={styles.pricingVal}>₹{selectedBooking.pricing?.platformFee}</Text>
                  </View>
                  <View style={styles.modalDivider} />
                  <View style={styles.pricingItemRow}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalVal}>₹{selectedBooking.pricing?.grandTotal?.toLocaleString()}</Text>
                  </View>

                  <View style={styles.modalDivider} />

                  <View style={styles.modalFlexRow}>
                    <View style={styles.metaInfoBadge}>
                      <Text style={styles.metaBadgeLabel}>Method</Text>
                      <Text style={styles.metaBadgeVal}>{selectedBooking.payment?.method}</Text>
                    </View>
                    <View style={styles.metaInfoBadge, { marginLeft: 10 }}>
                      <Text style={styles.metaBadgeLabel}>Payment Status</Text>
                      <Text style={[styles.metaBadgeVal, selectedBooking.payment?.status === "paid" ? { color: COLORS.primary } : { color: COLORS.warning }]}>
                        {selectedBooking.payment?.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {selectedBooking.payment?.transactionId ? (
                    <Text style={styles.transactionText}>Txn ID: {selectedBooking.payment.transactionId}</Text>
                  ) : null}
                </View>

                {isBookingCancelable && (
                  <TouchableOpacity style={styles.modalDetailsCancelBtn} activeOpacity={0.8} onPress={initCancelWorkflow}>
                    <Ionicons name="close-circle" size={16} color={COLORS.error} style={{ marginRight: 6 }} />
                    <Text style={styles.modalDetailsCancelBtnText}>Cancel Booking Request</Text>
                  </TouchableOpacity>
                )}

                {isBookingOngoing && (
                  <TouchableOpacity style={styles.modalDetailsCompleteBtn} activeOpacity={0.8} onPress={submitCompletionAPI} disabled={submittingComplete}>
                    {submittingComplete ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-done-circle" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                        <Text style={styles.modalDetailsCompleteBtnText}>Confirm Job Completion</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {selectedBooking.bookingStatus === "completed" && !selectedBooking.isReviewed && (
                  <TouchableOpacity style={styles.modalDetailsReviewBtn} activeOpacity={0.8} onPress={() => initReviewWorkflow(selectedBooking)}>
                    <Ionicons name="star" size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.modalDetailsReviewBtnText}>Rate Service Experience</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Cancellation Form Modal Engine */}
      {selectedBooking && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={cancelModalVisible}
          onRequestClose={() => setCancelModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: height * 0.55 }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitleText, { color: COLORS.error }]}>Cancel Order</Text>
                  <Text style={styles.modalSubId}>Provide valid reasoning to execute structural rollback</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setCancelModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalScrollBody}>
                <Text style={styles.inputLabel}>Reason for Cancellation</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="e.g., Changed my mind, booked by mistake..."
                  placeholderTextColor={COLORS.subtext}
                  multiline
                  numberOfLines={4}
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  maxLength={200}
                />

                <View style={[styles.modalFlexRow, { marginTop: 12, gap: 12 }]}>
                  <TouchableOpacity style={styles.cancelModalCloseBtn} onPress={() => setCancelModalVisible(false)} disabled={submittingCancel}>
                    <Text style={styles.cancelModalCloseBtnText}>Keep Booking</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.cancelModalSubmitBtn} onPress={submitCancellationAPI} disabled={submittingCancel}>
                    {submittingCancel ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.cancelModalSubmitBtnText}>Confirm Cancel</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Premium Five-Star Provider Rating Modal Engine */}
      {selectedBooking && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={reviewModalVisible}
          onRequestClose={() => setReviewModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: height * 0.65 }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={[styles.modalTitleText, { color: COLORS.primary }]}>Rate Performance</Text>
                  <Text style={styles.modalSubId}>Share your experience with {selectedBooking.provider?.fullName}</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setReviewModalVisible(false)}>
                  <Ionicons name="close" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalScrollBody}>
                <Text style={[styles.inputLabel, { textAlign: 'center', marginBottom: 12 }]}>Tap Stars to Rate</Text>

                <View style={styles.ratingStarRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.7}
                      onPress={() => setRatingScore(star)}
                    >
                      <Ionicons
                        name={star <= ratingScore ? "star" : "star-outline"}
                        size={38}
                        color={star <= ratingScore ? COLORS.warning : COLORS.border}
                        style={{ marginHorizontal: 4 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Write a Review (Optional)</Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Tell us what you liked or what could be improved..."
                  placeholderTextColor={COLORS.subtext}
                  multiline
                  numberOfLines={4}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  maxLength={500}
                />

                <View style={[styles.modalFlexRow, { marginTop: 20, gap: 12 }]}>
                  <TouchableOpacity style={styles.cancelModalCloseBtn} onPress={() => setReviewModalVisible(false)} disabled={submittingReview}>
                    <Text style={styles.cancelModalCloseBtnText}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.cancelModalSubmitBtn, { backgroundColor: COLORS.primary }]} onPress={submitReviewFormAPI} disabled={submittingReview}>
                    {submittingReview ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.cancelModalSubmitBtnText}>Submit Feedback</Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10
  },
  pageDisplayWrapper: {
    flex: 1,
    width: width,
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
  toastTextError: { color: COLORS.error },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
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
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  loadingCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingSyncText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.subtext,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.background,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 14,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: -0.2,
  },
  providerName: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 1,
    fontWeight: '500',
  },
  badgeWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6
  },
  statusIndicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccess: { backgroundColor: COLORS.primaryLight },
  badgeError: { backgroundColor: COLORS.errorLight },
  badgeWarning: { backgroundColor: COLORS.warningLight },
  badgeInfo: { backgroundColor: COLORS.infoLight },
  statusIndicatorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textSuccess: { color: COLORS.primary },
  textError: { color: COLORS.error },
  textWarning: { color: COLORS.warning },
  textInfo: { color: COLORS.info },
  overtimeBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overtimeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  durationBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.04)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
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
    maxHeight: height * 0.85,
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
    fontSize: 20,
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
  modalProviderImg: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  modalProviderName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  modalServiceTag: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  modalPhoneText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  metaInfoBadge: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaBadgeLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  metaBadgeVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 2,
  },
  transactionText: {
    fontSize: 11,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  modalDetailsCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 30,
  },
  modalDetailsCancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.error,
  },
  modalDetailsCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 30,
  },
  modalDetailsCompleteBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  modalDetailsReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 30,
  },
  modalDetailsReviewBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  inputLabel: {
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  cancelModalSubmitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    alignItems: 'center',
  },
  cancelModalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  ratingStarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  /* REDESIGNED: Premium Empty Fallback States Layout Stylesheet */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    width: "100%",
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.secondary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtext: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 24,
  },
});

export default BookingScreen;