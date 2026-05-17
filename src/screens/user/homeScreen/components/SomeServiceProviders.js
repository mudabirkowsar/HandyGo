import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
// Ensure the import name matches the variable used in your .map()
import { singleProviders } from "../../../../data/data";

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

  // Limits the display to only the first 6 items
  const displayProviders = (singleProviders || []).slice(0, 6);

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
            {/* Verified Badge conditionally rendered */}
            {item.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              </View>
            )}

            <Image 
              source={{ uri: item.profileImage || "https://via.placeholder.com/150" }} 
              style={styles.avatar} 
            />
            
            <Text style={styles.name} numberOfLines={1}>{item.fullName}</Text>
            <Text style={styles.job}>{item.serviceCategory}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.statText}>{item.averageRating}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statText}>{item.experience} yrs</Text>
              </View>
            </View>

            {/* Display starting price if services exist */}
            <Text style={styles.priceText}>
              Starts at ₹{item.services?.[0]?.price || "0"}
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