import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  warning: "#F59E0B",
};

const ShowPopup = ({ navigation }) => {

  const handleLogoutAndBack = async () => {
    try {
      // 1. Remove the provider tokens and data
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");
      await AsyncStorage.removeItem("providerToken"); // Just in case you used this key too

      // 2. Reset navigation back to the Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error removing token:", error);
      navigation.navigate("Login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Animated-like Icon Header */}
        <View style={styles.iconContainer}>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Ionicons name="time" size={60} color={COLORS.warning} />
            </View>
          </View>
          <View style={styles.badge}>
            <Ionicons name="sync" size={20} color={COLORS.white} />
          </View>
        </View>

        {/* Text Section */}
        <Text style={styles.title}>Under Verification</Text>
        <Text style={styles.description}>
          Your documents have been successfully submitted! Our administrative team is
          currently reviewing your profile for safety and compliance.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.secondary} />
          <Text style={styles.infoText}>
            This process usually takes <Text style={{ fontWeight: '700' }}>24 to 48 hours</Text>.
          </Text>
        </View>

        <Text style={styles.subDescription}>
          Once approved, you will receive a notification and full access to your provider dashboard.
        </Text>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleLogoutAndBack}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.white} style={{ marginRight: 10 }} />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>Sign in later to check your status</Text>
      </View>
    </SafeAreaView>
  );
};

export default ShowPopup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  outerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.warning + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  badge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.warning,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary,
    marginLeft: 10,
  },
  subDescription: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  footer: {
    padding: 30,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  footerNote: {
    marginTop: 15,
    fontSize: 13,
    color: COLORS.subtext,
  },
});