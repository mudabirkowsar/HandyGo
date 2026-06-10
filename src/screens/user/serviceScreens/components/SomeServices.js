import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 55) / 2;

const COLORS = {
  primary: "#08B36A",
  primaryLight: "#E6F7F0",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  warning: "#F59E0B",
};

// Expanded Mock Data for Corporate Agencies (Book Multiple Workers)
const CORPORATE_CREWS = [
  { id: "1", name: "CleanCo Solutions", type: "Full Agency", rating: "4.9", price: "₹999/hr", teamSize: "3-6 Crews", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=400&auto=format" },
  { id: "2", name: "FixIt Fast Ltd", type: "Repair Corp", rating: "4.7", price: "₹1,499/hr", teamSize: "2-4 Crews", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format" },
  { id: "3", name: "Green Gardeners", type: "Landscaping", rating: "4.8", price: "₹1,200/hr", teamSize: "3-5 Crews", image: "https://images.unsplash.com/photo-1558905612-25f035309395?q=80&w=400&auto=format" },
  { id: "4", name: "Safe Guard Co.", type: "Security", rating: "4.6", price: "₹2,500/hr", teamSize: "4-8 Crews", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=400&auto=format" },
  { id: "5", name: "Sparkle Windows", type: "Specialist", rating: "4.9", price: "₹750/hr", teamSize: "2-3 Crews", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format" },
  { id: "6", name: "Urban Electric", type: "Agency", rating: "4.7", price: "₹1,899/hr", teamSize: "2-5 Crews", image: "https://images.unsplash.com/photo-1621905252507-b354bc2d18c4?q=80&w=400&auto=format" },
];

// Expanded Mock Data for Independent Solo Providers
const SOLO_PROS = [
  { id: "1", name: "Alex Johnson", type: "Master Plumber", rating: "5.0", price: "₹299/d", experience: "5+ Yrs", image: "https://images.unsplash.com/photo-1540560085022-185e845a10ed?q=80&w=400&auto=format" },
  { id: "2", name: "Sarah Smith", type: "Electrician", rating: "4.8", price: "₹349/d", experience: "3+ Yrs", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format" },
  { id: "3", name: "Marco V.", type: "Painter", rating: "4.9", price: "₹500/d", experience: "8+ Yrs", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format" },
  { id: "4", name: "Elena R.", type: "Housekeeper", rating: "4.7", price: "₹200/d", experience: "4+ Yrs", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format" },
  { id: "5", name: "James Bond", type: "Handyman", rating: "4.8", price: "₹450/d", experience: "6+ Yrs", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format" },
  { id: "6", name: "Priya S.", type: "Wellness", rating: "5.0", price: "₹1,500/d", experience: "7+ Yrs", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format" },
];

const SomeServices = () => {
  const [activeTab, setActiveTab] = useState("Multiple"); // "Multiple" or "Single"

  // Component Renderer 1: Corporate Squad Cards (Multi-worker structure)
  const renderCorporateItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.95}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={[styles.infoOverlayBadge, { backgroundColor: COLORS.primary }]}>
          <MaterialCommunityIcons name="account-group" size={12} color={COLORS.white} />
          <Text style={styles.overlayBadgeText}>{item.teamSize}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.typeText}>{item.type}</Text>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabelText}>Team Rate</Text>
            <Text style={styles.priceValueText}>{item.price}</Text>
          </View>
          <TouchableOpacity style={styles.bookIcon}>
            <Ionicons name="flash" size={13} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Component Renderer 2: Individual Provider Cards (Solo-expert structure)
  const renderSoloItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.95}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color={COLORS.warning} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={[styles.infoOverlayBadge, { backgroundColor: COLORS.secondary }]}>
          <Ionicons name="ribbon-outline" size={11} color={COLORS.white} />
          <Text style={styles.overlayBadgeText}>{item.experience}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.typeText}>{item.type}</Text>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabelText}>Solo Rate</Text>
            <Text style={styles.priceValueText}>{item.price}</Text>
          </View>
          <TouchableOpacity style={[styles.bookIcon, { backgroundColor: COLORS.secondary }]}>
            <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Premium Multi/Single Segment Tab Toggle Navigation */}
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

      {/* Conditionally renders two different Grid Components based on activeTab state */}
      <FlatList
        data={activeTab === "Multiple" ? CORPORATE_CREWS : SOLO_PROS}
        renderItem={activeTab === "Multiple" ? renderCorporateItem : renderSoloItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.listContainer}
        extraData={activeTab} // Forces immediate list layout updates when tabs flip
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 20,
    width: "100%",
  },
  sideNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F1F5F9",
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
  gridRow: {
    justifyContent: "space-between",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  imageWrapper: {
    width: '100%',
    height: 125,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: "#F1F5F9",
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: "cover",
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginLeft: 3,
  },
  infoOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overlayBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  content: {
    marginTop: 10,
    paddingHorizontal: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabelText: {
    fontSize: 10,
    color: COLORS.subtext,
    fontWeight: "500",
    marginBottom: 1,
  },
  priceValueText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '800',
  },
  bookIcon: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SomeServices;