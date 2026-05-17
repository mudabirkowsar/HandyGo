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
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

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
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("customer"); // 'customer' or 'provider'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          {/* Decorative Top Circle */}
          <View style={styles.topCircle} />

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create <Text style={{color: COLORS.primary}}>Account</Text></Text>
            <Text style={styles.subtitle}>Join HandyGo today</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, userType === "customer" && styles.toggleBtnActive]} 
              onPress={() => setUserType("customer")}
            >
              <Ionicons 
                name="person-outline" 
                size={18} 
                color={userType === "customer" ? COLORS.white : COLORS.subtext} 
              />
              <Text style={[styles.toggleText, userType === "customer" && styles.toggleTextActive]}>Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, userType === "provider" && styles.toggleBtnActive]} 
              onPress={() => setUserType("provider")}
            >
              <Ionicons 
                name="construct-outline" 
                size={18} 
                color={userType === "provider" ? COLORS.white : COLORS.subtext} 
              />
              <Text style={[styles.toggleText, userType === "provider" && styles.toggleTextActive]}>Provider</Text>
            </TouchableOpacity>
          </View>

          {/* Registration Card */}
          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={COLORS.subtext}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email or Phone */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email or Phone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email or phone number"
                  placeholderTextColor={COLORS.subtext}
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
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

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.subtext}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.subtext} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.registerBtn}>
              <Text style={styles.registerBtnText}>
                {userType === "customer" ? "Join as Customer" : "Join as Provider"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
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
  topCircle: {
    position: 'absolute',
    top: -width * 0.15,
    left: -width * 0.15,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: COLORS.primary + '10',
    zIndex: -1,
  },
  headerSection: {
    marginTop: 60,
    marginBottom: 25,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.subtext,
    marginTop: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    padding: 5,
    borderRadius: 16,
    marginBottom: 25,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.subtext,
    marginLeft: 8,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.secondary,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  registerBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: COLORS.subtext,
    fontSize: 15,
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
});