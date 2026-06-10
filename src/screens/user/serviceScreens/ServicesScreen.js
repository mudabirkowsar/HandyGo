import React, { useState } from "react";
import { 
  View, 
  Text,
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  StatusBar,
  TouchableOpacity
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ServicePageHeader from "./components/ServicePageHeader";
import SingleProvider from "./singleProvider/SingleProvider";
import Companies from "./company/Companies";

const COLORS = {
  background: "#F8FAFC",
  white: "#FFFFFF",
  primary: "#08B36A",
  secondary: "#0F172A",
  subtext: "#6B7280",
  border: "#E5E7EB",
};

export default function ServicesScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Multiple"); // "Multiple" or "Single"

  // Structural dynamic segments passed cleanly down the layout tree
  const SCREEN_SECTIONS = [
    { 
      id: "active-grid-content", 
      component: activeTab === "Multiple" ? <Companies /> : <SingleProvider /> 
    }
  ];

  const renderMainSectionHeader = () => (
    <View style={styles.tabSectionHeaderContainer}>
      {/* Premium Tab Bar Segment */}
      <View style={styles.headerRow}>
        <View style={styles.sideNav}>
          <TouchableOpacity 
            onPress={() => setActiveTab("Multiple")}
            style={[styles.navBtn, activeTab === "Multiple" && styles.activeNavBtn]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name="account-group" 
              size={16} 
              color={activeTab === "Multiple" ? COLORS.white : COLORS.subtext} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.navBtnText, activeTab === "Multiple" && styles.navBtnActive]}>
              Book Team (Multi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab("Single")}
            style={[styles.navBtn, activeTab === "Single" && styles.activeNavBtn]}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="person-outline" 
              size={14} 
              color={activeTab === "Single" ? COLORS.white : COLORS.subtext} 
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.navBtnText, activeTab === "Single" && styles.navBtnActive]}>
              Single Provider
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.sectionSubtitle}>
        {activeTab === "Multiple" 
          ? "Book full vetted agency crews to work at the same time" 
          : "Hire individual verified service professionals near you"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        <FlatList
          data={SCREEN_SECTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => item.component}
          ListHeaderComponent={
            <>
              <ServicePageHeader />
              {renderMainSectionHeader()}
            </>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 60, 
  },
  tabSectionHeaderContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 12,
    width: "100%",
  },
  sideNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#E2E8F0",
    padding: 4,
    borderRadius: 16,
    width: "100%",
    justifyContent: "space-between",
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeNavBtn: {
    backgroundColor: COLORS.secondary,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.subtext,
  },
  navBtnActive: {
    color: COLORS.white,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginBottom: 8,
    fontWeight: "500",
  },
});