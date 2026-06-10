import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  primaryLight: "#E6F7F0",
  secondary: "#0F172A",
  subtext: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
  background: "#F8FAFC",
};


const ServicePageHeader = ({ onSearch, onCategoryChange, onFilterPress }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");


  const handleTextChange = (text) => {
    setSearchQuery(text);
    if (onSearch) onSearch(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) onSearch("");
  };

  return (
    <View style={styles.container}>
      {/* Page Title Section */}
      <View style={styles.titleSection}>
        <View style={styles.titleTextWrapper}>
          <Text style={styles.greetingSubtitle}>Find Specialist</Text>
          <Text style={styles.headerTitle}>
            Explore <Text style={{ color: COLORS.primary }}>Services</Text>
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.filterBtn} 
          activeOpacity={0.7}
          onPress={onFilterPress}
        >
          <Ionicons name="options-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Modern Search Bar Field */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={COLORS.subtext} style={styles.searchIcon} />
        <TextInput
          placeholder="Search for a service..."
          style={styles.searchInput}
          placeholderTextColor={COLORS.subtext}
          value={searchQuery}
          onChangeText={handleTextChange}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={styles.clearIconButton}>
            <Ionicons name="close-circle" size={18} color={COLORS.subtext} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    // paddingTop: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 40,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleTextWrapper: {
    flexDirection: "column",
  },
  greetingSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.subtext,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.secondary,
    letterSpacing: -0.4,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 48,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.secondary,
    fontWeight: "500",
    paddingVertical: 0,
  },
  clearIconButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselContainer: {
    width: width,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10, // Clean layout spacing instead of margin hacks
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeTab: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.subtext,
  },
  activeTabText: {
    color: COLORS.white,
  },
});

export default ServicePageHeader;