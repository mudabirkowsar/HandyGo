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
const CARD_WIDTH = (width - 44) / 2; 

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  danger: "#EF4444",
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
      <Text style={styles.sectionTitle}>Featured Providers</Text>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.subtext} />
            <Text style={styles.emptyText}>No service providers found nearby.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.providerCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ProviderDetail", { providerId: item._id })}
          >
            <View style={styles.imageContainer}>
              {item.profileImage ? (
                <Image source={{ uri: item.profileImage }} style={styles.profilePic} />
              ) : (
                <View style={[styles.profilePic, styles.fallbackAvatar]}>
                  <Text style={styles.avatarText}>
                    {item.fullName ? item.fullName.charAt(0).toUpperCase() : "P"}
                  </Text>
                </View>
              )}
              {item.isOnline && <View style={styles.onlineBadge} />}

              <View style={styles.distanceBadge}>
                <Ionicons name="location" size={10} color={COLORS.white} />
                <Text style={styles.distanceText}>
                  {item.distanceFromUserKm ? item.distanceFromUserKm.toFixed(1) : "0.0"} km
                </Text>
              </View>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.providerName} numberOfLines={1}>
                {item.fullName}
              </Text>
              <Text style={styles.categoryTag} numberOfLines={1}>
                {item.serviceProvided}
              </Text>

              {item.bio ? (
                <Text style={styles.bioText} numberOfLines={1}>
                  {item.bio}
                </Text>
              ) : (
                <Text style={styles.bioPlaceholder} numberOfLines={1}>
                  No bio shared yet
                </Text>
              )}

              <View style={styles.divider} />

              <View style={styles.metricsRow}>
                <View style={styles.ratingGroup}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {item.averageRating && item.averageRating > 0 ? item.averageRating.toFixed(1) : "New"}
                  </Text>
                  {item.totalReviews > 0 && (
                    <Text style={styles.reviewsText}>({item.totalReviews})</Text>
                  )}
                </View>

                <Text style={styles.priceText} numberOfLines={1}>
                  ₹{item.perDayPrice}
                  <Text style={styles.perDayLabel}>/d</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

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
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 20,
    marginTop: 4,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 3,
  },
  rowWrapper: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  providerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: "100%",
    height: 110,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  profilePic: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fallbackAvatar: {
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.subtext,
  },
  onlineBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 2,
  },
  distanceBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  distanceText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 3,
  },
  infoBlock: {
    padding: 12,
  },
  providerName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  bioText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 4,
    height: 16,
  },
  bioPlaceholder: {
    fontSize: 12,
    color: COLORS.border,
    fontStyle: "italic",
    marginTop: 4,
    height: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
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
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 3,
  },
  reviewsText: {
    fontSize: 11,
    color: COLORS.subtext,
    marginLeft: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  perDayLabel: {
    fontSize: 10,
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