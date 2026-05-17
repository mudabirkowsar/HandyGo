import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = (width - 56) / 2; 

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

const FEATURED_SERVICES = [
  {
    id: "1",
    name: "Elite Deep Cleaning",
    category: "Premium Care",
    price: "1,299",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format",
  },
  {
    id: "2",
    name: "HVAC System Pro",
    category: "Maintenance",
    price: "899",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=400&auto=format",
  },
  {
    id: "3",
    name: "Luxury Wall Paint",
    category: "Interiors",
    price: "2,499",
    rating: "5.0",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1V_0CuH3fyDkgx3bJDE3XvK5WE30a3qMqfA&s",
  },
  {
    id: "4",
    name: "Modern Plumbing",
    category: "Express",
    price: "450",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=400&auto=format",
  },
];

const SomeServicesList = () => {
  return (
    <View style={styles.container}>
      {/* Header with Luxury feel */}
      <View style={styles.header}>
        <View style={styles.titleLine} />
        <Text style={styles.titleText}>Curated Collections</Text>
        <TouchableOpacity>
            <Ionicons name="filter-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {FEATURED_SERVICES.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.9}>
            {/* Image Container with Gradient Look */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.priceBadge}>
                <Text style={styles.priceCurrency}>₹</Text>
                <Text style={styles.priceValue}>{item.price}</Text>
              </View>
              <View style={styles.ratingFloating}>
                 <Ionicons name="star" size={10} color="#FFD700" />
                 <Text style={styles.ratingNum}>{item.rating}</Text>
              </View>
            </View>

            {/* Premium Details */}
            <View style={styles.infoArea}>
              <Text style={styles.categoryLabel}>{item.category}</Text>
              <Text style={styles.serviceTitle} numberOfLines={1}>{item.name}</Text>
              
              <View style={styles.actionRow}>
                <View style={styles.duration}>
                   <Ionicons name="time-outline" size={12} color={COLORS.subtext} />
                   <Text style={styles.durationText}>45-60 min</Text>
                </View>
                <TouchableOpacity style={styles.addCircle}>
                   <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 25,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleLine: {
    width: 4,
    height: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    position: 'absolute',
    left: -10,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.secondary,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: COLORS.white,
    borderRadius: 30, // Extra rounded for premium feel
    marginBottom: 20,
    padding: 8, // Inner padding creates "Card within Card" look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    borderRadius: 24,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceCurrency: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 2,
  },
  priceValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  ratingFloating: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  ratingNum: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginLeft: 3,
  },
  infoArea: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  categoryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 10,
    color: COLORS.subtext,
    marginLeft: 4,
    fontWeight: '600',
  },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});

export default SomeServicesList;