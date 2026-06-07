import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import TabNavigator from "./TabNavigator";
import SplashScreen from "../SplashScreen";
import NotificationScreen from "../screens/user/notificationScreens/NotificationScreen";
import SingleManDetail from "../screens/user/serviceScreens/singleManDetails/SingleManDetail";
import ProviderHome from "../screens/provider/ProviderHome";
import UpdateAvailabilityScreen from "../screens/provider/updateScreens/UpdateAvailabilityScreen";
import ViewProfileScreen from "../screens/user/profileScreens/ViewProfileScreen";
import EditProfileScreen from "../screens/user/profileScreens/EditUserProfileScreen";
import WorkingHoursScreen from "../screens/provider/extraScreens/WorkingHoursScreen";
import DocumentsScreen from "../screens/provider/documents/DocumentsScreen";
import ShowPopup from "../screens/auth/ShowPopup";
import ProviderProfileScreen from "../screens/provider/profileScreens/ProviderProfileScreen";
import MyServices from "../screens/provider/profileScreens/MyServices";
import ManagePricing from "../screens/provider/profileScreens/ManagePricing";
import ProviderDetail from "../screens/user/providersScreens/ProviderDetail";
import SavedAddressesScreen from "../screens/user/profileScreens/SavedAddressesScreen";
import ProviderCheckoutScreen from "../screens/user/checkout/ProviderCheckoutScreen";
import AllReviews from "../screens/provider/profileScreens/AllReviews";
import ProviderPaymentScreen from "../screens/provider/earningScreens/ProviderPaymentScreen";

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
            <Stack.Screen name="ProviderDetail" component={ProviderDetail} />
            <Stack.Screen name="SavedAddressesScreen" component={SavedAddressesScreen} />
            <Stack.Screen name="ProviderCheckoutScreen" component={ProviderCheckoutScreen} />

            <Stack.Screen name="ProviderPaymentScreen" component={ProviderPaymentScreen} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} />

            <Stack.Screen name="SingleManDetail" component={SingleManDetail} />

            <Stack.Screen name="ProviderHome" component={ProviderHome} />
            <Stack.Screen name="DocumentsUpload" component={DocumentsScreen} />
            <Stack.Screen name="ShowPopup" component={ShowPopup} />
            <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
            <Stack.Screen name="UpdateAvailability" component={UpdateAvailabilityScreen} />
            <Stack.Screen name="ManageWorkingHours" component={WorkingHoursScreen} />
            <Stack.Screen name="MyServices" component={MyServices} />
            <Stack.Screen name="ManagePricing" component={ManagePricing} />
            <Stack.Screen name="AllReviews" component={AllReviews} />
        </Stack.Navigator>
    );
}