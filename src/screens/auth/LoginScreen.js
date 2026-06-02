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
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser } from "../../../api/UserAPI";
import { loginProvider } from "../../../api/ProviderAPI";

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

export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("user");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Basic Validation
    if (!identifier || !password) {
      Alert.alert("Validation Error", "Please enter both email/phone and password.");
      return;
    }

    setIsLoading(true);
    // Fixed: changed 'phone' to 'identifier' to match your updated controllers
    const credentials = { identifier, password };

    try {
      if (activeTab === "user") {
        // --- USER LOGIN LOGIC ---
        const response = await loginUser(credentials);
        if (response.data.token) {
          await AsyncStorage.setItem("userToken", response.data.token);
          setIsLoading(false);
          navigation.replace("MainTabs");
        }
      } else {
        // --- PROVIDER LOGIN LOGIC ---
        const response = await loginProvider(credentials);
        const { token, provider } = response.data;

        // 1. Save Token immediately if login is successful
        if (token) {
          console.log("Provider logged in, token saved.", token);
          await AsyncStorage.setItem("providerToken", token);
        }

        const status = provider.verificationStatus;

        // 2. Logic based on Verification Status
        if (status === "incomplete") {
          // Provider has not uploaded documents yet
          setIsLoading(false);
          navigation.replace("DocumentsUpload");
        }
        else if (status === "pending") {
          // Provider uploaded documents, waiting for Admin
          setIsLoading(false);
          navigation.replace("ShowPopup");
        }
        else if (status === "rejected") {
          // Admin rejected the account
          setIsLoading(false);
          Alert.alert(
            "Account Rejected",
            "Your application has been rejected. Please check your email or contact support for details."
          );
          // Stay on Login (as requested)
        }
        else if (status === "approved") {
          // Full access granted
          setIsLoading(false);
          navigation.replace("ProviderHome");
        }
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
      Alert.alert("Login Failed", errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.bgDecoration} />

          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../../../assets/logo/handyGoo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandName}>
              Handy<Text style={{ color: COLORS.primary }}>Go</Text>
            </Text>
            <Text style={styles.tagline}>Premium Home Services at your door</Text>
          </View>

          {/* TAB SWITCHER */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "user" && styles.activeTab]}
              onPress={() => setActiveTab("user")}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={activeTab === "user" ? COLORS.white : COLORS.subtext}
              />
              <Text style={[styles.tabText, activeTab === "user" && styles.activeTabText]}>User</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "provider" && styles.activeTab]}
              onPress={() => setActiveTab("provider")}
            >
              <Ionicons
                name="construct-outline"
                size={18}
                color={activeTab === "provider" ? COLORS.white : COLORS.subtext}
              />
              <Text style={[styles.tabText, activeTab === "provider" && styles.activeTabText]}>Provider</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.loginTitle}>
              Login as {activeTab === "user" ? "User" : "Service Provider"}
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email or Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email or phone"
                  placeholderTextColor={COLORS.subtext}
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.subtext}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.subtext}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mainButton, isLoading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.mainButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialCard}>
              <Ionicons name="logo-google" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCard}>
              <Ionicons name="logo-apple" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCard}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  bgDecoration: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary + "10",
  },
  header: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  logoWrapper: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 10,
  },
  logo: {
    width: 45,
    height: 45,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.secondary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.border + "60",
    padding: 6,
    borderRadius: 18,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.subtext,
  },
  activeTabText: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 25,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    marginBottom: 25,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.text,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  mainButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 10,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 15,
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: "500",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialCard: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.subtext,
  },
  signupText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "800",
  },
});