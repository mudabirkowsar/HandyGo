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
// Assuming UserAPI.js is in your project structure
// import { fetchCategories } from "./UserAPI"; 

const { width } = Dimensions.get("window");

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
      // Accessing response.data based on your JSON structure
      if (response.data && response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        {/* Mapping static icons to the API name */}
        <Ionicons 
          name={ICON_MAP[item.name] || ICON_MAP["default"]} 
          size={26} 
          color={COLORS.primary} 
        />
      </View>
      <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* FIXED: Changed div to View */}
      <View style={styles.header}>
        <Text style={styles.title}>Our Services</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={4}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  listContainer: {
    justifyContent: "space-between",
  },
  serviceItem: {
    width: (width - 40) / 4,
    alignItems: "center",
    marginBottom: 22,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
});

export default HomeServices;
