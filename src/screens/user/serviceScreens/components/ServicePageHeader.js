import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    subtext: "#64748B",
    white: "#FFFFFF",
    border: "#E2E8F0",
    background: "#F8FAFC",
};

const CATEGORIES = ["All", "Cleaning", "Repair", "Painting", "Plumbing", "Electric", "Laundry"];

const ServicePageHeader = () => {
    const [activeTab, setActiveTab] = useState("All");

    return (
        <View style={styles.container}>
            {/* Page Title Section */}
            <View style={styles.titleSection}>
                <Text style={styles.headerTitle}>Explore <Text style={{color: COLORS.primary}}>Services</Text></Text>
                <TouchableOpacity style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={COLORS.subtext} />
                <TextInput 
                    placeholder="Search for a service..." 
                    style={styles.searchInput}
                    placeholderTextColor={COLORS.subtext}
                />
            </View>

            {/* Horizontal Categories */}
            <View>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.tabContainer}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity 
                            key={cat} 
                            onPress={() => setActiveTab(cat)}
                            style={[
                                styles.tab, 
                                activeTab === cat && styles.activeTab
                            ]}
                        >
                            <Text style={[
                                styles.tabText, 
                                activeTab === cat && styles.activeTabText
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: COLORS.secondary,
        letterSpacing: -0.5,
    },
    filterBtn: {
        width: 45,
        height: 45,
        borderRadius: 15,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        marginHorizontal: 20,
        paddingHorizontal: 15,
        borderRadius: 16,
        height: 50,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.secondary,
        fontWeight: '500',
    },
    tabContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 10,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        // Added shadow to active tab for premium feel
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.subtext,
    },
    activeTabText: {
        color: COLORS.white,
    },
});

export default ServicePageHeader;