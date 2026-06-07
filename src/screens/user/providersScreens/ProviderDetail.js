// screens/ProviderDetail.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Import your live API calls from the User API layer
import { fetchProviderById, fetchProviderReviews, fetchProviderRatingStats } from "../../../../api/UserAPI";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  primaryLight: "#E6F7F0",
  secondary: "#0F172A",
  white: "#FFFFFF",
  border: "#F1F5F9",
  background: "#F8FAFC",
  textMain: "#0F172A",
  textMuted: "#64748B",
  surface: "#FFFFFF",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
};

const ProviderDetail = ({ route, navigation }) => {
  const { providerId } = route.params;
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAllProviderDataPipeline = async () => {
      try {
        setLoading(true);
        setError(null);

        // Execute profile fetch, reviews list fetch, and aggregation analytics splits concurrently
        const [profileRes, reviewsRes, statsRes] = await Promise.all([
          fetchProviderById(providerId),
          fetchProviderReviews(providerId),
          fetchProviderRatingStats(providerId)
        ]);

        if (profileRes?.data?.success) {
          setProvider(profileRes.data.data);
        } else {
          throw new Error("Failed to load provider profile information.");
        }

        if (reviewsRes?.data?.success) {
          setReviews(reviewsRes.data.data);
        }

        if (statsRes?.data?.success) {
          setRatingStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Pipeline breakdown exception summary:", err);
        setError(err?.response?.data?.message || err.message || "Something went wrong while fetching details.");
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      getAllProviderDataPipeline();
    }
  }, [providerId]);

  const formatReviewDate = (dateString) => {
    try {
      if (!dateString) return "Recent";
      const dateObj = new Date(dateString);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    } catch (e) {
      return "Recent";
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading expert profile...</Text>
      </View>
    );
  }

  if (error || !provider) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={COLORS.danger} />
        <Text style={styles.errorText}>{error || "Provider profile unavailable"}</Text>
        <TouchableOpacity style={styles.errorBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine the live computed values from ratings block for top profile sync
  const displayRating = ratingStats && ratingStats.totalReviews > 0 
    ? ratingStats.averageRating.toFixed(1) 
    : (provider.averageRating > 0 ? provider.averageRating.toFixed(1) : "New");

  const displayTotalReviews = ratingStats ? ratingStats.totalReviews : (provider.totalReviews || 0);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Menu */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backActionButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Profile</Text>
        <TouchableOpacity style={styles.backActionButton}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

        {/* Core Profile Hero Canvas */}
        <View style={styles.profileHeroSection}>
          <LinearGradient
            colors={["rgba(8, 179, 106, 0.08)", "transparent"]}
            style={styles.heroGradientBackground}
          />
          <View style={styles.avatarWrapper}>
            {provider.profileImage ? (
              <Image source={{ uri: provider.profileImage }} style={styles.profileImageAvatar} />
            ) : (
              <View style={styles.avatarFallbackView}>
                <Text style={styles.avatarFallbackText}>
                  {provider.fullName ? provider.fullName.charAt(0).toUpperCase() : "P"}
                </Text>
              </View>
            )}
            {provider.isOnline && <View style={styles.activeOnlineDot} />}
          </View>

          <Text style={styles.providerNameText}>{provider.fullName}</Text>
          <Text style={styles.serviceCategoryBadge}>{provider.serviceProvided}</Text>

          <View style={styles.geographyRow}>
            <Ionicons name="location" size={14} color={COLORS.primary} />
            <Text style={styles.geographyText}>
              {provider.address?.city ? `${provider.address.city}, ` : ""}{provider.address?.state || "N/A"}
            </Text>
          </View>

          {/* Integrated Metrics Hub with Live Aggregated Rating Updates */}
          <View style={styles.unifiedMetricsBar}>
            <View style={styles.metricBlockItem}>
              <View style={styles.metricValueWrapper}>
                <Ionicons name="star" size={15} color={COLORS.warning} />
                <Text style={styles.metricBoldValue}>
                  {" "}{displayRating}
                </Text>
              </View>
              <Text style={styles.metricMutedLabel}>{displayTotalReviews} Reviews</Text>
            </View>

            <View style={styles.metricVerticalPipe} />

            <View style={styles.metricBlockItem}>
              <View style={styles.metricValueWrapper}>
                <MaterialCommunityIcons name="shield-check" size={16} color={COLORS.primary} />
                <Text style={styles.metricBoldValue}> {provider.experienceYears || 0} Yrs</Text>
              </View>
              <Text style={styles.metricMutedLabel}>Experience</Text>
            </View>

            <View style={styles.metricVerticalPipe} />

            <View style={styles.metricBlockItem}>
              <Text style={styles.metricBoldValue}>{provider.completedBookings || provider.totalBookings || 0}</Text>
              <Text style={styles.metricMutedLabel}>Jobs Done</Text>
            </View>
          </View>
        </View>

        {/* Content Cards Body */}
        <View style={styles.mainContentBody}>

          {/* About Section */}
          <View style={styles.cardSegment}>
            <Text style={styles.segmentHeadingText}>About the Expert</Text>
            <Text style={styles.bodyDescriptionParagraph}>
              {provider.bio || "Professional service provider dedicated to high quality work standards."}
            </Text>

            <View style={styles.metaLabelRow}>
              <View style={styles.metaIconContainer}>
                <Feather name="globe" size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.metaLabelTitle}>Languages Spoken: </Text>
              <Text style={styles.metaLabelValue}>{provider.languages?.join(", ") || "English"}</Text>
            </View>
          </View>

          {/* Services Menu Section */}
          {provider.services && provider.services.length > 0 && (
            <View style={styles.cardSegment}>
              <Text style={styles.segmentHeadingText}>Rate Card & Services</Text>
              {provider.services.map((service, index) => (
                <View
                  key={service._id || index}
                  style={[
                    styles.serviceRowContainer,
                    index !== provider.services.length - 1 && styles.serviceBorderBottom
                  ]}
                >
                  <View style={styles.serviceDetailsColumn}>
                    <Text style={styles.serviceNameHeadline}>{service.name}</Text>
                    {service.description && (
                      <Text style={styles.serviceSubDescription}>{service.description}</Text>
                    )}
                    <View style={styles.timestampRowBadge}>
                      <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.timestampBadgeText}>{service.durationInMins || 60} mins</Text>
                    </View>
                  </View>
                  {service.price > 0 && (
                    <View style={styles.priceBadgeContainer}>
                      <Text style={styles.servicePriceTagText}>₹{service.price}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Skills & Capabilities Cloud */}
          {provider.skills && provider.skills.length > 0 && (
            <View style={styles.cardSegment}>
              <Text style={styles.segmentHeadingText}>Skills & Specialities</Text>
              <View style={styles.skillsFlexGrid}>
                {provider.skills.map((skillItem, index) => (
                  <View key={index} style={styles.pillTagContainer}>
                    <Text style={styles.pillTagInnerText}>{skillItem}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Analytics Star Breakdown Matrix Graph Area */}
          {ratingStats && ratingStats.totalReviews > 0 && (
            <View style={styles.cardSegment}>
              <Text style={styles.segmentHeadingText}>Ratings Breakdown</Text>
              <View style={styles.statsSummaryMatrixRow}>
                <View style={styles.statsLeftScoreGroup}>
                  <Text style={styles.statsBigAverageText}>{ratingStats.averageRating.toFixed(1)}</Text>
                  <View style={styles.statsStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons 
                        key={s} 
                        name={s <= Math.round(ratingStats.averageRating) ? "star" : "star-outline"} 
                        size={14} 
                        color={COLORS.warning} 
                      />
                    ))}
                  </View>
                  <Text style={styles.statsTotalReviewsSub}>{ratingStats.totalReviews} global reviews</Text>
                </View>

                <View style={styles.statsBarsProgressColumn}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingStats.breakdown?.[stars] || 0;
                    const percent = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;
                    return (
                      <View key={stars} style={styles.statsItemProgressBarRow}>
                        <Text style={styles.statsBarIndexLabel}>{stars} <Ionicons name="star" size={10} color={COLORS.textMuted} /></Text>
                        <View style={styles.statsBarOuterTrack}>
                          <View style={[styles.statsBarInnerFill, { width: `${percent}%` }]} />
                        </View>
                        <Text style={styles.statsBarCountLabel}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Customer Reviews & Feedback Feed Segment */}
          <View style={styles.cardSegment}>
            <Text style={styles.segmentHeadingText}>Customer Reviews ({reviews.length})</Text>
            {reviews.length > 0 ? (
              reviews.map((rev, index) => {
                const userImg = rev.user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150';
                return (
                  <View 
                    key={rev._id || index} 
                    style={[styles.reviewFeedCardItem, index !== reviews.length - 1 && styles.reviewBorderBottom]}
                  >
                    <View style={styles.reviewAuthorHeader}>
                      <Image source={{ uri: userImg }} style={styles.reviewAuthorAvatar} />
                      <View style={styles.reviewAuthorMeta}>
                        <Text style={styles.reviewAuthorName}>{rev.user?.fullName || "Anonymous Client"}</Text>
                        <View style={styles.reviewStarsSubRow}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Ionicons 
                              key={s} 
                              name={s <= rev.rating ? "star" : "star-outline"} 
                              size={12} 
                              color={COLORS.warning} 
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewCalendarTimestamp}>{formatReviewDate(rev.createdAt)}</Text>
                    </View>
                    {rev.comment ? (
                      <Text style={styles.reviewCommentContentText}>{rev.comment}</Text>
                    ) : (
                      <Text style={[styles.reviewCommentContentText, { fontStyle: 'italic', color: COLORS.textMuted }]}>
                        Left a rating score without additional commentary description.
                      </Text>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.reviewFeedEmptyContainer}>
                <Ionicons name="chatbubbles-outline" size={32} color={COLORS.border} />
                <Text style={styles.reviewFeedEmptyText}>No customer reviews recorded yet.</Text>
              </View>
            )}
          </View>

          {/* Schedule Segment */}
          <View style={styles.cardSegment}>
            <Text style={styles.segmentHeadingText}>Availability Schedule</Text>
            <View style={styles.calendarTimelineStack}>
              {provider.workingHours ? (
                Object.keys(provider.workingHours).map((day, index, arr) => {
                  const daySchedule = provider.workingHours[day];
                  return (
                    <View
                      key={day}
                      style={[
                        styles.weeklyDayRow,
                        index !== arr.length - 1 && styles.scheduleBorderBottom
                      ]}
                    >
                      <Text style={styles.calendarDayText}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                      {daySchedule.isAvailable ? (
                        <View style={styles.timeBadge}>
                          <Text style={styles.calendarHoursText}>
                            {daySchedule.start} - {daySchedule.end}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.calendarUnavailableText}>Rest Day</Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.bodyDescriptionParagraph}>Standard flexible schedule</Text>
              )}
            </View>

            {/* Overtime Integrated Banner */}
            {provider.overtime?.isOvertimeEnabled && (
              <View style={styles.overtimeStatusAlert}>
                <MaterialCommunityIcons name="clock-fast" size={20} color="#B45309" />
                <Text style={styles.overtimeAlertParagraphText}>
                  Accepts overtime assignments outside standard hours at standard premiums (
                  <Text style={{ fontWeight: "700" }}>₹{provider.overtimeHourlyPrice || 99}/hr</Text>).
                </Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Sticky Footer Interaction Bar */}
      <View style={styles.persistentBottomNavigationFooter}>
        <View style={styles.pricingSummaryStack}>
          <Text style={styles.pricingMetaCapLabel}>Day Base rate</Text>
          <Text style={styles.pricingActualValueText}>
            ₹{provider.perDayPrice || 599}
            <Text style={styles.pricingValueSubtextUnit}>/day</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryCallToActionButton}
          activeOpacity={0.85}
          onPress={() => {
            navigation.navigate("ProviderCheckoutScreen", { provider });
            console.log("Booking flow initializing for ID:", provider._id);
          }}
        >
          <Text style={styles.primaryCallToActionButtonLabel}>Book Service</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProviderDetail;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingTop: 20
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  backActionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: -0.3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorBackButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  scrollContainer: {
    paddingBottom: 130,
    backgroundColor: COLORS.background,
  },
  profileHeroSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 15,
    elevation: 4,
  },
  heroGradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  profileImageAvatar: {
    width: 105,
    height: 105,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarFallbackView: {
    width: 105,
    height: 105,
    borderRadius: 55,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarFallbackText: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.textMuted,
  },
  activeOnlineDot: {
    position: "absolute",
    bottom: 4,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  providerNameText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  serviceCategoryBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  geographyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  geographyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 4,
    fontWeight: "500",
  },
  unifiedMetricsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: width - 40,
    backgroundColor: COLORS.background,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 24,
  },
  metricBlockItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValueWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  metricBoldValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textMain,
  },
  metricMutedLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: "600",
  },
  metricVerticalPipe: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(100, 116, 139, 0.15)",
  },
  mainContentBody: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  cardSegment: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  segmentHeadingText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textMain,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  bodyDescriptionParagraph: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    fontWeight: "400",
  },
  metaLabelRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 12,
  },
  metaIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  metaLabelTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  metaLabelValue: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: "700",
    flex: 1,
  },
  skillsFlexGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pillTagContainer: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillTagInnerText: {
    color: COLORS.textMain,
    fontSize: 13,
    fontWeight: "600",
  },
  serviceRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  serviceBorderBottom: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  serviceDetailsColumn: {
    flex: 1,
    paddingRight: 16,
  },
  serviceNameHeadline: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  serviceSubDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  timestampRowBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  timestampBadgeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
    fontWeight: "500",
  },
  priceBadgeContainer: {
    backgroundColor: "rgba(8, 179, 106, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  servicePriceTagText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
  calendarTimelineStack: {
    marginTop: 4,
  },
  weeklyDayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  scheduleBorderBottom: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  calendarDayText: {
    fontSize: 13,
    color: COLORS.textMain,
    fontWeight: "600",
  },
  timeBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calendarHoursText: {
    fontSize: 12,
    color: COLORS.textMain,
    fontWeight: "700",
  },
  calendarUnavailableText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
    opacity: 0.6,
  },
  overtimeStatusAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  overtimeAlertParagraphText: {
    fontSize: 12,
    color: "#B45309",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
    fontWeight: "500",
  },
  persistentBottomNavigationFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  pricingSummaryStack: {
    flexDirection: "column",
  },
  pricingMetaCapLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  pricingActualValueText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  pricingValueSubtextUnit: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  primaryCallToActionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryCallToActionButtonLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "750",
  },
  statsSummaryMatrixRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statsLeftScoreGroup: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 16,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    width: 100,
  },
  statsBigAverageText: {
    fontSize: 34,
    fontWeight: "900",
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  statsStarsRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  statsTotalReviewsSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
    textAlign: "center",
  },
  statsBarsProgressColumn: {
    flex: 1,
    paddingLeft: 16,
    gap: 4,
  },
  statsItemProgressBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsBarIndexLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    width: 24,
  },
  statsBarOuterTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  statsBarInnerFill: {
    height: "100%",
    backgroundColor: COLORS.warning,
    borderRadius: 3,
  },
  statsBarCountLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMain,
    width: 16,
    textAlign: "right",
  },
  reviewFeedCardItem: {
    paddingVertical: 14,
  },
  reviewBorderBottom: {
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  reviewAuthorHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAuthorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  reviewAuthorMeta: {
    flex: 1,
    marginLeft: 10,
  },
  reviewAuthorName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  reviewStarsSubRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  reviewCalendarTimestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  reviewCommentContentText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 10,
    fontWeight: "400",
  },
  reviewFeedEmptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reviewFeedEmptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  }
});