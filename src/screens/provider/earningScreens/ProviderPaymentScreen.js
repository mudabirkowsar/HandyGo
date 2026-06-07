// screens/ProviderPaymentScreen.js
import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  ScrollView
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Import your custom user endpoint registry layer
import { initiateSplitPaymentAPI } from "../../../../api/UserAPI";

// Import the Razorpay SDK library safely
import RazorpayCheckout from "react-native-razorpay";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#08B36A",
  primaryLight: "rgba(8, 179, 106, 0.08)",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  textMain: "#111827",
  textMuted: "#6B7280",
  border: "#E2E8F0",
  white: "#FFFFFF",
  warning: "#F59E0B",
  danger: "#EF4444"
};

const ProviderPaymentScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [processing, setProcessing] = useState(false);

  // Custom Toast Notification States
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const handleProcessPaymentGateways = async () => {
    if (processing) return;
    
    try {
      setProcessing(true);
      
      // 1. Initialize split payment configurations from the backend controller
      const response = await initiateSplitPaymentAPI(booking._id);
      
      if (response?.data?.success) {
        const { gatewayOrderId, amount, currency } = response.data;
        
        // 2. Prepare precise validation parameters for the SDK
        const paymentOptions = {
          description: `Payment for booking ref: ${booking._id}`,
          order_id: gatewayOrderId, // The exact ID returned from your server
          currency: currency || "INR",
          amount: amount, // CRITICAL: Use the exact paisa amount from backend. DO NOT multiply by 100 here!
          key: "rzp_test_SymUeMhR07jLOt", // Replace with your actual rzp_test_ public key string directly
          name: "Service Marketplace Platform",
          prefill: {
            email: "user@example.com",
            contact: booking.address?.phone || "9999999999",
            name: "Marketplace Client"
          },
          theme: { color: COLORS.primary }
        };

        console.log("[Razorpay SDK Launching] Options Payload Matrix:", paymentOptions);

        // 3. Launch native module window securely
        RazorpayCheckout.open(paymentOptions)
          .then((data) => {
            // Success Callback Route
            showToast("Payment split completed! Transaction closed successfully.", "success");
            setTimeout(() => {
              setProcessing(false);
              navigation.navigate("MainTabs");
            }, 2000);
          })
          .catch((err) => {
            // Error Callback Route (Triggers on failure or modal dismiss)
            console.warn("Razorpay Native SDK Interaction Error:", err);
            showToast(err.description || "Checkout session dismissed or incomplete.", "error");
            setProcessing(false);
          });

      } else {
        showToast(response?.data?.message || "Failed to establish payment configuration details.", "error");
        setProcessing(false);
      }

    } catch (error) {
      console.error("Payment frontend initialization error stack:", error);
      showToast(error.response?.data?.message || "Transaction handshake aborted. Try again.", "error");
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Dynamic Fading Toast Overlay */}
      <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }, toastType === "error" ? styles.toastError : styles.toastSuccess]}>
        <Ionicons 
          name={toastType === "error" ? "alert-circle" : "shield-checkmark"} 
          size={18} 
          color={toastType === "error" ? COLORS.danger : COLORS.primary} 
        />
        <Text style={[styles.toastText, toastType === "error" ? styles.toastTextError : styles.toastTextSuccess]}>
          {toastMessage}
        </Text>
      </Animated.View>

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backActionButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Final Settlement</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainerBox}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bank-transfer" size={44} color={COLORS.primary} />
          </View>
          <Text style={styles.invoiceHeadlineText}>Automated Split Settlement</Text>
          <Text style={styles.invoiceSubtext}>Funds will be divided: 90% disbursed to provider, 10% retained as platform profit margin revenue.</Text>
        </View>

        {/* Invoice Itemized Cost Card */}
        <Text style={styles.sectionLabel}>Settle Invoice Statement</Text>
        <View style={styles.invoiceCard}>
          <View style={styles.billingItemRow}>
            <Text style={styles.billingLabel}>Gross Order Value</Text>
            <Text style={styles.billingValue}>₹{booking.pricing?.grandTotal?.toLocaleString()}</Text>
          </View>
          <View style={styles.billingItemRow}>
            <Text style={styles.billingLabel}>Marketplace Fee (10% Retained)</Text>
            <Text style={[styles.billingValue, { color: COLORS.warning }]}>
              - ₹{(booking.pricing?.grandTotal * 0.1).toFixed(0)}
            </Text>
          </View>
          <View style={styles.billingItemRow}>
            <Text style={styles.billingLabel}>Provider Payout Volume (90%)</Text>
            <Text style={[styles.billingValue, { color: COLORS.primary }]}>
              ₹{(booking.pricing?.grandTotal * 0.9).toFixed(0)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.billingItemRow}>
            <Text style={styles.totalLabel}>Total Payable Balance</Text>
            <Text style={styles.totalValue}>₹{booking.pricing?.grandTotal?.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.infoBoxCard}>
          <Ionicons name="lock-closed" size={18} color={COLORS.warning} />
          <Text style={styles.infoBoxText}>
            Payments are guarded securely via end-to-end marketplace routing algorithms. Providers receive payouts instantly to their registered account setups.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer Interaction Button */}
      <View style={styles.bottomStickyFooter}>
        <TouchableOpacity 
          style={styles.payButton} 
          activeOpacity={0.85}
          onPress={handleProcessPaymentGateways}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.payButtonText}>Authorize Split Payment • ₹{booking.pricing?.grandTotal?.toLocaleString()}</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} style={{ marginLeft: 6 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 10,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toastSuccess: { backgroundColor: "#ECFDF5", borderColor: "rgba(16, 185, 129, 0.2)" },
  toastError: { backgroundColor: "#FEF2F2", borderColor: "rgba(239, 68, 68, 0.2)" },
  toastText: { fontSize: 13, fontWeight: "700", marginLeft: 8, flex: 1 },
  toastTextSuccess: { color: COLORS.primary },
  toastTextError: { color: COLORS.danger },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingTop: Platform.OS === 'android' ? 10 : 0
  },
  backActionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.secondary },
  scrollBody: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  iconContainerBox: { alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(8, 179, 106, 0.08)",
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  invoiceHeadlineText: { fontSize: 18, fontWeight: '800', color: COLORS.secondary, textAlign: 'center' },
  invoiceSubtext: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, paddingHorizontal: 10, lineHeight: 18, fontWeight: '500' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: COLORS.secondary, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  invoiceCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  billingItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  billingLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  billingValue: { fontSize: 13, color: COLORS.secondary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14, borderStyle: 'dashed' },
  totalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.secondary },
  totalValue: { fontSize: 18, fontWeight: '950', color: COLORS.primary },
  infoBoxCard: { flexDirection: 'row', backgroundColor: COLORS.warningLight, borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.15)", padding: 14, borderRadius: 14, gap: 8 },
  infoBoxText: { flex: 1, fontSize: 12, color: "#B45309", fontWeight: '500', lineHeight: 18 },
  bottomStickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20, borderTopWidth: 1, borderColor: COLORS.border },
  payButton: { backgroundColor: COLORS.primary, borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  payButtonText: { fontSize: 15, fontWeight: '800', color: COLORS.white }
});

export default ProviderPaymentScreen;