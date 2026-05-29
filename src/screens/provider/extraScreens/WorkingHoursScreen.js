import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert,
    Switch,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#111827",
    subtext: "#6B7280",
    border: "#E5E7EB",
    white: "#FFFFFF",
    danger: "#EF4444",
};

const DAYS_OF_WEEK = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

// Helper to generate typical hour dropdown slots (e.g., "08:00 AM")
const GENERATED_HOURS = Array.from({ length: 24 }).flatMap((_, i) => {
    const hour = i === 0 || i === 12 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    const formattedHour = hour < 10 ? `0${hour}` : hour;
    return [`${formattedHour}:00 ${ampm}`, `${formattedHour}:30 ${ampm}`];
});

export default function WorkingHoursScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Schema structured tracking state
    const [workingHours, setWorkingHours] = useState({
        monday: { isAvailable: true, start: "09:00 AM", end: "06:00 PM" },
        tuesday: { isAvailable: true, start: "09:00 AM", end: "06:00 PM" },
        wednesday: { isAvailable: true, start: "09:00 AM", end: "06:00 PM" },
        thursday: { isAvailable: true, start: "09:00 AM", end: "06:00 PM" },
        friday: { isAvailable: true, start: "09:00 AM", end: "06:00 PM" },
        saturday: { isAvailable: true, start: "10:00 AM", end: "04:00 PM" },
        sunday: { isAvailable: false, start: "09:00 AM", end: "06:00 PM" },
    });

    // State handles custom inline modal select configurations
    const [pickerConfig, setPickerConfig] = useState({
        visible: false,
        dayKey: null,
        timeType: null, // 'start' or 'end'
    });

    useEffect(() => {
        fetchWorkingHours();
    }, []);

    const fetchWorkingHours = async () => {
        setIsLoading(true);
        try {
            // API integration patch point example:
            // const response = await api.getProviderProfile();
            // if(response.data.workingHours) setWorkingHours(response.data.workingHours);
        } catch (error) {
            Alert.alert("Error", "Failed to load working hours profile configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleDay = (dayKey, value) => {
        setWorkingHours((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                isAvailable: value,
            },
        }));
    };

    const openTimePicker = (dayKey, timeType) => {
        setPickerConfig({
            visible: true,
            dayKey,
            timeType,
        });
    };

    const selectTimeValue = (timeString) => {
        const { dayKey, timeType } = pickerConfig;
        setWorkingHours((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                [timeType]: timeString,
            },
        }));
        setPickerConfig({ visible: false, dayKey: null, timeType: null });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log("SAVING WORKING HOURS SCHEMA CONFIG:", workingHours);

            // Simulated API request
            await new Promise((resolve) => setTimeout(resolve, 1500));

            Alert.alert("Success", "Your availability and working hours have been saved.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", "Failed to update availability schedule settings.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* HEADER BAR */}
            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Working Hours</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.descriptionText}>
                    Set your standard operational working windows below. Customers will only be able to book slot times when you are active.
                </Text>

                {/* DAYS CONTAINER CARDS */}
                {DAYS_OF_WEEK.map(({ key, label }) => {
                    const dayConfig = workingHours[key];
                    return (
                        <View key={key} style={[styles.dayCard, !dayConfig.isAvailable && styles.disabledCard]}>
                            <View style={styles.cardHeader}>
                                <View style={styles.dayInfo}>
                                    <Ionicons
                                        name={dayConfig.isAvailable ? "calendar" : "calendar-outline"}
                                        size={22}
                                        color={dayConfig.isAvailable ? COLORS.primary : COLORS.subtext}
                                    />
                                    <Text style={[styles.dayLabel, !dayConfig.isAvailable && styles.disabledText]}>
                                        {label}
                                    </Text>
                                </View>
                                <Switch
                                    trackColor={{ false: COLORS.border, true: COLORS.primary + "40" }}
                                    thumbColor={dayConfig.isAvailable ? COLORS.primary : "#CBD5E1"}
                                    ios_backgroundColor={COLORS.border}
                                    onValueChange={(val) => handleToggleDay(key, val)}
                                    value={dayConfig.isAvailable}
                                />
                            </View>

                            {dayConfig.isAvailable ? (
                                <View style={styles.timeSelectorsRow}>
                                    <TouchableOpacity
                                        style={styles.timePickerButton}
                                        onPress={() => openTimePicker(key, "start")}
                                    >
                                        <Text style={styles.timeLabel}>Start Time</Text>
                                        <View style={styles.timeValueContainer}>
                                            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
                                            <Text style={styles.timeValueText}>{dayConfig.start}</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.timeDivider}>
                                        <Text style={{ color: COLORS.subtext }}>to</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.timePickerButton}
                                        onPress={() => openTimePicker(key, "end")}
                                    >
                                        <Text style={styles.timeLabel}>End Time</Text>
                                        <View style={styles.timeValueContainer}>
                                            <Ionicons name="time-outline" size={18} color={COLORS.danger} />
                                            <Text style={styles.timeValueText}>{dayConfig.end}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.closedPlaceholder}>
                                    <Text style={styles.closedText}>Shop Marked Closed / Offline</Text>
                                </View>
                            )}
                        </View>
                    );
                })}

                {/* SAVE SUBMIT BUTTON */}
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && { opacity: 0.8 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <>
                            <Text style={styles.saveButtonText}>Save Schedule Config</Text>
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* QUICK INLINE HOURS PICKER SELECTION SHEET */}
            {pickerConfig.visible && (
                <View style={styles.pickerModalOverlay}>
                    <View style={styles.pickerModalContainer}>
                        <View style={styles.pickerModalHeader}>
                            <Text style={styles.pickerModalTitle}>
                                Select {pickerConfig.timeType === "start" ? "Opening" : "Closing"} Time
                            </Text>
                            <TouchableOpacity
                                onPress={() => setPickerConfig({ visible: false, dayKey: null, timeType: null })}
                            >
                                <Ionicons name="close-circle" size={26} color={COLORS.subtext} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerScrollView} showsVerticalScrollIndicator={true}>
                            {GENERATED_HOURS.map((hourSlot) => (
                                <TouchableOpacity
                                    key={hourSlot}
                                    style={styles.hourSlotOption}
                                    onPress={() => selectTimeValue(hourSlot)}
                                >
                                    <Text style={styles.hourSlotOptionText}>{hourSlot}</Text>
                                    <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
    headerBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    backButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    scrollContainer: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
    },
    descriptionText: {
        fontSize: 14,
        color: COLORS.subtext,
        lineHeight: 20,
        marginBottom: 24,
    },
    dayCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    disabledCard: {
        backgroundColor: "#F1F5F9",
        borderColor: "transparent",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    dayInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    dayLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    disabledText: {
        color: COLORS.subtext,
        fontWeight: "500",
    },
    timeSelectorsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 18,
        gap: 12,
    },
    timePickerButton: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.subtext,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    timeValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timeValueText: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    timeDivider: {
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 16,
    },
    closedPlaceholder: {
        marginTop: 14,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    closedText: {
        fontSize: 13,
        fontWeight: "500",
        color: COLORS.subtext,
        fontStyle: "italic",
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 20,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: "700",
    },
    // PICKER OVERLAY SHEET STYLING
    pickerModalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "flex-end",
        zIndex: 999,
    },
    pickerModalContainer: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: "50%",
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
    },
    pickerModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
    },
    pickerModalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    pickerScrollView: {
        paddingHorizontal: 24,
    },
    hourSlotOption: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: COLORS.background,
    },
    hourSlotOptionText: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.text,
    },
});