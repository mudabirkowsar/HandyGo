import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  subtext: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
  background: "#F8FAFC", // Matches your body layout context
  inputBg: "#F1F5F9",    // Sleek background for the text inputs
};

const SearchComponent = ({ onSearchTextChange, onFilterPress }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleClearInput = () => {
    setSearchQuery("");
    if (onSearchTextChange) onSearchTextChange("");
  };

  const handleChangeText = (text) => {
    setSearchQuery(text);
    if (onSearchTextChange) onSearchTextChange(text);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.searchBarRow}>
        {/* Input Wrapper Field */}
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color={COLORS.subtext}
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.textInput}
            placeholder="Search premium tools, equipment, kits..."
            placeholderTextColor={COLORS.subtext}
            value={searchQuery}
            onChangeText={handleChangeText}
            returnKeyType="search"
            autoCorrect={false}
          />

          {/* Dynamic Clear Button: Appears only when user logs text */}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearInput}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.subtext}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Filter Configurations Adjustment Action Button */}
        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.8}
          onPress={onFilterPress}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: "400",
    paddingVertical: 0, // Eliminates hidden OS specific padding quirks on Android nodes
  },
  clearButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});

export default SearchComponent;