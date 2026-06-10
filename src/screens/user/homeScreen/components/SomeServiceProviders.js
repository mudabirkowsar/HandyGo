import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchAllProviders } from "../../../../../api/UserAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
// Perfect dynamic column width calculation accounting for padding and gap metrics
const CARD_WIDTH = (width - 48) / 2; 

const COLORS = {
  primary: "#08B36A",
  primaryLight: "#E6F7F0",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#1E293B",
  subtext: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
  danger: "#EF4444",
  warning: "#F59E0B",
  offline: "#94A3B8",
};

const SomeServiceProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success", 
    title: "",
    message: "",
  });

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const lng = await AsyncStorage.getItem('userLongitude');
        const lat = await AsyncStorage.getItem('userLatitude');
        loadTopProviders(lng, lat, "");
      } catch (err) {
        loadTopProviders(null, null, "");
      }
    };
    loadProviders();
  }, []);

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadTopProviders = async (lng, lat, serviceProvided = "") => {
    setLoading(true);
    try {
      const queryParams = {};
      if (lng) queryParams.lng = lng;
      if (lat) queryParams.lat = lat;
      if (serviceProvided) queryParams.serviceProvided = serviceProvided;

      const response = await fetchAllProviders(queryParams);
      if (response?.data?.success) {
        const allData = response.data.data || [];
        setProviders(allData.slice(0, 4));
      }
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error?.response?.data?.message || "Failed to load nearby providers."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.headerTitleRow}>
        <Text style={styles.sectionTitle}>Featured Experts</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionSubtitle}>Top certified experts active near your area</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <FlatList
        data={providers}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} 
        nestedScrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.subtext} />
            <Text style={styles.emptyText}>No service providers found nearby.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const initials = item.fullName ? item.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "P";
          
          return (
            <TouchableOpacity
              style={styles.providerCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate("ProviderDetail", { providerId: item._id })}
            >
              {/* Media Container Top Block */}
              <View style={styles.imageContainer}>
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={styles.profilePic} />
                ) : (
                  <View style={styles.fallbackAvatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
                
                {/* Status Indicator Overlays */}
                <View style={[styles.statusBadge, { backgroundColor: item.isOnline ? COLORS.primary : COLORS.offline }]}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{item.isOnline ? "Online" : "Offline"}</Text>
                </View>

                {/* Distance Badge */}
                <View style={styles.distanceBadge}>
                  <Ionicons name="location" size={11} color={COLORS.white} />
                  <Text style={styles.distanceText}>
                    {item.distanceFromUserKm ? item.distanceFromUserKm.toFixed(1) : "0.0"} km
                  </Text>
                </View>
              </View>

              {/* Information Content Block */}
              <View style={styles.infoBlock}>
                <Text style={styles.providerName} numberOfLines={1}>
                  {item.fullName}
                </Text>
                
                <View style={styles.tagContainer}>
                  <Text style={styles.categoryTag} numberOfLines={1}>
                    {item.serviceProvided}
                  </Text>
                </View>

                {item.bio ? (
                  <Text style={styles.bioText} numberOfLines={2}>
                    {item.bio}
                  </Text>
                ) : (
                  <Text style={styles.bioPlaceholder} numberOfLines={2}>
                    Professional specialist ready to assist you.
                  </Text>
                )}

                <View style={styles.divider} />

                {/* Rating & Rate Metrics Row */}
                <View style={styles.metricsRow}>
                  <View style={styles.ratingGroup}>
                    <Ionicons name="star" size={13} color={COLORS.warning} />
                    <Text style={styles.ratingText}>
                      {item.averageRating && item.averageRating > 0 ? item.averageRating.toFixed(1) : "New"}
                    </Text>
                    {item.totalReviews > 0 && (
                      <Text style={styles.reviewsText}>({item.totalReviews})</Text>
                    )}
                  </View>

                  <Text style={styles.priceText} numberOfLines={1}>
                    ₹{item.perDayPrice || "—"}
                    {item.perDayPrice > 0 && <Text style={styles.perDayLabel}>/d</Text>}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Alert Component */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              {alertConfig.type === "success" ? (
                <Ionicons name="checkmark-circle" size={54} color={COLORS.primary} />
              ) : (
                <Ionicons name="alert-circle" size={54} color={COLORS.danger} />
              )}
            </View>

            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            <TouchableOpacity
              style={styles.alertPrimaryButton}
              onPress={() => setAlertVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.alertPrimaryButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SomeServiceProviders;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 40,
  },
  listContainer: {
    paddingVertical: 16,
  },
  headerSection: {
    marginBottom: 16,
    width: "100%",
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 4,
  },
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  providerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    width: CARD_WIDTH,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  profilePic: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallbackAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EFF6FF", // Modern soft blue default gradient flavor
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3B82F6",
    letterSpacing: 0.5,
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  distanceBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 3,
  },
  infoBlock: {
    padding: 12,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  tagContainer: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 8,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "capitalize",
  },
  bioText: {
    fontSize: 12,
    color: COLORS.subtext,
    lineHeight: 16,
    height: 32, // Accommodates exactly 2 layout calculation strings safely
  },
  bioPlaceholder: {
    fontSize: 12,
    color: COLORS.subtext,
    fontStyle: "italic",
    lineHeight: 16,
    height: 32,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 11,
    color: COLORS.subtext,
    marginLeft: 2,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  perDayLabel: {
    fontSize: 11,
    fontWeight: "400",
    color: COLORS.subtext,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    width: width - 32,
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    elevation: 5,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  alertIconContainer: {
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  alertPrimaryButton: {
    backgroundColor: COLORS.secondary,
    width: "100%",
    maxWidth: 140,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  alertPrimaryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 15,
  },
});