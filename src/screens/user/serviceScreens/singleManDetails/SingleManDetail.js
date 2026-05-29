import React, { useEffect, useState } from 'react';
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
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { fetchProviderById } from '../../../../../api/UserAPI';

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
  star: "#FFD700",
  error: "#EF4444",
};

export default function SingleManDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Accept minimal provider metadata passed via navigation parameters
  const { provider: partialProvider } = route.params;

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDetailedProviderProfile = async () => {
      try {
        const response = await fetchProviderById(partialProvider._id);
        if (response.data && response.data.success) {
          // Destructure according to your exact key envelope structure 'response.data.provider'
          setProvider(response.data.provider);
        } else {
          setProvider(partialProvider);
        }
      } catch (error) {
        console.log("FETCH PROVIDER BY ID ERROR:", error?.response?.data || error.message);
        setProvider(partialProvider);
      } finally {
        setLoading(false);
      }
    };

    if (partialProvider?._id) {
      getDetailedProviderProfile();
    } else {
      setProvider(partialProvider);
      setLoading(false);
    }
  }, [partialProvider]);

  const handleBooking = () => {
    if (!provider) return;
    // navigation.navigate("BookingScreen", { providerId: provider._id });
    console.log("Proceeding to booking for:", provider.fullName);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Syncing specialist details...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.subtext} />
        <Text style={styles.loadingText}>Provider profile unavailable.</Text>
      </View>
    );
  }

  // Days mapping helper to parse nested workingHours schema cleanly
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Top Image Section */}
        <View style={styles.imageHeader}>
          <Image
            source={{ uri: provider.profileImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400" }}
            style={styles.mainImage}
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          
          {/* Title & Category Layout */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.fullName}>{provider.fullName}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {provider.serviceCategory?.name || "Independent Pro"}
                </Text>
              </View>
            </View>
            {provider.verificationStatus === "approved" && (
              <View style={styles.verifiedContainer}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Core Analytics Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.averageRating || "0.0"}</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="star" size={14} color={COLORS.star} />
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.experienceYears || 0} Yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.totalReviews || 0}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* Category Context Description */}
          {provider.serviceCategory?.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About Service</Text>
              <Text style={styles.descriptionText}>{provider.serviceCategory.description}</Text>
            </View>
          )}

          {/* New Section: Working Hours Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Availability</Text>
            <View style={styles.scheduleCard}>
              {daysOfWeek.map((day) => {
                const isAvailable = provider.workingHours?.[day]?.isAvailable;
                return (
                  <View key={day} style={styles.scheduleRow}>
                    <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                    <View style={styles.statusBadgeWrapper}>
                      <Ionicons 
                        name={isAvailable ? "checkmark-circle" : "close-circle"} 
                        size={18} 
                        color={isAvailable ? COLORS.primary : COLORS.error} 
                      />
                      <Text style={[styles.statusBadgeText, { color: isAvailable ? COLORS.primary : COLORS.error }]}>
                        {isAvailable ? "Available" : "Closed"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Operational Available Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Services</Text>
            {provider.services && provider.services.length > 0 ? (
              provider.services.map((service, index) => (
                <View key={service._id || index} style={styles.serviceCard}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceTitle}>{service.title || service.name}</Text>
                    <View style={styles.durationRow}>
                      <Ionicons name="time-outline" size={14} color={COLORS.subtext} />
                      <Text style={styles.durationText}>{service.estimatedDuration || "Standard"}</Text>
                    </View>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>₹{service.price}</Text>
                    <Text style={styles.priceType}>{service.priceType || "Fixed"}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="construct-outline" size={24} color={COLORS.subtext} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyText}>Standard base-rate options apply for {provider.serviceCategory?.name || 'this category'}. Click book below to request a custom estimation quote.</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Sticky Fixed Bottom Booking Action CTA */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Service Radius</Text>
          <Text style={styles.footerPrice}>{provider.serviceRadiusKm || 10} km</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, provider.availabilityStatus === 'offline' && { backgroundColor: COLORS.secondary }]} 
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
          <Ionicons name="calendar" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.subtext,
    fontWeight: '600',
  },
  imageHeader: {
    width: width,
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  fullName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  categoryBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  verifiedContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  verifiedText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 15,
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.subtext,
    marginLeft: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    height: '100%',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.subtext,
    lineHeight: 22,
    fontWeight: '500',
  },
  scheduleCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "50",
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  statusBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  durationText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceType: {
    fontSize: 10,
    color: COLORS.subtext,
    textTransform: 'capitalize',
  },
  emptyCard: {
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.subtext,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: {
    fontSize: 12,
    color: COLORS.subtext,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  bookButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
});