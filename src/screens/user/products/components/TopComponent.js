import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    subtext: "#64748B",
    white: "#FFFFFF",
    border: "#E2E8F0",
    background: "#F8FAFC",
};

const TopComponent = () => {
    const [locationAddress, setLocationAddress] = useState("Loading...");
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setLocationAddress("Permission Denied");
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            await AsyncStorage.setItem("userLatitude", latitude.toString());
            await AsyncStorage.setItem("userLongitude", longitude.toString());

            const reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                const city = place.city || place.subregion || place.region || "Unknown City";
                const area = place.district || place.street || place.name || "";

                setLocationAddress(`${area}${area ? ", " : ""}${city}`);
            } else {
                setLocationAddress("Unknown Location");
            }
        } catch (error) {
            console.log("Location Error:", error);
            setLocationAddress("Location Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                {/* User Info & Location Selection */}
                <View style={styles.userInfo}>
                    <Text style={styles.greeting}>Shop from</Text>

                    <TouchableOpacity style={styles.locationSelector} activeOpacity={0.7}>
                        <Ionicons name="location" size={18} color={COLORS.primary} />

                        {loading ? (
                            <ActivityIndicator
                                size="small"
                                color={COLORS.primary}
                                style={{ marginLeft: 5 }}
                            />
                        ) : (
                            <Text style={styles.locationText} numberOfLines={1}>
                                {locationAddress}
                            </Text>
                        )}

                        <Ionicons name="chevron-down" size={16} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Action Blocks: Wishlist & Market Checkout Bag */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.iconBtn, { marginRight: 10 }]}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate("WishlistScreen")}
                    >
                        <Ionicons name="heart-outline" size={22} color={COLORS.secondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 10,
        // paddingBottom: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        paddingTop: 40,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },

    userInfo: {
        flex: 1,
    },

    greeting: {
        fontSize: 13,
        color: COLORS.subtext,
        fontWeight: "500",
    },

    locationSelector: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },

    locationText: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.secondary,
        marginHorizontal: 4,
        maxWidth: "80%",
    },

    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconBtn: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },

    marketBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: COLORS.primary,
        zIndex: 2,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: COLORS.white,
        elevation: 3,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },

    badgeText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: "800",
        textAlign: "center",
        lineHeight: 11,
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 15,
    },

    placeholderText: {
        flex: 1,
        color: COLORS.subtext,
        marginLeft: 10,
        fontSize: 15,
    },
});

export default TopComponent;