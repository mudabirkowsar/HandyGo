import React from "react";
import { View, StyleSheet, FlatList, SafeAreaView, StatusBar } from "react-native";
import HomeScreenHeader from "./components/HomeScreenHeader";
import HomeBanners from "./components/HomeBanners";
import HomeServices from "./components/HomeServices";
import SomeServicesList from "./components/SomeServicesList";
import SomeServiceProviders from "./components/SomeServiceProviders";
import DecorationComponent from "./components/DecorationComponent";

export default function HomeScreen({navigation}) {
    // Array holding your components exactly in the order you want them
    const dashboardSections = [
        { id: "1", component: <HomeBanners /> },
        { id: "2", component: <HomeServices /> },
        { id: "3", component: <SomeServicesList /> },
        { id: "4", component: <SomeServiceProviders /> },
        { id: "5", component: <DecorationComponent /> },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* The Header */}
                <HomeScreenHeader />

                {/* Replaced ScrollView with FlatList to fix the VirtualizedList error */}
                <FlatList
                    data={dashboardSections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => item.component}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent} // Kept your original style reference
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        paddingTop: 40,
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC", // Light background for the body
    },
});