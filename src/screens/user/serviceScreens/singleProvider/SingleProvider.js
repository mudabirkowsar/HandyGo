import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchAllProviders } from "../../../../../api/UserAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
// Perfect width math for 2 columns with proper page padding
const CARD_WIDTH = (width - 44) / 2; 

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
  dangerLight: "#FEE2E2",
  warning: "#F59E0B",
  shimmerBase: "#E2E8F0",
};

// Sub-Component: Shimmer Loader for 2-Column Taller Layout
const ShimmerCard = ({ shimmerOpacity }) => (
  <View style={styles.providerCard}>
    <Animated.View style={[styles.imageContainer, { backgroundColor: COLORS.shimmerBase, opacity: shimmerOpacity }]} />
    <View style={styles.infoBlock}>
      <Animated.View style={[styles.shimmerLineShort, { opacity: shimmerOpacity }]} />
      <Animated.View style={[styles.shimmerLineLong, { opacity: shimmerOpacity }]} />
      <Animated.View style={[styles.shimmerLineMedium, { opacity: shimmerOpacity }]} />
      <View style={styles.cardFooter}>
        <Animated.View style={[styles.shimmerFooterLeft, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.shimmerFooterRight, { opacity: shimmerOpacity }]} />
      </View>
    </View>
  </View>
);

const SingleProvider = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const shimmerAnimatedValue = useRef(new Animated.Value(0.3)).current;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimatedValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnimatedValue, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const lng = await AsyncStorage.getItem("userLongitude");
        const lat = await AsyncStorage.getItem("userLatitude");
        loadAllProviders(lng, lat, "");
      } catch (err) {
        loadAllProviders(null, null, "");
      }
    };
    loadProviders();
  }, []);

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadAllProviders = async (lng, lat, serviceProvided = "") => {
    setLoading(true);
    try {
      const queryParams = {};
      if (lng) queryParams.lng = lng;
      if (lat) queryParams.lat = lat;
      if (serviceProvided) queryParams.serviceProvided = serviceProvided;

      const response = await fetchAllProviders(queryParams);
      if (response?.data?.success) {
        setProviders(response.data.data || []);
      }
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error?.response?.data?.message || "Failed to load individual providers."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {loading ? (
        <View style={styles.listContainer}>
          <View style={styles.rowWrapper}>
            <ShimmerCard shimmerOpacity={shimmerAnimatedValue} />
            <ShimmerCard shimmerOpacity={shimmerAnimatedValue} />
          </View>
          <View style={styles.rowWrapper}>
            <ShimmerCard shimmerOpacity={shimmerAnimatedValue} />
            <ShimmerCard shimmerOpacity={shimmerAnimatedValue} />
          </View>
        </View>
      ) : (
        <FlatList
          key={"two-columns"} // Forces dynamic fresh render, entirely fixing the on-the-fly column error
          data={providers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.subtext} />
              <Text style={styles.emptyText}>No individual professionals found nearby.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const initials = item.fullName
              ? item.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "P";

            return (
              <TouchableOpacity
                style={styles.providerCard}
                activeOpacity={0.95}
                onPress={() => navigation.navigate("ProviderDetail", { providerId: item._id })}
              >
                {/* Image Area - Taller vertically for an elongated modern card shape */}
                <View style={styles.imageContainer}>
                  {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} style={styles.profilePic} />
                  ) : (
                    <View style={styles.fallbackAvatar}>
                      <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                  )}

                  {/* Status Overlay */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: item.isOnline ? COLORS.primaryLight : COLORS.dangerLight },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: item.isOnline ? COLORS.primary : COLORS.danger }]}>
                      {item.isOnline ? "Online" : "Offline"}
                    </Text>
                  </View>

                  {/* Floating Rating Badge Overlay */}
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={10} color={COLORS.warning} />
                    <Text style={styles.ratingText}>
                      {item.averageRating && item.averageRating > 0 ? item.averageRating.toFixed(1) : "New"}
                    </Text>
                  </View>
                </View>

                {/* Info Text Area - More spacing makes the length look longer */}
                <View style={styles.infoBlock}>
                  <Text style={styles.categoryTag} numberOfLines={1}>
                    {item.serviceProvided}
                  </Text>

                  <Text style={styles.providerName} numberOfLines={1}>
                    {item.fullName}
                  </Text>

                  <Text style={styles.bioText} numberOfLines={2}>
                    {item.bio || "Professional specialist ready to assist you."}
                  </Text>

                  {/* Distance Indicator Row */}
                  <View style={styles.distanceRow}>
                    <Ionicons name="location-sharp" size={11} color={COLORS.subtext} />
                    <Text style={styles.distanceText}>
                      {/* {item.distanceFromUserKm ? `${item.distanceFromUserKm.toFixed(1)} km away` : "—"} */}
                      {item.distanceFromUserKm}
                    </Text>
                  </View>

                  {item.experienceYears ? (
                    <View style={styles.expBadge}>
                      <Text style={styles.expText}>{`${item.experienceYears} Yrs Experience`}</Text>
                    </View>
                  ) : null}

                  <View style={styles.dividerLine} />

                  {/* Pricing Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceText}>
                        {item.perDayPrice ? `₹${item.perDayPrice}` : "—"}
                        {item.perDayPrice > 0 ? <Text style={styles.perDayLabel}>/d</Text> : null}
                      </Text>
                    </View>

                    <Ionicons name="arrow-forward-circle" size={24} color={COLORS.secondary} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

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

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal:16,
    paddingBottom:20,
  },
  listContainer: {
    padding: 14,
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  providerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: CARD_WIDTH,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  imageContainer: {
    width: "100%",
    height: 155, // Increased vertical length of image
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
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#94A3B8",
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 3,
    elevation: 1,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.secondary,
    marginLeft: 2,
  },
  infoBlock: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  providerName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 4,
  },
  bioText: {
    fontSize: 11,
    color: COLORS.subtext,
    lineHeight: 15,
    marginBottom: 8,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.subtext,
    marginLeft: 3,
  },
  expBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  expText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.border,
    width: "100%",
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  perDayLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.subtext,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    width: width - 28,
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
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
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
  },
  alertPrimaryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 15,
  },
  shimmerLineShort: {
    width: "40%",
    height: 10,
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 4,
    marginBottom: 6,
  },
  shimmerLineLong: {
    width: "85%",
    height: 12,
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 4,
    marginBottom: 6,
  },
  shimmerLineMedium: {
    width: "70%",
    height: 10,
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 4,
    marginBottom: 12,
  },
  shimmerFooterLeft: {
    width: "45%",
    height: 14,
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 4,
  },
  shimmerFooterRight: {
    width: "25%",
    height: 14,
    backgroundColor: COLORS.shimmerBase,
    borderRadius: 4,
  },
});

export default SingleProvider;