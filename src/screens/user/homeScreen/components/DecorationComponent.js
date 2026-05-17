import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

const RELATED_SERVICES = [
  {
    id: "1",
    title: "Pest Control",
    desc: "Odourless & Safe",
    icon: "bug-outline",
    price: "From ₹799",
    color: "#FFF7ED", // Soft Orange
  },
  {
    id: "2",
    title: "Water Purifier",
    desc: "Service & Filter",
    icon: "water-outline",
    price: "From ₹449",
    color: "#F0F9FF", // Soft Blue
  },
  {
    id: "3",
    title: "Appliance",
    desc: "TV, Fridge, Micro",
    icon: "tv-outline",
    price: "From ₹299",
    color: "#F5F3FF", // Soft Purple
  },
  {
    id: "4",
    title: "Carpentry",
    desc: "Furniture Repair",
    icon: "hammer-outline",
    price: "From ₹199",
    color: "#ECFDF5", // Soft Green
  },
];

const EssentialServices = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Home Essentials</Text>
          <Text style={styles.subtitle}>Maintain your home like a pro</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RELATED_SERVICES.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: item.color }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={22} color={COLORS.secondary} />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
              <Text style={styles.priceTag}>{item.price}</Text>
            </View>

            <TouchableOpacity style={styles.miniAdd}>
              <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingBottom:100,
  },
  header: {
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
    marginTop: 2,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: width * 0.65, // Shows part of the next card to encourage scrolling
    height: 100,
    borderRadius: 22,
    marginRight: 15,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  itemDesc: {
    fontSize: 11,
    color: COLORS.subtext,
    fontWeight: "600",
    marginVertical: 2,
  },
  priceTag: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  miniAdd: {
    backgroundColor: COLORS.secondary,
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EssentialServices;