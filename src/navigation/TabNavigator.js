import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, View, Platform, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from "../screens/user/homeScreen/HomeScreen";
import ServicesScreen from "../screens/user/serviceScreens/ServicesScreen";
import BookingScreen from "../screens/user/bookingServices/BookingScreen";
import ProfileScreen from "../screens/user/profileScreens/ProfileScreen";

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  inactive: "#94A3B8",
  white: "#FFFFFF",
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={[
              styles.iconWrapper,
              focused && styles.activeIconWrapper
            ]}>
              <Ionicons 
                name={iconName} 
                size={focused ? 24 : 22} 
                color={color} 
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Services" 
        component={ServicesScreen} 
        options={{ title: 'Explore' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingScreen} 
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 15, // Lifted off the bottom for a floating look
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    height: 75,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 12,
    
    // Shadow for iOS
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    
    // Elevation for Android
    elevation: 10,
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: Platform.OS === 'ios' ? 0 : 5,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeIconWrapper: {
    backgroundColor: COLORS.primary + '15', // Subtle green background for active tab
  }
});