import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Alert,
    Platform,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

// API Services Imports
import {
    getProviderProfile,
    updateProviderLocation,
    updateProviderAvailability
} from "../../../../../api/ProviderAPI";

// Premium Color System
const COLORS = {
    primary: "#10B981",       // Vibrant Emerald Green
    primaryLight: "#E6F4EA",  // Light Emerald background for pill badge
    secondary: "#0F172A",     // Deep Slate
    background: "#FFFFFF",
    textMain: "#1E293B",      // Polished dark gray text
    textMuted: "#64748B",     // Medium slate for subtitles
    border: "#F1F5F9",        // Clean border lines
    offline: "#64748B",       // Cool gray
    offlineLight: "#F1F5F9",  // Cool gray background for pill badge
};

export default function Navbar() {
    const [providerName, setProviderName] = useState("Provider");
    const [greeting, setGreeting] = useState("Hello");
    const [locationText, setLocationText] = useState("Fetching location...");
    const [isLocationLoading, setIsLocationLoading] = useState(false);

    // UI Switch State: true (Available) | false (Offline)
    const [isAvailable, setIsAvailable] = useState(true);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);

    const calculateGreeting = () => {
        const hrs = new Date().getHours();

        if (hrs < 12) {
            setGreeting("Good morning");
        } else if (hrs < 17) {
            setGreeting("Good afternoon");
        } else {
            setGreeting("Good evening");
        }
    };

    useEffect(() => {
        calculateGreeting();
        fetchProviderInitialState();
    }, []);


    // Pull down initial provider metadata profile configuration
    const fetchProviderInitialState = async () => {
        try {
            const response = await getProviderProfile();
            if (response?.data?.success && response?.data?.provider) {
                const p = response.data.provider;
                setProviderName(p.fullName || "Provider");

                // Match UI switch configuration to database enum parameter state
                if (p.availabilityStatus === "offline") {
                    setIsAvailable(false);
                } else {
                    setIsAvailable(true);
                }
            }
        } catch (error) {
            console.error("Failed to fetch initial profile inside Navbar:", error);
        } finally {
            // Auto-trigger location payload dispatch silently on layout initial render mounting
            syncCoordinatesWithBackend(false);
        }
    };

    // Coordinates Grab & GeoJSON Synchronization Request Action
    const syncCoordinatesWithBackend = async (showAlertOnError = true) => {
        setIsLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setLocationText("Location denied");
                if (showAlertOnError) {
                    Alert.alert(
                        "Location Permission Required",
                        "Please turn on location context access settings permissions so customers can view your proximity map area parameters."
                    );
                }
                setIsLocationLoading(false);
                return;
            }

            // Capture native hardware satellite GPS metrics snapshot
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = location.coords;

            // 1. Fire parameters directly into your database updateLocation route handler
            await updateProviderLocation({ latitude, longitude });

            // 2. Decode coordinates elements into clean localized text components
            const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (reverseGeocode && reverseGeocode.length > 0) {
                const address = reverseGeocode[0];
                const city = address.city || address.subregion || "Unknown City";
                const neighborhood = address.district || address.name || "";
                setLocationText(neighborhood ? `${neighborhood}, ${city}` : city);
            } else {
                setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
        } catch (error) {
            console.error("Error updating location metrics:", error);
            setLocationText("Sync failed");
        } finally {
            setIsLocationLoading(false);
        }
    };

    // Handle Switch interaction and commit selection to updateAvailabilityStatus backend route
    const handleAvailabilityToggle = async (newValue) => {
        // Optimistically shift layout engine interface state value
        setIsAvailable(newValue);
        setIsStatusUpdating(true);

        // Map boolean options context structure into explicit database string parameters
        const statusPayloadString = newValue ? "available" : "offline";

        try {
            const response = await updateProviderAvailability(statusPayloadString);

            if (!response?.data?.success) {
                // Revert switch to previous state if status update failed validation
                setIsAvailable(!newValue);
                Alert.alert("Status Sync Error", "Could not submit availability update to server cloud database.");
            }
        } catch (error) {
            console.error("Failed to sync availability status state:", error);
            setIsAvailable(!newValue); // Roll back state on catch exception blocks
            Alert.alert("Connection Failure", "Server pipeline timing out. Please retry status transition toggle change.");
        } finally {
            setIsStatusUpdating(false);
        }
    };

    return (
        <View style={styles.navbarWrapper}>
            <View style={styles.navbarContainer}>

                {/* LEFT BLOCK: NAME PROFILE GREETING & REGION RESOLUTION TAG */}
                <View style={styles.leftMetaColumn}>
                    <Text style={styles.greetingText}>
                        {greeting},
                    </Text>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {providerName}
                    </Text>

                    <TouchableOpacity
                        style={styles.locationSelectorRow}
                        onPress={() => syncCoordinatesWithBackend(true)}
                        disabled={isLocationLoading}
                        activeOpacity={0.6}
                    >
                        <View style={styles.locationIconCircle}>
                            <Ionicons name="location" size={13} color={COLORS.primary} />
                        </View>
                        <Text style={styles.locationText} numberOfLines={1}>
                            {locationText}
                        </Text>
                        {isLocationLoading ? (
                            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 6 }} />
                        ) : (
                            <Ionicons name="refresh-outline" size={12} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* RIGHT BLOCK: AVAILABILITY ENGINE RULES SWITCH */}
                <View style={styles.rightActionColumn}>
                    <View style={[
                        styles.statusBadgeWrapper,
                        { backgroundColor: isAvailable ? COLORS.primaryLight : COLORS.offlineLight }
                    ]}>
                        {isStatusUpdating ? (
                            <ActivityIndicator size="small" color={isAvailable ? COLORS.primary : COLORS.offline} />
                        ) : (
                            <>
                                <View style={[styles.pulseDot, { backgroundColor: isAvailable ? COLORS.primary : COLORS.offline }]} />
                                <Text style={[styles.statusText, { color: isAvailable ? COLORS.primary : COLORS.offline }]}>
                                    {isAvailable ? "Online" : "Offline"}
                                </Text>
                            </>
                        )}
                    </View>

                    <Switch
                        trackColor={{ false: "#E2E8F0", true: COLORS.primary + "40" }}
                        thumbColor={isAvailable ? COLORS.primary : "#94A3B8"}
                        ios_backgroundColor="#E2E8F0"
                        onValueChange={handleAvailabilityToggle}
                        value={isAvailable}
                        disabled={isStatusUpdating}
                        style={styles.switchStyle}
                    />
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navbarWrapper: {
        backgroundColor: COLORS.background,
        // Premium Subtle Floating Dropshadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 5,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 10,
    },
    navbarContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        // Safe spacing fallback for cross-platform top notches
        paddingTop: Platform.OS === "ios" ? 12 : (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 16),
        paddingBottom: 16,
    },
    leftMetaColumn: {
        flex: 1,
        marginRight: 16,
    },
    greetingText: {
        fontSize: 13,
        color: COLORS.textMuted,
        fontWeight: "500",
        textTransform: "capitalize",
    },
    nameText: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.secondary,
        letterSpacing: -0.3,
        marginTop: 1,
    },
    locationSelectorRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        alignSelf: "flex-start",
    },
    locationIconCircle: {
        backgroundColor: COLORS.primaryLight,
        padding: 4,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    locationText: {
        fontSize: 12,
        color: COLORS.textMain,
        fontWeight: "600",
        marginLeft: 6,
        maxWidth: "80%",
    },
    rightActionColumn: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    statusBadgeWrapper: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 8,
        gap: 5,
        height: 24,
        justifyContent: "center",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    switchStyle: {
        // Uniform sizing configuration scaling between platforms smoothly
        transform: Platform.OS === "ios" ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [{ scaleX: 1.0 }, { scaleY: 1.0 }],
    },
});