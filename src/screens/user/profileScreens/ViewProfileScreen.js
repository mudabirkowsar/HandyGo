import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile } from '../../../../api/UserAPI';

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
  warning: "#F59E0B",
};

export default function ViewProfileScreen({ navigation }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        
        if (response.data && response.data.success) {
          setProfileData(response.data.data);
        } else {
          Alert.alert("Error", "Failed to retrieve profile data cleanly.");
        }
      } catch (error) {
        console.log("PROFILE FETCH ERROR:", error?.response?.data || error.message);
        Alert.alert(
          "Profile Error",
          error?.response?.data?.message || "Could not sync data with server connection."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper to format ISO Dates (e.g., DOB) into a clean string
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching profile...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.error} />
        <Text style={styles.loadingText}>No profile information found.</Text>
      </View>
    );
  }

  const avatarFallbackChar = profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Navigation Header with Edit Trigger */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Profile</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfileScreen', { profileData })} 
          style={styles.navButton}
        >
          <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Profile Card Header */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>{avatarFallbackChar}</Text>
              </View>
            )}
            <View style={styles.badgeWrapper}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
            </View>
          </View>
          
          <Text style={styles.nameText}>{profileData.fullName || "User"}</Text>
          <Text style={styles.referralText}>Referral Code: {profileData.referralCode || "N/A"}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profileData.role}</Text>
          </View>
        </View>

        {/* Dynamic Context Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profileData.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: COLORS.warning }]}>⭐ {profileData.rewardPoints || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>₹{profileData.walletBalance || 0}</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.card}>
            
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{profileData.email}</Text>
              </View>
              {profileData.isEmailVerified ? (
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              ) : (
                <Text style={styles.unverifiedText}>Unverified</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{profileData.phone || 'Not Provided'}</Text>
              </View>
              {profileData.isPhoneVerified ? (
                <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
              ) : (
                <Text style={styles.unverifiedText}>Unverified</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{formatDate(profileData.dateOfBirth)}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="male-female-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{profileData.gender || 'Not Specified'}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Preferences & Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences & Settings</Text>
          <View style={styles.card}>

            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue}>{profileData.preferredLanguage || "English"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Preferred Payment</Text>
                <Text style={[styles.infoValue, { textTransform: 'uppercase' }]}>{profileData.preferredPaymentMethod || "UPI"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="moon-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Dark Mode</Text>
                <Text style={styles.infoValue}>{profileData.appSettings?.darkMode ? "Enabled" : "Disabled"}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.subtext} style={styles.rowIcon} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Booking Notifications</Text>
                <Text style={styles.infoValue}>
                  {profileData.notificationPreferences?.bookingUpdates ? "On" : "Off"}
                </Text>
              </View>
            </View>

          </View>
        </View>

        {/* Saved Cards Quick Section */}
        {profileData.savedCards && profileData.savedCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            {profileData.savedCards.map((card) => (
              <View key={card._id} style={[styles.card, { paddingVertical: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}>
                <Ionicons name="card" size={24} color={COLORS.primary} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoValue}>{card.brand} •••• {card.last4Digits}</Text>
                  <Text style={styles.infoLabel}>Expires: {card.expiryMonth}/{card.expiryYear}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Full Edit Profile Bottom Button Action */}
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfileScreen', { profileData })}
        >
          <Text style={styles.editProfileButtonText}>Edit Profile Details</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop:40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navButton: {
    padding: 6,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary + "20",
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
  },
  badgeWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
    marginTop: 12,
  },
  referralText: {
    fontSize: 13,
    color: COLORS.subtext,
    fontWeight: '600',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.secondary + "10",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  rowIcon: {
    marginRight: 14,
  },
  infoTexts: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 2,
  },
  unverifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.error,
    backgroundColor: COLORS.error + "10",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editProfileButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 32,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editProfileButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});