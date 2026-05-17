import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

const TABS = ["Upcoming", "Completed", "Cancelled"];

const MOCK_DATA = [
  { id: "1", service: "Elite Deep Cleaning", provider: "CleanCo", date: "15 May", time: "10:00 AM", status: "Upcoming", price: "₹1,299", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200" },
  { id: "2", service: "AC Gas Refill", provider: "Alex Johnson", date: "12 May", time: "02:30 PM", status: "Completed", price: "₹899", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=200" },
  { id: "3", service: "Kitchen Painting", provider: "Mikael Chen", date: "10 May", time: "09:00 AM", status: "Cancelled", price: "₹2,499", image: "https://images.unsplash.com/photo-1562591176-329309dfca3d?q=80&w=200" },
];

const BookingScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Sync Tab Click with List Swipe
  const onTabPress = (index) => {
    setActiveTab(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderBookingCard = (item) => (
    <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.9}>
      <View style={styles.cardTop}>
        <Image source={{ uri: item.image }} style={styles.serviceImg} />
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.serviceName}>{item.service}</Text>
          <Text style={styles.providerName}>{item.provider}</Text>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>

      <View style={styles.dashedLine} />

      <View style={styles.cardBottom}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
        </View>
        
        <View style={styles.actionArea}>
           <TouchableOpacity style={styles.detailsBtn}>
              <Text style={styles.detailsBtnText}>Details</Text>
           </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListPage = (status) => {
    const data = MOCK_DATA.filter((b) => b.status === status);
    return (
      <View style={{ width, paddingHorizontal: 20 }}>
        {data.length > 0 ? (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderBookingCard(item)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No {status} bookings</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My <Text style={{color: COLORS.primary}}>Bookings</Text></Text>
        <TouchableOpacity style={styles.historyBtn}>
          <Ionicons name="time-outline" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Premium Swipeable Tab Bar */}
      <View style={styles.tabBarContainer}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <TouchableOpacity 
              key={tab} 
              onPress={() => onTabPress(index)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
              {isActive && <Animated.View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Swipeable Content */}
      <FlatList
        ref={flatListRef}
        data={TABS}
        horizontal
        pagingEnabled
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveTab(index);
        }}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => renderListPage(item)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop:40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.secondary,
  },
  historyBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    paddingVertical: 12,
    marginRight: 25,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subtext,
  },
  activeTabText: {
    color: COLORS.secondary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImg: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  providerName: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: 15,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 15,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  detailsBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.subtext,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default BookingScreen;