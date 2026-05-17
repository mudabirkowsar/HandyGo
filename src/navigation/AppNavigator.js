import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import TabNavigator from "./TabNavigator";
import SplashScreen from "../SplashScreen";
import NotificationScreen from "../screens/user/notificationScreens/NotificationScreen";
import SingleManDetail from "../screens/user/serviceScreens/singleManDetails/SingleManDetail";
import ProviderHome from "../screens/provider/ProviderHome";
import ProvirderProfileScreen from "../screens/provider/profileScreens/ProvirderProfileScreen";
import UpdateAvailabilityScreen from "../screens/provider/updateScreens/UpdateAvailabilityScreen";
import ViewProfileScreen from "../screens/user/profileScreens/ViewProfileScreen";
import EditProfileScreen from "../screens/user/profileScreens/EditUserProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            <Stack.Screen name="UserProfile" component={ViewProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />

            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />

            <Stack.Screen name="SingleManDetail" component={SingleManDetail} />

            <Stack.Screen name="ProviderHome" component={ProviderHome} />
            <Stack.Screen name="ProviderProfile" component={ProvirderProfileScreen} />
            <Stack.Screen name="UpdateAvailability" component={UpdateAvailabilityScreen} />
        </Stack.Navigator>
    );
}