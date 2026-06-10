import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchCategories } from "../../../../../api/UserAPI";

const { width } = Dimensions.get("window");

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
};

// Static mapping for icons based on your API category names
const ICON_MAP = {
  "Home Cleaning": "brush-outline",
  "Painting": "color-palette-outline",
  "Carpentry": "construct-outline",
  "Electrician": "flash-outline",
  "Plumbing": "water-outline",
  "Repair": "hammer-outline",
  "Laundry": "shirt-outline",
  "Moving": "bus-outline",
  "default": "grid-outline",
};

const HomeServices = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetchCategories();
      if (response.data && response.data.success) {
        // FIX: Forces the component to only ever load and display exactly 6 items
        const rawData = response.data.data || [];
        setCategories(rawData.slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem} activeOpacity={0.75}>
      <View style={styles.iconContainer}>
        {/* Mapping static icons to the API name */}
        <Ionicons 
          name={ICON_MAP[item.name] || ICON_MAP["default"]} 
          size={24} 
          color={COLORS.primary} 
        />
      </View>
      <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Our Services</Text>
        <TouchableOpacity activeOpacity={0.6}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={4}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.rowWrapper} // Ensures clean, professional alignment across rows
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  loaderContainer: {
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 4,
  },
  rowWrapper: {
    justifyContent: "flex-start", // Keeps item layouts perfectly bound in uniform grids
    gap: 0,
  },
  serviceItem: {
    width: (width - 40) / 4, // Splits screen dynamically into clean columns
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});

export default HomeServices;