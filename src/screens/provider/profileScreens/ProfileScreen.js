import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// API Services Imports
import { getProviderProfile, logoutProvider } from "../../../../api/ProviderAPI";

const { width } = Dimensions.get('window');

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
  danger: "#EF4444",
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [providerData, setProviderData] = useState(null);

  useEffect(() => {
    loadProviderProfile();
  }, []);

  const loadProviderProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getProviderProfile();
      if (response.data && response.data.success) {
        setProviderData(response.data.provider);
      } else if (response.data) {
        // Fallback in case your response returns the object directly
        setProviderData(response.data);
      }
    } catch (error) {
      console.error("Failed to load provider profile metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const MenuItem = ({ icon, title, subtitle, isLast, color = COLORS.secondary, onPress }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuTitle, { color: color }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Fallback defaults if database values are empty strings or arrays are loading
  const displayImage = providerData?.profileImage || "https://randomuser.me/api/portraits/legacy/3.jpg";
  const isAccountApproved = providerData?.verificationStatus === "approved";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: displayImage }} style={styles.profileImage} />
            {isAccountApproved && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.nameText}>{providerData?.fullName || "Service Provider"}</Text>
          <Text style={styles.categoryText}>{providerData?.serviceProvided || "Professional Partner"}</Text>

          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate("ProviderProfile")}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>PAN Number</Text>
            <Text style={styles.infoValue}>{providerData?.panNumber || "Not Linked"}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Aadhaar</Text>
            <Text style={styles.infoValue}>[Aadhaar Redacted]</Text>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="construct-outline"
              title="My Services"
              subtitle="Manage prices and timing"
              onPress={() => navigation.navigate("MyServices")}
            />
            <MenuItem
              icon="time-outline"
              title="Work Availability"
              subtitle="Set your working hours"
              onPress={() => navigation.navigate("ManageWorkingHours")}
            />
            <MenuItem
              icon="wallet-outline"
              title="Manage Pricing"
              subtitle="Set base rates and overtime rates"
              onPress={() => navigation.navigate("ManagePricing")}
            />
            <MenuItem
              icon="wallet-outline"
              title="View Your Reviews"
              subtitle="Your ratings and reviews"
              onPress={() => navigation.navigate("AllReviews")}
            />
            <MenuItem
              icon="wallet-outline"
              title="Payout Settings"
              subtitle="Bank account for earnings"
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account & Privacy</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
            />
            <MenuItem
              icon="lock-closed-outline"
              title="Privacy Policy"
            />
            <MenuItem
              icon="help-circle-outline"
              title="Support Center"
              isLast
            />
          </View>
        </View>

        {/* Logout Trigger Option */}
        <TouchableOpacity style={styles.logoutBtn}
          onPress={async () => {
            try {
              await logoutProvider();
            } catch (err) {
              console.error("Logout session termination failed:", err);
            } finally {
              navigation.replace("Login");
            }
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.4 (Production)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.background,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editBtn: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  editBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    width: (width - 50) / 2,
    padding: 15,
    borderRadius: 20,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.subtext,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 4,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 12,
    marginLeft: 5,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContent: {
    flex: 1,
    marginLeft: 15,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    backgroundColor: COLORS.danger + '10',
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.subtext,
    fontSize: 11,
    marginVertical: 30,
    fontWeight: '600',
  },
});

export default ProfileScreen;