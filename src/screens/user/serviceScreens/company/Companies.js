import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 55) / 2;

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  warning: "#F59E0B",
};

const CORPORATE_CREWS = [
  { id: "1", name: "CleanCo Solutions", type: "Full Agency", rating: "4.9", price: "₹999/hr", teamSize: "3-6 Crews", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=400&auto=format" },
  { id: "2", name: "FixIt Fast Ltd", type: "Repair Corp", rating: "4.7", price: "₹1,499/hr", teamSize: "2-4 Crews", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format" },
  { id: "3", name: "Green Gardeners", type: "Landscaping", rating: "4.8", price: "₹1,200/hr", teamSize: "3-5 Crews", image: "https://images.unsplash.com/photo-1558905612-25f035309395?q=80&w=400&auto=format" },
  { id: "4", name: "Safe Guard Co.", type: "Security", rating: "4.6", price: "₹2,500/hr", teamSize: "4-8 Crews", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=400&auto=format" },
];

const Companies = () => {
  return (
    <FlatList
      data={CORPORATE_CREWS}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      scrollEnabled={false}
      nestedScrollEnabled={true}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
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
      )}
    />
  );
};

const styles = StyleSheet.create({
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingTop: 8,
  },
  card: {
    width: cardWidth,
    backgroundColor: COLORS.card,
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

export default Companies;