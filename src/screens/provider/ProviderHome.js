import React from 'react';
import {
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons";

// Component Imports
import DashboardHome from './dashboardHome/DashboardHome';
import EarningsScreen from './earningScreens/EarningsScreen';
import ProfileScreen from './profileScreens/ProfileScreen';
import ProviderRequests from './providerRequests/ProviderRequests';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

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

const ProviderHome = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.subtext,
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Bookings') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Earnings') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={DashboardHome}
                options={{ tabBarLabel: 'Dashboard' }}
            />
            <Tab.Screen
                name="Earnings"
                component={EarningsScreen}
                options={{ tabBarLabel: 'Earnings' }}
            />
            <Tab.Screen
                name="Bookings"
                component={ProviderRequests}
                options={{ tabBarLabel: 'Requests' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Account' }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        height: Platform.OS === 'ios' ? 88 : 70,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 25 : 12,

        // Floating effect shadow
        shadowColor: COLORS.secondary,
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 15,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2,
    },
});

export default ProviderHome;