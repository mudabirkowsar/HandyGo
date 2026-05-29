import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { logout } from "../../../../api/UserAPI";

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E2E8F0",
  white: "#FFFFFF",
  error: "#EF4444",
};

const ProfileScreen = () => {
  const navigation = useNavigation();

  // Added 'navTarget' properties mapping strictly to your router navigation stack names
  const MENU_ITEMS = [
    { id: "1", icon: "person-outline", label: "View Profile", color: COLORS.secondary, navTarget: "UserProfile" },
    { id: "2", icon: "location-outline", label: "Saved Addresses", color: COLORS.secondary, navTarget: "SavedAddressesScreen" },
    { id: "3", icon: "wallet-outline", label: "Payment Methods", color: COLORS.secondary, navTarget: "PaymentMethodsScreen" },
    { id: "4", icon: "shield-checkmark-outline", label: "Security", color: COLORS.secondary, navTarget: "SecurityScreen" },
    { id: "5", icon: "help-circle-outline", label: "Help Support", color: COLORS.secondary, navTarget: "HelpSupportScreen" },
  ];

  // Handles confirmation prompts before wiping out local device login tokens
  const handleLogoutPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.navigate("Login");
            // This clears active layout states; your Navigation Container will auto-route to 'Login'
          }
        }
      ]
    );
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={() => {
        if (item.navTarget) {
          navigation.navigate(item.navTarget);
        }
      }}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + "10" }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.subtext} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          {/* Dynamically falls back to user context if database values populate */}
          <Text style={styles.userName}>"Aman Sharma"</Text>
          <Text style={styles.userEmail}>"aman.sharma@example.com"</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>₹2.4k</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            {MENU_ITEMS.map(renderMenuItem)}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>General</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleLogoutPress}
            >
              <View style={[styles.iconBox, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
              </View>
              <Text style={[styles.menuLabel, { color: COLORS.error }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.versionText}>HandyGo v1.0.4 • Kharar, India</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 4,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    fontWeight: "700",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "60%",
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.subtext,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#CBD5E1",
    fontWeight: "600",
    marginTop: 40,
  },
});

export default ProfileScreen;