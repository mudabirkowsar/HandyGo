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

// Import your live user endpoints
import { initiateSplitPaymentAPI, verifySplitPaymentAPI } from "../../../../api/UserAPI";
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
  const [toastType, setToastType] = useState("success");
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
      
      // 1. Initialize split payment configurations from backend order controller
      const response = await initiateSplitPaymentAPI(booking._id);
      
      if (response?.data?.success) {
        const { gatewayOrderId, amount, currency } = response.data;
        
        // 2. Configure operational options payload parameters
        const paymentOptions = {
          description: `Settle Booking Invoice ref: ${booking._id}`,
          order_id: gatewayOrderId,
          currency: currency || "INR",
          amount: amount,
          key: "rzp_test_SymUeMhR07jLOt", // Insert your real Razorpay key token here
          name: "Service Marketplace Inc",
          prefill: {
            email: "client@marketplace.com",
            contact: booking.address?.phone || "9999999999",
            name: "Marketplace Client User"
          },
          theme: { color: COLORS.primary }
        };

        // 3. Open Native SDK Checkout Sheet Container Window Layer
        RazorpayCheckout.open(paymentOptions)
          .then(async (successPayload) => {
            try {
              // Extract payment parameters from successful gateway capture signature
              const verificationPayload = {
                razorpay_order_id: successPayload.razorpay_order_id,
                razorpay_payment_id: successPayload.razorpay_payment_id,
                razorpay_signature: successPayload.razorpay_signature
              };

              // 4. Send keys straight to server validation endpoint module to finalize status updates
              const verifyResponse = await verifySplitPaymentAPI(booking._id, verificationPayload);

              if (verifyResponse?.data?.success) {
                showToast("Payment split finalized! Booking marked as completed.", "success");
                setTimeout(() => {
                  setProcessing(false);
                  navigation.navigate("MainTabs");
                }, 2000);
              } else {
                showToast("System discrepancy error finalizing database ledger.", "error");
                setProcessing(false);
              }
            } catch (verifyError) {
              console.error("Backend signature handshake failed:", verifyError);
              showToast("Failed to verify checkout token signatures with server.", "error");
              setProcessing(false);
            }
          })
          .catch((err) => {
            console.log("Gateway execution dropped:", err);
            showToast(err.description || "Checkout execution interface closed.", "error");
            setProcessing(false);
          });

      } else {
        showToast(response?.data?.message || "Failed to initialize payment instance framework.", "error");
        setProcessing(false);
      }

    } catch (error) {
      console.error("Payment tracking controller error summary:", error);
      showToast(error.response?.data?.message || "Handshake drops detected. Try again.", "error");
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

      {/* Sticky Bottom Call-To-Action Footer Button */}
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