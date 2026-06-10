import React from "react";
// Swapped to material-top-tabs for native swipe gestures
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StyleSheet, View, Platform, Text, Dimensions } from "react-native";
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import HomeScreen from "../screens/user/homeScreen/HomeScreen";
import ServicesScreen from "../screens/user/serviceScreens/ServicesScreen";
import BookingScreen from "../screens/user/bookingServices/BookingScreen";
import ProfileScreen from "../screens/user/profileScreens/ProfileScreen";
import ProductsScreen from "../screens/user/products/ProductsScreen";

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get("window");

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
      tabBarPosition="bottom" // Moves the swipeable bar to the bottom
      initialLayout={{ width: width }}
      screenOptions={({ route }) => ({
        swipeEnabled: true, // Enables sliding/swiping between tabs
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIndicatorStyle: { height: 0 }, // Hides the default top-tab line indicator
        tabBarPressColor: 'transparent', // Removes android ripple distortion over custom wrapper
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'basket' : 'basket-outline';
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
                size={focused ? 22 : 20} 
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
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Services" 
        component={ServicesScreen} 
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen} 
        options={{ tabBarLabel: 'Products' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingScreen} 
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 15,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    height: 75,
    
    // Centers content inside top-tab layout structure
    justifyContent: 'center', 
    
    // Shadow for iOS
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    
    // Elevation for Android
    elevation: 10,
    borderWidth: 0,
  },
  tabBarLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'none', // Prevents Top-Tab navigator from forcing ALL CAPS
    margin: 0,
    padding: 0,
    marginTop: Platform.OS === 'ios' ? 4 : 2,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  activeIconWrapper: {
    backgroundColor: COLORS.primary + '15', 
  }
});