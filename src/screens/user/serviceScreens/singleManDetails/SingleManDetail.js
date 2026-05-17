import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

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
};

const SingleManDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { provider } = route.params;

  const handleBooking = () => {
    // Navigate to your booking or checkout screen
    // navigation.navigate("BookingScreen", { providerId: provider._id });
    console.log("Proceeding to booking for:", provider.fullName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Image Section */}
        <View style={styles.imageHeader}>
          <Image
            source={{ uri: provider.profileImage || "https://via.placeholder.com/300" }}
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
          {/* Title & Category */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.fullName}>{provider.fullName}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{provider.serviceCategory}</Text>
              </View>
            </View>
            {provider.isVerified && (
              <View style={styles.verifiedContainer}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.averageRating}</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="star" size={14} color={COLORS.star} />
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.experience} yrs</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{provider.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Services</Text>
            {provider.services?.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={14} color={COLORS.subtext} />
                    <Text style={styles.durationText}>{service.estimatedDuration}</Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>₹{service.price}</Text>
                  <Text style={styles.priceType}>{service.priceType}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {provider.reviews?.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.userName}</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={12} color={COLORS.star} />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Booking Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Starting from</Text>
          <Text style={styles.footerPrice}>₹{provider.services?.[0]?.price || 0}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Appointment</Text>
          <Ionicons name="calendar" size={18} color={COLORS.white} style={{marginLeft: 8}} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    marginBottom: 15,
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
  reviewCard: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewUser: {
    fontWeight: '700',
    color: COLORS.secondary,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 3,
  },
  reviewComment: {
    fontSize: 13,
    color: COLORS.subtext,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
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
  },
  bookButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
});

export default SingleManDetail;