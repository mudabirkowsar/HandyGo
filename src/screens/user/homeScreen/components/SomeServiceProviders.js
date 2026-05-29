import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { fetchAllProviders } from "../../../../../api/UserAPI";

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

const SomeServiceProviders = () => {
  const navigation = useNavigation();

  // State definitions for loading and live provider array data strings
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getProvidersList = async () => {
      try {
        const response = await fetchAllProviders();
        if (response.data && response.data.success) {
          setProviders(response.data.providers || []);
        }
      } catch (error) {
        console.log("FETCH ALL PROVIDERS COMPONENT ERROR:", error?.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getProvidersList();
  }, []);

  // Limit display viewport layout processing to the first 6 records
  const displayProviders = providers.slice(0, 6);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={[styles.subtitle, { marginTop: 8 }]}>Loading specialists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Specialists</Text>
          <Text style={styles.subtitle}>Highly rated independent pros</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {displayProviders.map((item) => (
          <TouchableOpacity 
            key={item._id} 
            style={styles.card} 
            activeOpacity={0.9}
            onPress={() => navigation.navigate("SingleManDetail", { provider: item })}
          >
            {/* Verified Badge conditionally rendered based on verification status key */}
            {item.verificationStatus === "approved" && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              </View>
            )}

            <Image 
              source={{ uri: item.profileImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150" }} 
              style={styles.avatar} 
            />
            
            <Text style={styles.name} numberOfLines={1}>{item.fullName}</Text>
            
            {/* Safely extracts name if object category relation populates */}
            <Text style={styles.job} numberOfLines={1}>
              {item.serviceCategory?.name || "General Specialist"}
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.statText}>{item.averageRating || 0}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statText}>{item.experienceYears || 0} yrs</Text>
              </View>
            </View>

            {/* Display starting price if services array data elements exist */}
            <Text style={styles.priceText}>
              Starts at ₹{item.services?.[0]?.price || "299"}
            </Text>

            <View style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>View Profile</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.subtext,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  scrollList: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: 170,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 15,
    marginBottom: 5,
    marginRight: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 2,
  },
  job: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
    marginLeft: 3,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.subtext,
    marginBottom: 12,
  },
  bookBtn: {
    width: "100%",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
});

export default SomeServiceProviders;