import React from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar } from "react-native";
import HomeScreenHeader from "./components/HomeScreenHeader";
import HomeBanners from "./components/HomeBanners";
import HomeServices from "./components/HomeServices";
import SomeServicesList from "./components/SomeServicesList";
import SomeServiceProviders from "./components/SomeServiceProviders";
import DecorationComponent from "./components/DecorationComponent";

export default function HomeScreen({navigation}) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* The Header */}
                <HomeScreenHeader />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <HomeBanners />
                    <HomeServices />
                    <SomeServicesList />
                    <SomeServiceProviders />
                    <DecorationComponent />
                </ScrollView>
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