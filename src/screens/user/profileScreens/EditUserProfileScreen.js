import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateUserProfile } from '../../../../api/UserAPI'; // Update this path to match your API helper location

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#111827",
    subtext: "#6B7280",
    border: "#E2E8F0",
    white: "#FFFFFF",
    error: "#EF4444",
};

export default function EditProfileScreen({ route, navigation }) {
    // Grab the passed profile data from the previous screen parameters
    const { profileData } = route.params || {};

    // Initialize editable state variables with current profile values
    const [fullName, setFullName] = useState(profileData?.fullName || '');
    const [phone, setPhone] = useState(profileData?.phone || '');
    const [email, setEmail] = useState(profileData?.email || '');
    const [gender, setGender] = useState(profileData?.gender || '');
    const [language, setLanguage] = useState(profileData?.preferredLanguage || 'English');
    const [paymentMethod, setPaymentMethod] = useState(profileData?.preferredPaymentMethod || 'upi');

    const [isSaving, setIsSaving] = useState(false);

    // Core profile update execution handler
    const handleSaveChanges = async () => {
        // 1. Front-end Form Validation
        if (!fullName.trim()) {
            Alert.alert("Required Field", "Please enter your full name.");
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert("Invalid Input", "Please enter a valid email address.");
            return;
        }

        setIsSaving(true);

        try {
            // 2. Package data object payload
            const updatedFields = {
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                gender: gender,
                preferredLanguage: language,
                preferredPaymentMethod: paymentMethod,
            };

            console.log("EXECUTING PROFILE UPDATE WITH PAYLOAD:", updatedFields);

            // 3. Fire the Patch request directly to your API endpoint
            const response = await updateUserProfile(updatedFields);

            if (response.data && response.data.success) {
                Alert.alert(
                    "Success",
                    response.data.message || "Your profile settings have been updated successfully.",
                    [{ text: "OK", onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert("Update Failed", response.data.message || "The server rejected the update.");
            }
        } catch (error) {
            console.log("PROFILE UPDATE FAILURE:", error?.response?.data || error.message);

            const serverErrorMessage = error?.response?.data?.message;
            Alert.alert(
                "Update Error",
                serverErrorMessage || error.message || "Something went wrong while saving changes."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Navigation Header bar */}
            <View style={styles.navHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
                    <Ionicons name="close" size={26} color={COLORS.secondary} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSaveChanges} disabled={isSaving} style={styles.navButton}>
                    {isSaving ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Text style={styles.saveNavText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Section: Profile Identity Information */}
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.formCard}>

                        {/* Input Element: Full Name */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Enter full name"
                                    placeholderTextColor={COLORS.subtext}
                                />
                            </View>
                        </View>

                        {/* Input Element: Email */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="name@example.com"
                                    placeholderTextColor={COLORS.subtext}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Input Element: Phone */}
                        <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={18} color={COLORS.subtext} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter phone number"
                                    placeholderTextColor={COLORS.subtext}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                    </View>

                    {/* Section: Demographics Info Selection */}
                    <Text style={styles.sectionTitle}>Demographics</Text>
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.genderRow}>

                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                                onPress={() => setGender('male')}
                            >
                                <Ionicons name="male" size={16} color={gender === 'male' ? COLORS.white : COLORS.subtext} />
                                <Text style={[styles.genderButtonText, gender === 'male' && styles.genderButtonTextActive]}>Male</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                                onPress={() => setGender('female')}
                            >
                                <Ionicons name="female" size={16} color={gender === 'female' ? COLORS.white : COLORS.subtext} />
                                <Text style={[styles.genderButtonText, gender === 'female' && styles.genderButtonTextActive]}>Female</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.genderButton, gender === 'other' && styles.genderButtonActive]}
                                onPress={() => setGender('other')}
                            >
                                <Ionicons name="options" size={16} color={gender === 'other' ? COLORS.white : COLORS.subtext} />
                                <Text style={[styles.genderButtonText, gender === 'other' && styles.genderButtonTextActive]}>Other</Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                    {/* Section: Preferences Selectors */}
                    <Text style={styles.sectionTitle}>Application Customization</Text>
                    <View style={styles.formCard}>

                        {/* Preference: Preferred Language Setting */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Preferred Language</Text>
                            <View style={styles.selectorRow}>
                                {['English', 'Hindi', 'Spanish'].map((lang) => (
                                    <TouchableOpacity
                                        key={lang}
                                        style={[styles.pillSelector, language === lang && styles.pillSelectorActive]}
                                        onPress={() => setLanguage(lang)}
                                    >
                                        <Text style={[styles.pillSelectorText, language === lang && styles.pillSelectorTextActive]}>{lang}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Preference: Preferred Billing Method Setting */}
                        <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                            <Text style={styles.inputLabel}>Preferred Payment Method</Text>
                            <View style={styles.selectorRow}>
                                {['upi', 'card', 'cash'].map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        style={[styles.pillSelector, paymentMethod === method && styles.pillSelectorActive]}
                                        onPress={() => setPaymentMethod(method)}
                                    >
                                        <Text style={[styles.pillSelectorText, paymentMethod === method && styles.pillSelectorTextActive]}>
                                            {method.toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                    </View>

                    {/* Large Action Bottom Submit trigger */}
                    <TouchableOpacity
                        style={[styles.submitButton, isSaving && { opacity: 0.6 }]}
                        onPress={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Save and Apply Changes</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 40
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    navButton: {
        padding: 4,
        minWidth: 44,
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.secondary,
    },
    saveNavText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.subtext,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 20,
    },
    formCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.secondary,
        marginBottom: 8,
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: 48,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    genderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 46,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        gap: 6,
    },
    genderButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    genderButtonText: {
        fontSize: 14,
        color: COLORS.subtext,
        fontWeight: '600',
    },
    genderButtonTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    selectorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pillSelector: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pillSelectorActive: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    pillSelectorText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '600',
    },
    pillSelectorTextActive: {
        color: COLORS.white,
        fontWeight: '700',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        marginHorizontal: 16,
        marginTop: 32,
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '700',
    },
});