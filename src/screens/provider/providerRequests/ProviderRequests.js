import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Alert,
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
  danger: "#EF4444",
  warning: "#F59E0B",
};

const ProviderRequests = () => {
  // Mock Data for incoming requests
  const [requests, setRequests] = useState([
    {
      id: '1',
      userName: 'Aman Deep',
      userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      service: 'Pipe Leakage Repair',
      time: '10:30 AM',
      date: 'Today, 12 May',
      location: 'Phase 7, Mohali',
      price: '₹299',
      status: 'pending'
    },
    {
      id: '2',
      userName: 'Sonia Gill',
      userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      service: 'Full Bathroom Fitting',
      time: '02:00 PM',
      date: 'Tomorrow, 13 May',
      location: 'Sector 62, Mohali',
      price: '₹2500',
      status: 'pending'
    },
    
    {
      id: '3',
      userName: 'Sonia Gill',
      userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      service: 'Full Bathroom Fitting',
      time: '02:00 PM',
      date: 'Tomorrow, 13 May',
      location: 'Sector 62, Mohali',
      price: '₹2500',
      status: 'pending'
    }
  ]);

  const handleAccept = (id) => {
    Alert.alert("Success", "Request accepted! It will move to your schedule.");
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const handleReject = (id) => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to decline this job?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", style: "destructive", onPress: () => setRequests(prev => prev.filter(req => req.id !== id)) }
      ]
    );
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      {/* Header: User Info */}
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.userImage }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.subtext} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Details: Service & Time */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Service</Text>
          <Text style={styles.detailValue}>{item.service}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Scheduled For</Text>
          <Text style={styles.detailValue}>{item.date} | {item.time}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.button, styles.rejectButton]} 
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.rejectButtonText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.acceptButton]} 
          onPress={() => handleAccept(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Requests</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{requests.length}</Text>
        </View>
      </View>

      {requests.length > 0 ? (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="mail-open-outline" size={80} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No New Requests</Text>
          <Text style={styles.emptySub}>When users book your services, they will appear here.</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop:40,
    paddingBottom:40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    // backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  listContent: {
    padding: 20,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.subtext,
    marginLeft: 4,
  },
  priceBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  detailsRow: {
    marginBottom: 20,
  },
  detailItem: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    marginRight: 10,
  },
  rejectButtonText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.secondary,
    marginTop: 20,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default ProviderRequests;