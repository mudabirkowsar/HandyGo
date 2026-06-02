import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Using your imported API functions
import { registerProvider } from "../../../api/ProviderAPI";
import { registerUser } from "../../../api/UserAPI";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  white: "#FFFFFF",
};

export default function RegisterScreen({ navigation }) {
  // Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("customer"); // 'customer' or 'provider'
  const [serviceProvided, setServiceProvided] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Frontend Validation
    if (!fullName || !phone || !password) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (userType === "provider" && !serviceProvided) {
      Alert.alert("Error", "Please specify the service you provide.");
      return;
    }

    setIsLoading(true);

    try {
      if (userType === "provider") {
        // --- REGISTER AS PROVIDER ---
        const providerData = {
          fullName: fullName.trim(),
          phone: phone.trim(),
          password: password,
          serviceProvided: serviceProvided.trim(),
          email: email.trim() !== "" ? email.toLowerCase().trim() : undefined,
        };

        const response = await registerProvider(providerData);

        if (response.data.success) {
          // Store token
          await AsyncStorage.setItem("providerToken", response.data.token);
          await AsyncStorage.setItem("providerRole", "provider");

          setIsLoading(false);
          navigation.replace("DocumentsUpload")
        }
      } else {
        // --- REGISTER AS CUSTOMER ---
        const userData = {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() !== "" ? email.toLowerCase().trim() : undefined,
          password: password,
        };

        const response = await registerUser(userData);

        if (response.data.success) {
          // Store token
          await AsyncStorage.setItem("userToken", response.data.token);
          await AsyncStorage.setItem("userRole", "customer");

          setIsLoading(false);
          navigation.replace("MainTabs");
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Registration Error:", error);
      const errorMsg = error.response?.data?.message || "Something went wrong. Try again.";
      Alert.alert("Registration Failed", errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.topCircle} />

          <View style={styles.headerSection}>
            <Text style={styles.title}>
              Create <Text style={{ color: COLORS.primary }}>Account</Text>
            </Text>
            <Text style={styles.subtitle}>Join HandyGo today</Text>
          </View>

          {/* Toggle Role */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, userType === "customer" && styles.toggleBtnActive]}
              onPress={() => setUserType("customer")}
            >
              <Ionicons name="person-outline" size={18} color={userType === "customer" ? COLORS.white : COLORS.subtext} />
              <Text style={[styles.toggleText, userType === "customer" && styles.toggleTextActive]}>Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, userType === "provider" && styles.toggleBtnActive]}
              onPress={() => setUserType("provider")}
            >
              <Ionicons name="construct-outline" size={18} color={userType === "provider" ? COLORS.white : COLORS.subtext} />
              <Text style={[styles.toggleText, userType === "provider" && styles.toggleTextActive]}>Provider</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            {/* Inputs */}
            <InputBox label="Full Name" icon="person-outline" value={fullName} onChange={setFullName} placeholder="John Doe" />
            <InputBox label="Phone Number" icon="call-outline" value={phone} onChange={setPhone} placeholder="1234567890" keyboard="phone-pad" />
            <InputBox label="Email (Optional)" icon="mail-outline" value={email} onChange={setEmail} placeholder="john@example.com" keyboard="email-address" />

            {userType === "provider" && (
              <InputBox label="Service Provided" icon="hammer-outline" value={serviceProvided} onChange={setServiceProvided} placeholder="e.g. Plumbing" />
            )}

            <InputBox
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              secure={!showPassword}
              toggleSecure={() => setShowPassword(!showPassword)}
              isPassword
              showPasswordIcon={showPassword}
            />

            <InputBox
              label="Confirm Password"
              icon="shield-checkmark-outline"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              secure={!showConfirmPassword}
              toggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
              isPassword
              showPasswordIcon={showConfirmPassword}
            />

            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.registerBtnText}>Register Now</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper Component for Inputs
const InputBox = ({ label, icon, value, onChange, placeholder, secure, toggleSecure, isPassword, showPasswordIcon, keyboard }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color={COLORS.subtext} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.subtext}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        keyboardType={keyboard || "default"}
        autoCapitalize="none"
      />
      {isPassword && (
        <TouchableOpacity onPress={toggleSecure}>
          <Ionicons name={showPasswordIcon ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.subtext} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  topCircle: {
    position: "absolute",
    top: -width * 0.15,
    left: -width * 0.15,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: COLORS.primary + "10",
    zIndex: -1,
  },
  headerSection: { marginTop: 50, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.secondary, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: COLORS.subtext, marginTop: 5 },
  toggleContainer: { flexDirection: "row", backgroundColor: COLORS.border + "70", padding: 5, borderRadius: 16, marginBottom: 25 },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: COLORS.primary, elevation: 3 },
  toggleText: { fontSize: 14, fontWeight: "700", color: COLORS.subtext, marginLeft: 8 },
  toggleTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 28, padding: 24, elevation: 4 },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", color: COLORS.secondary, marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: COLORS.secondary },
  registerBtn: { backgroundColor: COLORS.primary, borderRadius: 18, paddingVertical: 18, alignItems: "center", marginTop: 10 },
  registerBtnText: { color: COLORS.white, fontSize: 18, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: COLORS.subtext, fontSize: 15 },
  loginText: { color: COLORS.primary, fontWeight: "800", fontSize: 15 },
});