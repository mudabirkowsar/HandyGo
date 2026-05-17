import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Switch,
  StatusBar,
} from 'react-native';
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
  accent: "#6366F1",
  danger: "#EF4444",
  warning: "#F59E0B",
};

const DashboardHome = () => {
  const [isOnline, setIsOnline] = useState(true);

  // Mock Data for the dashboard
  const providerData = {
    name: "Rajesh Kumar",
    rating: "4.8",
    totalJobs: "156",
    earnings: "₹12,450",
  };

  const stats = [
    { label: "Jobs Done", value: providerData.totalJobs, icon: "checkmark-done", color: COLORS.primary },
    { label: "Rating", value: providerData.rating, icon: "star", color: COLORS.warning },
    { label: "Earnings", value: providerData.earnings, icon: "wallet", color: COLORS.accent },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top Profile & Toggle Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.nameText}>{providerData.name}</Text>
          </View>
          
          <View style={styles.toggleWrapper}>
            <Text style={[styles.statusLabel, { color: isOnline ? COLORS.primary : COLORS.subtext }]}>
              {isOnline ? "Online" : "Offline"}
            </Text>
            <Switch
              trackColor={{ false: "#CBD5E1", true: COLORS.primary + '50' }}
              thumbColor={isOnline ? COLORS.primary : "#94A3B8"}
              onValueChange={() => setIsOnline(!isOnline)}
              value={isOnline}
            />
          </View>
        </View>

        {/* Status Alert */}
        <View style={[
          styles.statusCard, 
          { backgroundColor: isOnline ? COLORS.primary + '10' : COLORS.danger + '05' }
        ]}>
          <Ionicons 
            name={isOnline ? "radio-button-on" : "moon"} 
            size={20} 
            color={isOnline ? COLORS.primary : COLORS.danger} 
          />
          <Text style={[styles.statusText, { color: isOnline ? COLORS.primary : COLORS.danger }]}>
            {isOnline 
              ? "Your profile is live. New leads will appear here." 
              : "You are currently offline. Customers cannot book you."}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((item, index) => (
            <View key={index} style={styles.statBox}>
              <View style={[styles.iconBg, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statName}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          <TouchableOpacity>
            <Text style={styles.actionLink}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Booking Card */}
        <TouchableOpacity style={styles.bookingCard} activeOpacity={0.7}>
          <View style={styles.bookingLeft}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>10:30 AM</Text>
            </View>
            <View style={styles.divider} />
          </View>
          
          <View style={styles.bookingRight}>
            <Text style={styles.customerName}>Aman Deep</Text>
            <Text style={styles.jobType}>Pipe Leakage Repair</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={COLORS.subtext} />
              <Text style={styles.locationText}>Phase 7, Mohali</Text>
            </View>
            <View style={styles.tagRow}>
              <View style={styles.statusTag}>
                <Text style={styles.statusTagText}>Confirmed</Text>
              </View>
              <Text style={styles.priceTag}>₹299</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
        </TouchableOpacity>

        {/* Quick Insights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
        </View>
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="trending-up" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Growing Rapidly!</Text>
            <Text style={styles.insightSub}>Your job completion rate is 12% higher than last week.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop:20,
  },
  scrollContent: {
    paddingBottom: 100, // Account for Tab Bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.subtext,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  toggleWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statBox: {
    width: (width - 60) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  statName: {
    fontSize: 11,
    color: COLORS.subtext,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  actionLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  timeBadge: {
    backgroundColor: COLORS.background,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  divider: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.border,
    marginTop: 8,
    borderRadius: 1,
  },
  bookingRight: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  jobType: {
    fontSize: 13,
    color: COLORS.subtext,
    marginVertical: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginLeft: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  statusTag: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  insightIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  insightSub: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 2,
  }
});

export default DashboardHome;