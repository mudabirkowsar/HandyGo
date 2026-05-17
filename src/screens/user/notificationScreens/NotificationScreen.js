import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Booking Confirmed",
    desc: "Your AC Repair service is scheduled for tomorrow at 10:00 AM.",
    time: "2 mins ago",
    type: "booking",
    read: false,
  },
  {
    id: "2",
    title: "Special Offer!",
    desc: "Get 20% cashback on your next Deep Cleaning service. Use code: CLEAN20.",
    time: "1 hour ago",
    type: "offer",
    read: false,
  },
  {
    id: "3",
    title: "Service Completed",
    desc: "Alex Johnson has completed the plumbing task. Please rate your experience.",
    time: "Yesterday",
    type: "completed",
    read: true,
  },
  {
    id: "4",
    title: "Account Security",
    desc: "Your password was changed successfully. If this wasn't you, contact support.",
    time: "2 days ago",
    type: "system",
    read: true,
  },
];

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const getIcon = (type) => {
    switch (type) {
      case "booking": return { name: "calendar-check", color: "#3B82F6" };
      case "offer": return { name: "gift", color: "#F59E0B" };
      case "completed": return { name: "checkmark-circle", color: COLORS.primary };
      case "system": return { name: "shield-checkmark", color: COLORS.secondary };
      default: return { name: "notifications", color: COLORS.subtext };
    }
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const renderItem = ({ item }) => {
    const icon = getIcon(item.type);
    
    return (
      <TouchableOpacity 
        style={[styles.notifCard, !item.read && styles.unreadCard]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifDesc} numberOfLines={2}>{item.desc}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop:50
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    // backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  backBtn: {
    padding: 4,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    borderColor: COLORS.primary + '30',
    backgroundColor: COLORS.primary + '05',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  notifDesc: {
    fontSize: 13,
    color: COLORS.subtext,
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.subtext,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.subtext,
    marginTop: 10,
    fontWeight: "600",
  },
});

export default NotificationScreen;