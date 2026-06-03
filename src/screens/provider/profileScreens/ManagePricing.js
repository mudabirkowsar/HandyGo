import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Platform,
} from "react-native";
// Importing Expo Vector Icons
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchProviderServices, updateGlobalBaseRates } from "../../../../api/ProviderAPI";

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
  warning: "#F59E0B",
};

const ManagePricing = () => {
  // State variables for baseline global metrics
  const [perDayPrice, setPerDayPrice] = useState("");
  const [overtimeHourlyPrice, setOvertimeHourlyPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Custom Alert Popup States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success", // 'success' | 'error'
    title: "",
    message: "",
  });

  // Load existing rates on mount
  useEffect(() => {
    loadPricingData();
  }, []);

  // Helper to trigger custom popups
  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const response = await fetchProviderServices();
      if (response?.data?.success) {
        const { perDayPrice, overtimeHourlyPrice } = response.data.data;
        setPerDayPrice(perDayPrice ? String(perDayPrice) : "");
        setOvertimeHourlyPrice(overtimeHourlyPrice ? String(overtimeHourlyPrice) : "");
      }
    } catch (error) {
      showAlert("error", "Error", error?.response?.data?.message || "Failed to load pricing metrics.");
    } finally {
      setLoading(false);
    }
  };

  // Submit and update standard operational flat rates
  const handleSavePricing = async () => {
    if (!perDayPrice.trim() && !overtimeHourlyPrice.trim()) {
      showAlert("error", "Validation Error", "Please provide at least one pricing baseline value.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        perDayPrice: perDayPrice.trim() ? Number(perDayPrice) : 0,
        overtimeHourlyPrice: overtimeHourlyPrice.trim() ? Number(overtimeHourlyPrice) : 0,
      };

      const response = await updateGlobalBaseRates(payload);
      if (response?.data?.success) {
        showAlert("success", "Success", "Global operational pricing structure updated cleanly!");
      }
    } catch (error) {
      showAlert("error", "Error", error?.response?.data?.message || "Failed to persist pricing structure changes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Header Description Title */}
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Manage Pricing</Text>
            <Text style={styles.pageSubtitle}>
              Configure your standard flat daily operational rates and standalone structural overtime fees.
            </Text>
          </View>

          {/* Configuration Card Surface */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <MaterialCommunityIcons name="calculator-variant-outline" size={22} color={COLORS.primary} />
              <View style={styles.cardHeaderTitles}>
                <Text style={styles.cardTitle}>Global Pricing Setup</Text>
                <Text style={styles.cardSubtitle}>General baseline parameters applied across client engagements</Text>
              </View>
            </View>

            {/* Per Day Price Block */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Per Day Base Price</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5000"
                  placeholderTextColor={COLORS.subtext}
                  keyboardType="numeric"
                  value={perDayPrice}
                  onChangeText={setPerDayPrice}
                />
                {perDayPrice.length > 0 && (
                  <TouchableOpacity onPress={() => setPerDayPrice("")} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color={COLORS.subtext} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.inputHint}>Standard structural baseline rate for a full daily engagement slot.</Text>
            </View>

            {/* Overtime Price Block */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Overtime Price / hr</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 500"
                  placeholderTextColor={COLORS.subtext}
                  keyboardType="numeric"
                  value={overtimeHourlyPrice}
                  onChangeText={setOvertimeHourlyPrice}
                />
                {overtimeHourlyPrice.length > 0 && (
                  <TouchableOpacity onPress={() => setOvertimeHourlyPrice("")} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={18} color={COLORS.subtext} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.inputHint}>Hourly fee applied for tasks extended past normal working profiles.</Text>
            </View>

            {/* Action Trigger Button */}
            <TouchableOpacity
              style={[styles.saveButton, submitting && styles.disabledButton]}
              onPress={handleSavePricing}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <View style={styles.saveButtonContent}>
                  <Ionicons name="cloud-upload-outline" size={20} color={COLORS.white} style={styles.saveIcon} />
                  <Text style={styles.saveButtonText}>Save Pricing Structure</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- INTEGRATED BRAND POPUP MODAL --- */}
      <Modal visible={alertVisible} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconContainer}>
              {alertConfig.type === "success" ? (
                <Ionicons name="checkmark-circle" size={54} color={COLORS.primary} />
              ) : (
                <Ionicons name="alert-circle" size={54} color={COLORS.danger} />
              )}
            </View>

            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>

            <TouchableOpacity
              style={styles.alertPrimaryButton}
              onPress={() => setAlertVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.alertPrimaryButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManagePricing;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 20,
  },
  keyboardContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 24,
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  pageSubtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardHeaderTitles: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.subtext,
    marginTop: 6,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveIcon: {
    marginRight: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 16,
  },

  /* --- IN-APP ALERT POPUP STYLES --- */
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    elevation: 5,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  alertIconContainer: {
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  alertPrimaryButton: {
    backgroundColor: COLORS.secondary,
    width: "100%",
    maxWidth: 140,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  alertPrimaryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 15,
  },
});