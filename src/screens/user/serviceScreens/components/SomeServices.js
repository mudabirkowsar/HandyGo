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
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 55) / 2;

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

// Expanded Mock Data
const PROVIDERS = [
  { id: "1", name: "CleanCo Solutions", type: "Full Agency", rating: "4.9", price: "₹999", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=400&auto=format" },
  { id: "2", name: "FixIt Fast Ltd", type: "Repair Corp", rating: "4.7", price: "₹499", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format" },
  { id: "3", name: "Green Gardeners", type: "Landscaping", rating: "4.8", price: "₹1,200", image: "https://images.unsplash.com/photo-1558905612-25f035309395?q=80&w=400&auto=format" },
  { id: "4", name: "Safe Guard Co.", type: "Security", rating: "4.6", price: "₹2,500", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=400&auto=format" },
  { id: "5", name: "Sparkle Windows", type: "Specialist", rating: "4.9", price: "₹750", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format" },
  { id: "6", name: "Urban Electric", type: "Agency", rating: "4.7", price: "₹399", image: "https://images.unsplash.com/photo-1621905252507-b354bc2d18c4?q=80&w=400&auto=format" },
];

const SOLO_PROS = [
  { id: "1", name: "Alex Johnson", type: "Master Plumber", rating: "5.0", price: "₹299", image: "https://images.unsplash.com/photo-1540560085022-185e845a10ed?q=80&w=400&auto=format" },
  { id: "2", name: "Sarah Smith", type: "Electrician", rating: "4.8", price: "₹349", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format" },
  { id: "3", name: "Marco V.", type: "Painter", rating: "4.9", price: "₹500", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format" },
  { id: "4", name: "Elena R.", type: "Housekeeper", rating: "4.7", price: "₹200", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format" },
  { id: "5", name: "James Bond", type: "Handyman", rating: "4.8", price: "₹450", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format" },
  { id: "6", name: "Priya S.", type: "Wellness", rating: "5.0", price: "₹1,500", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format" },
];

const SomeServices = () => {
  const [activeTab, setActiveTab] = useState("Providers");

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.95}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <View style={styles.priceOverlay}>
            <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.typeText}>{item.type}</Text>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
        <View style={styles.footer}>
            <View style={styles.verifiedRow}>
                <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
            </View>
            <TouchableOpacity style={styles.bookIcon}>
                <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Compact Side Nav */}
      <View style={styles.headerRow}>
        <View style={styles.sideNav}>
          <TouchableOpacity 
            onPress={() => setActiveTab("Providers")}
            style={styles.navBtn}
          >
            <Text style={[styles.navBtnText, activeTab === "Providers" && styles.navBtnActive]}>
              Providers
            </Text>
            {activeTab === "Providers" && <View style={styles.activeLine} />}
          </TouchableOpacity>

          <View style={styles.navSpacer} />

          <TouchableOpacity 
            onPress={() => setActiveTab("Solo Pros")}
            style={styles.navBtn}
          >
            <Text style={[styles.navBtnText, activeTab === "Solo Pros" && styles.navBtnActive]}>
              Solo Pros
            </Text>
            {activeTab === "Solo Pros" && <View style={styles.activeLine} />}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTab === "Providers" ? PROVIDERS : SOLO_PROS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sideNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.subtext,
  },
  navBtnActive: {
    color: COLORS.secondary,
  },
  activeLine: {
    position: 'absolute',
    bottom: 6,
    width: 12,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  navSpacer: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginLeft: 3,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.subtext,
    marginLeft: 4,
  },
  bookIcon: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SomeServices;