import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Switch,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

// API Services Imports
import { getProviderProfile, updateProfile } from "../../../../api/ProviderAPI";

const COLORS = {
  primary: "#10B981", // More vibrant modern emerald green
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#64748B", // Soft modern slate gray
  border: "#E2E8F0",
  white: "#FFFFFF",
  danger: "#EF4444",
  inputBg: "#F1F5F9",
};

export default function ProviderProfileScreen() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // =====================================================
  // STATE MANAGEMENT (MATCHES BACKEND CONTROLLER FIELDS)
  // =====================================================
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("male");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [serviceProvided, setServiceProvided] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState("");
  const [languages, setLanguages] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState(null); // Local picker URI tracker

  // Nested Address Object Fields
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Nested Bank Details Object Fields
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");

  // Nested Notification Preferences Toggles
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(true);
  const [payoutNotifications, setPayoutNotifications] = useState(true);

  // Custom Alert Popup State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
    onClose: null,
  });

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  useEffect(() => {
    if (alertConfig.visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
    }
  }, [alertConfig.visible]);

  const showCustomPopup = (type, title, message, onClose = null) => {
    setAlertConfig({ visible: true, type, title, message, onClose });
  };

  const closeCustomPopup = () => {
    const pendingCallback = alertConfig.onClose;
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    if (pendingCallback) {
      setTimeout(() => pendingCallback(), 300);
    }
  };

  const fetchProfileDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getProviderProfile();
      if (response.data && response.data.success) {
        const p = response.data.provider;

        setFullName(p.fullName || "");
        setBio(p.bio || "");
        setGender(p.gender || "male");
        if (p.dateOfBirth) setDateOfBirth(p.dateOfBirth.split("T")[0]);
        setServiceProvided(p.serviceProvided || "");
        setExperienceYears(p.experienceYears ? String(p.experienceYears) : "");
        setProfileImage(p.profileImage || "");

        if (p.skills) setSkills(p.skills.join(", "));
        if (p.languages) setLanguages(p.languages.join(", "));

        if (p.address) {
          setHouseNumber(p.address.houseNumber || "");
          setStreet(p.address.street || "");
          setLandmark(p.address.landmark || "");
          setCity(p.address.city || "");
          setState(p.address.state || "");
          setCountry(p.address.country || "");
          setPostalCode(p.address.postalCode || "");
        }
        if (p.bankDetails) {
          setAccountHolderName(p.bankDetails.accountHolderName || "");
          setBankName(p.bankDetails.bankName || "");
          setAccountNumber(p.bankDetails.accountNumber || "");
          setIfscCode(p.bankDetails.ifscCode || "");
          setUpiId(p.bankDetails.upiId || "");
        }
        if (p.notificationPreferences) {
          setBookingAlerts(p.notificationPreferences.bookingAlerts ?? true);
          setMarketingNotifications(p.notificationPreferences.marketingNotifications ?? true);
          setPayoutNotifications(p.notificationPreferences.payoutNotifications ?? true);
        }
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      showCustomPopup("error", "Fetch Failed", "Could not load your profile details.");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // MEDIA DEVICE ATTACHMENT CONTROLLERS
  // =====================================================
  const handleSelectImageSource = () => {
    Alert.alert(
      "Profile Picture",
      "Select avatar image reference source location:",
      [
        { text: "Open Camera", onPress: openCameraPicker },
        { text: "Choose from Gallery", onPress: openGalleryPicker },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const openGalleryPicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showCustomPopup("error", "Permission Denied", "App requires photo gallery tracking rights to select custom file vectors.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const openCameraPicker = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      showCustomPopup("error", "Permission Denied", "App requires active terminal camera permissions to register visual identity matrices.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  // =====================================================
  // API PROFILE SYNC SUBMITTER (HANDLES FORM DATA MUTATIONS)
  // =====================================================
  // Inside ProviderProfileScreen.js -> handleUpdate function

  const handleUpdate = async () => {
    if (!fullName.trim() || !serviceProvided.trim()) {
      showCustomPopup("error", "Validation Error", "Full Name and Service Category are mandatory.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();

      // 1. Append basic fields
      formData.append("fullName", fullName.trim());
      formData.append("bio", bio.trim());
      formData.append("gender", gender);
      formData.append("dateOfBirth", dateOfBirth || "");
      formData.append("serviceProvided", serviceProvided.trim());
      formData.append("experienceYears", experienceYears ? String(experienceYears) : "0");

      // 2. Handle Image Upload
      if (selectedImageUri) {
        const uri = selectedImageUri;
        const uriParts = uri.split(".");
        const fileType = uriParts[uriParts.length - 1];

        formData.append("profileImage", {
          uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
          name: `profile.${fileType}`,
          type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        });
      }

      // 3. Append Arrays (Backend expects key[] for multiple values)
      const skillArray = skills.split(",").map((s) => s.trim()).filter((s) => s);
      skillArray.forEach((s) => formData.append("skills[]", s));

      const langArray = languages.split(",").map((l) => l.trim()).filter((l) => l);
      langArray.forEach((l) => formData.append("languages[]", l));

      // 4. Append Nested Objects using dot notation
      formData.append("address.houseNumber", houseNumber.trim());
      formData.append("address.street", street.trim());
      formData.append("address.landmark", landmark.trim());
      formData.append("address.city", city.trim());
      formData.append("address.state", state.trim());
      formData.append("address.country", country.trim());
      formData.append("address.postalCode", postalCode.trim());

      formData.append("bankDetails.accountHolderName", accountHolderName.trim());
      formData.append("bankDetails.bankName", bankName.trim());
      formData.append("bankDetails.accountNumber", accountNumber.trim());
      formData.append("bankDetails.ifscCode", ifscCode.trim());
      formData.append("bankDetails.upiId", upiId.trim());

      formData.append("notificationPreferences.bookingAlerts", String(bookingAlerts));
      formData.append("notificationPreferences.marketingNotifications", String(marketingNotifications));
      formData.append("notificationPreferences.payoutNotifications", String(payoutNotifications));

      // Note: Use updateProfile(formData)
      // IMPORTANT: Ensure your API instance (axios) has headers: { 'Content-Type': 'multipart/form-data' }
      const response = await updateProfile(formData);

      if (response.data && response.data.success) {
        showCustomPopup("success", "Success", "Profile updated successfully.", () => {
          navigation.goBack();
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      showCustomPopup("error", "Update Failed", error.response?.data?.message || "Server Error");
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>

        {/* HEADER BAR */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

          {/* PROFILE IMAGE HERO CONTAINER */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {selectedImageUri || profileImage ? (
                <Image
                  source={{ uri: selectedImageUri || profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={46} color={COLORS.subtext} />
                </View>
              )}
              <TouchableOpacity
                style={styles.avatarEditButton}
                activeOpacity={0.8}
                onPress={handleSelectImageSource}
              >
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarNameText}>{fullName || "Service Provider"}</Text>
            <Text style={styles.avatarSubText}>{serviceProvided || "Category Unset"}</Text>
          </View>

          {/* SECTION 1: PERSONAL DETAILS */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Enter your full name" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Bio / Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell customers about your qualifications..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" placeholderTextColor="#94A3B8" />
              </View>

              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                  {["male", "female", "other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.genderButton, gender === g && styles.genderActive]}
                      onPress={() => setGender(g)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* SECTION 2: PROFESSIONAL DETAILS */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Professional Details</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Primary Service Category *</Text>
              <TextInput style={styles.input} value={serviceProvided} onChangeText={setServiceProvided} placeholder="e.g., Master Plumber" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput style={styles.input} value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" placeholder="e.g., 5" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Skills (Comma Separated)</Text>
              <TextInput style={styles.input} value={skills} onChangeText={setSkills} placeholder="Leak repair, Pipe setup" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Languages Spoken</Text>
              <TextInput style={styles.input} value={languages} onChangeText={setLanguages} placeholder="English, Hindi" placeholderTextColor="#94A3B8" />
            </View>
          </View>

          {/* SECTION 3: ADDRESS PARAMETERS */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Service Address</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>Flat / House No.</Text>
                <TextInput style={styles.input} value={houseNumber} onChangeText={setHouseNumber} placeholder="404" placeholderTextColor="#94A3B8" />
              </View>
              <View style={[styles.inputWrapper, { flex: 2, marginLeft: 6 }]}>
                <Text style={styles.label}>Street / Locality</Text>
                <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder="Linking Road" placeholderTextColor="#94A3B8" />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Landmark</Text>
              <TextInput style={styles.input} value={landmark} onChangeText={setLandmark} placeholder="Near Metro Station" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Mumbai" placeholderTextColor="#94A3B8" />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="MH" placeholderTextColor="#94A3B8" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>Postal Code</Text>
                <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" placeholder="400001" placeholderTextColor="#94A3B8" />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.label}>Country</Text>
                <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder="India" placeholderTextColor="#94A3B8" />
              </View>
            </View>
          </View>

          {/* SECTION 4: BANK METRICS */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Payout Bank Details</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput style={styles.input} value={accountHolderName} onChangeText={setAccountHolderName} placeholder="As per official passbook" placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput style={styles.input} value={bankName} onChangeText={setBankName} placeholder="HDFC Bank" placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput style={styles.input} value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" placeholder="501000234123" placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 6 }]}>
                <Text style={styles.label}>IFSC Code</Text>
                <TextInput style={styles.input} value={ifscCode} onChangeText={setIfscCode} autoCapitalize="characters" placeholder="HDFC0000123" placeholderTextColor="#94A3B8" />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginLeft: 6 }]}>
                <Text style={styles.label}>UPI ID</Text>
                <TextInput style={styles.input} value={upiId} onChangeText={setUpiId} autoCapitalize="none" placeholder="name@upi" placeholderTextColor="#94A3B8" />
              </View>
            </View>
          </View>

          {/* SECTION 5: NOTIFICATION PREFERENCES */}
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notification Rules</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Booking Alerts</Text>
                <Text style={styles.switchSubLabel}>Instantly alert updates on live bookings</Text>
              </View>
              <Switch trackColor={{ false: COLORS.border, true: COLORS.primary + "30" }} thumbColor={bookingAlerts ? COLORS.primary : "#94A3B8"} value={bookingAlerts} onValueChange={setBookingAlerts} />
            </View>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.switchLabel}>Marketing Notifications</Text>
                <Text style={styles.switchSubLabel}>Promotional discounts and updates</Text>
              </View>
              <Switch trackColor={{ false: COLORS.border, true: COLORS.primary + "30" }} thumbColor={marketingNotifications ? COLORS.primary : "#94A3B8"} value={marketingNotifications} onValueChange={setMarketingNotifications} />
            </View>
            <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View>
                <Text style={styles.switchLabel}>Payout Notifications</Text>
                <Text style={styles.switchSubLabel}>Receipts and transfer confirmations</Text>
              </View>
              <Switch trackColor={{ false: COLORS.border, true: COLORS.primary + "30" }} thumbColor={payoutNotifications ? COLORS.primary : "#94A3B8"} value={payoutNotifications} onValueChange={setPayoutNotifications} />
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={[styles.saveButton, isSaving && { opacity: 0.9 }]} onPress={handleUpdate} disabled={isSaving} activeOpacity={0.8}>
            {isSaving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Changes</Text>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* CUSTOM ANIMATED MODAL POPUP DIALOG */}
        <Modal transparent visible={alertConfig.visible} animationType="none" onRequestClose={closeCustomPopup}>
          <View style={styles.popupOverlay}>
            <Animated.View style={[styles.popupContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
              <View style={[styles.popupIconWrapper, { backgroundColor: alertConfig.type === "success" ? COLORS.primary + "15" : COLORS.danger + "15" }]}>
                <Ionicons name={alertConfig.type === "success" ? "checkmark" : "alert"} size={36} color={alertConfig.type === "success" ? COLORS.primary : COLORS.danger} />
              </View>
              <Text style={styles.popupTitle}>{alertConfig.title}</Text>
              <Text style={styles.popupMessage}>{alertConfig.message}</Text>
              <TouchableOpacity style={[styles.popupButton, { backgroundColor: alertConfig.type === "success" ? COLORS.primary : COLORS.secondary }]} onPress={closeCustomPopup} activeOpacity={0.8}>
                <Text style={styles.popupButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 30, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  headerBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.border },
  backButton: { padding: 6, borderRadius: 10, backgroundColor: COLORS.background },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.secondary },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  // Avatar Hero Layout Styles
  avatarContainer: { alignItems: "center", marginBottom: 24 },
  avatarWrapper: { position: "relative", marginBottom: 12 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: COLORS.white },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: COLORS.white },
  avatarEditButton: { position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: COLORS.white },
  avatarNameText: { fontSize: 18, fontWeight: "700", color: COLORS.secondary },
  avatarSubText: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },

  // Section Headers
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 12, marginLeft: 4, gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.secondary, letterSpacing: 0.3 },

  // Cards and Forms
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  inputWrapper: { marginBottom: 16 },
  row: { flexDirection: "row" },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.subtext, marginBottom: 8, marginLeft: 2 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: Platform.OS === "ios" ? 14 : 10, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: "transparent" },
  textArea: { minHeight: 80, textAlignVertical: "top" },

  // Gender Selection row
  genderRow: { flexDirection: "row", gap: 6, height: 46 },
  genderButton: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  genderActive: { backgroundColor: COLORS.secondary },
  genderText: { fontSize: 13, fontWeight: "600", color: COLORS.subtext, textTransform: "capitalize" },
  genderTextActive: { color: COLORS.white },

  // Switches
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  switchLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  switchSubLabel: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },

  // Submit Button
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 32, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  // Popups
  popupOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  popupContainer: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: "100%", maxWidth: 320, alignItems: "center" },
  popupIconWrapper: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  popupTitle: { fontSize: 18, fontWeight: "700", color: COLORS.secondary, textAlign: "center", marginBottom: 8 },
  popupMessage: { fontSize: 14, color: COLORS.subtext, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  popupButton: { borderRadius: 12, paddingVertical: 12, width: "100%", alignItems: "center", justifyContent: "center" },
  popupButtonText: { color: COLORS.white, fontSize: 15, fontWeight: "600" },
});