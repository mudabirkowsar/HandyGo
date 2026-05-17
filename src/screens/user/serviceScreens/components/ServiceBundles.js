import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  white: "#FFFFFF",
  subtext: "#94A3B8",
};

const BUNDLES = [
  {
    id: "1",
    title: "Essential Home Care",
    services: "Cleaning • Plumbing • AC",
    price: "₹1,499",
    image: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=500&auto=format",
  },
  {
    id: "2",
    title: "Summer Ready AC",
    services: "2x AC Service • Gas Check",
    price: "₹899",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=500&auto=format",
  },
];

const ServiceBundles = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Bundles</Text>
        <View style={styles.tag}>
            <Text style={styles.tagText}>BEST VALUE</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BUNDLES.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.9} style={styles.card}>
            <ImageBackground
              source={{ uri: item.image }}
              style={styles.imageBg}
              imageStyle={{ borderRadius: 24 }}
            >
              <View style={styles.overlay}>
                <View style={styles.content}>
                  <Text style={styles.bundleTitle}>{item.title}</Text>
                  <Text style={styles.bundleServices}>{item.services}</Text>
                  
                  <View style={styles.footer}>
                    <Text style={styles.price}>{item.price}</Text>
                    <View style={styles.addBtn}>
                      <Ionicons name="add" size={20} color={COLORS.white} />
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  card: {
    width: width * 0.75,
    height: 160,
    marginRight: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  imageBg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Dark translucent overlay
    borderRadius: 24,
    padding: 20,
    justifyContent: 'flex-end',
  },
  content: {
    width: '100%',
  },
  bundleTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  bundleServices: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  price: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceBundles;