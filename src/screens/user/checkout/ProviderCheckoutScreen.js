// screens/ProviderCheckoutScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TextInput,
  Switch,
  Platform,
  Animated
} from 'react-native';

// Import Expo Icons
import { Ionicons } from '@expo/vector-icons';

// Import Native DateTimePicker Components
import DateTimePicker from '@react-native-community/datetimepicker';

// Import Address and Booking APIs from your user profile utility bundle
import { fetchUserAddresses, createBooking } from '../../../../api/UserAPI';

const COLORS = {
  primary: "#08B36A",
  primaryLight: "rgba(8, 179, 106, 0.08)",
  primaryMedium: "rgba(8, 179, 106, 0.15)",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E2E8F0",
  white: "#FFFFFF",
  error: "#EF4444",
  errorLight: "rgba(239, 68, 68, 0.08)",
  warning: "#F59E0B",
  warningLight: "rgba(245, 158, 11, 0.08)"
};

const ProviderCheckoutScreen = ({ route, navigation }) => {
  // Extracting provider nested core payload from route properties safely
  const providerProfile = route?.params?.provider || {};

  // Core Provider Destructuring based on your dynamic schema fields
  const providerId = providerProfile._id;
  const providerName = providerProfile.fullName;
  const serviceCategory = providerProfile.serviceProvided;
  const dailyRate = providerProfile.perDayPrice;
  const hourlyOvertimeRate = providerProfile.overtimeHourlyPrice;
  const availableServicesList = providerProfile.services;

  // State Management Engine
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);

  // Scope sub-service selector tracker
  const [selectedSubService, setSelectedSubService] = useState(availableServicesList[0] || null);

  // Booking Object Configurations (Using Javascript Date Instances)
  const [dateValue, setDateValue] = useState(new Date("2026-06-10"));
  const [timeValue, setTimeValue] = useState(new Date("2026-06-10T10:00:00"));

  // Native Picker Visibility Toggles
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Remaining parameters matching structural variables
  const [durationDays, setDurationDays] = useState("1");
  const [overtimeHours, setOvertimeHours] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [customNotes, setCustomNotes] = useState('');

  // UI Interactive Toggle State for Overtime Component Layer
  const [isOvertimeEnabled, setIsOvertimeEnabled] = useState(false);

  // Custom Auto-hiding Toast Engine States
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [toastOpacity] = useState(new Animated.Value(0));

  // Local Pricing Predictor Engine
  const calculatedBaseDays = Number(durationDays) || 1;
  const calculatedBasePrice = dailyRate * calculatedBaseDays;
  const calculatedOvertimeHours = isOvertimeEnabled ? (Number(overtimeHours) || 0) : 0;
  const calculatedOvertimeTotal = calculatedOvertimeHours * hourlyOvertimeRate;
  const platformFee = 50;
  const grandTotal = calculatedBasePrice + calculatedOvertimeTotal + platformFee;

  useEffect(() => {
    loadUserAddresses();
  }, []);

  // Custom Inline Toast Dispatcher Engine
  const showCustomToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToastVisible(false);
      });
    }, 3500);
  };

  const loadUserAddresses = async () => {
    try {
      setAddressesLoading(true);
      const response = await fetchUserAddresses();

      let fetchedList = [];
      if (response.data && response.data.success) {
        fetchedList = response.data.data;
      } else {
        fetchedList = response.data || [];
      }

      setAddresses(fetchedList);

      if (fetchedList.length > 0) {
        const defaultAddress = fetchedList.find(addr => addr.isDefault) || fetchedList[0];
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Address dependency extraction error:", error);
      showCustomToast("Could not synchronize saved delivery addresses.", "error");
    } finally {
      setAddressesLoading(false);
    }
  };

  // Date Selection Event Handler
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // iOS demands modal persistency
    if (selectedDate) {
      setDateValue(selectedDate);
    }
  };

  // Time Selection Event Handler
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTimeValue(selectedTime);
    }
  };

  // String Formatter Helpers for UI Display Output
  const formatDisplayDate = (date) => {
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDisplayTime = (time) => {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' should become '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const handlePlaceBooking = async () => {
    if (!selectedAddress) {
      showCustomToast("Please select or create an address profile to execute checkout pipeline.", "warning");
      return;
    }

    const configuredNotes = `${selectedSubService ? `[Scope Selected: ${selectedSubService.name}] ` : ''}${customNotes}`.trim();

    // MATCHES EXACTLY WHAT YOUR API CONTROLLER DESTUCTURES
    const checkoutRequestPayload = {
      providerId: providerId,
      addressId: selectedAddress._id,
      bookingDate: formatDisplayDate(dateValue),
      startTime: formatDisplayTime(timeValue),
      durationDays: Number(durationDays) || 1,
      overtimeHours: calculatedOvertimeHours,
      paymentMethod: paymentMethod,
      notes: configuredNotes
    };

    try {
      setCheckoutSubmitting(true);
      const response = await createBooking(checkoutRequestPayload);

      if (response.data && response.data.success) {
        showCustomToast(response.data.message || "Booking processed successfully!", "success");
        setTimeout(() => {
          navigation.popToTop();
        }, 1500);
      } else {
        showCustomToast(response.data.message || "Server declined parameters verification.", "error");
      }
    } catch (error) {
      console.error("Booking transactional dispatch failure exception:", error);
      const serverErrorMessage = error.response?.data?.message || "Internal transaction handling breakdown.";
      showCustomToast(serverErrorMessage, "error");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'COD': return 'cash-outline';
      case 'Razorpay': return 'card-outline';
      case 'Wallet': return 'wallet-outline';
      default: return 'apps-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* DYNAMIC AUTO-FADING TOAST POPUP NOTIFICATION ENGINE */}
      {toastVisible && (
        <Animated.View style={[styles.toastPopupContainer, styles[`toastType_${toastType}`], { opacity: toastOpacity }]}>
          <Ionicons
            name={toastType === 'success' ? 'checkmark-circle' : toastType === 'error' ? 'alert-circle' : 'warning'}
            size={20}
            color={toastType === 'success' ? COLORS.primary : toastType === 'error' ? COLORS.error : COLORS.warning}
            style={{ marginRight: 10 }}
          />
          <Text style={styles.toastPopupText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Review Checkout</Text>
          <Text style={styles.headerSubtitle}>Confirm variables matching system deployment constraints</Text>
        </View>
        <View style={styles.headerIconCircle}>
          <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>

        {/* SECTION 1: SELECTED SERVICE PROVIDER PROFILE OVERVIEW */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assigned Service Professional</Text>
          <View style={styles.providerInfoWrapper}>
            <View style={styles.avatarCirclePlaceholder}>
              <Ionicons name="person-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerNameText}>{providerName}</Text>
              <View style={styles.categoryBadgeContainer}>
                <Ionicons name="construct-outline" size={12} color={COLORS.subtext} style={{ marginRight: 4 }} />
                <Text style={styles.providerProfessionTag}>{serviceCategory}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rateSplitRow}>
            <View style={styles.rateBadge}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.rateBadgeText}>Daily: ₹{dailyRate}</Text>
            </View>
            <View style={styles.rateBadge}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.rateBadgeText}>Overtime/Hr: ₹{hourlyOvertimeRate}</Text>
            </View> 
          </View>
        </View>

        {/* SECTION 3: SYSTEM LOCATIONS TRACKER */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Deployment Target Location</Text>

          {addressesLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
          ) : addresses.length === 0 ? (
            <TouchableOpacity style={styles.warnButton} onPress={() => navigation.navigate('SavedAddressesScreen')} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={18} color={COLORS.error} style={{ marginRight: 6 }} />
              <Text style={styles.warnButtonText}>Create Address Profile</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalAddressTrack}>
              {addresses.map((item) => {
                const isCurrent = selectedAddress?._id === item._id;
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={[styles.miniAddressTab, isCurrent && styles.miniAddressTabActive]}
                    onPress={() => setSelectedAddress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.miniTagHeaderRow}>
                      <Ionicons
                        name={item.addressType === 'Home' ? 'home-outline' : item.addressType === 'Work' ? 'business-outline' : 'location-outline'}
                        size={13}
                        color={isCurrent ? COLORS.primary : COLORS.subtext}
                      />
                      <Text style={[styles.miniTagText, isCurrent && styles.miniTagTextActive]}>{item.addressType}</Text>
                    </View>
                    <Text style={styles.miniRecipient} numberOfLines={1}>{item.fullName}</Text>
                    <Text style={styles.miniDetailText} numberOfLines={1}>{item.flatHouseNo}, {item.streetAddress}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {selectedAddress && (
            <View style={styles.selectedAddrFeedbackBox}>
              <View style={styles.addressInlineDetailRow}>
                <Ionicons name="location" size={16} color={COLORS.primary} style={{ marginTop: 2, marginRight: 8 }} />
                <Text style={styles.finalAddrLabel}>{selectedAddress.flatHouseNo}, {selectedAddress.streetAddress}, {selectedAddress.city} - {selectedAddress.pincode}</Text>
              </View>
              <View style={styles.addressInlineSeparatorLine}>
                <Ionicons name="call-outline" size={14} color={COLORS.subtext} style={{ marginRight: 8 }} />
                <Text style={styles.finalAddrLabelSecondary}>Contact verification string: {selectedAddress.phone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* SECTION 4: TIME PARAMETERS AND DURATION CONTROL INPUTS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Schedule Engine Settings</Text>

          {/* NATIVE CALENDAR PICKER TRIGGER PANEL */}
          <Text style={styles.fieldLabel}>Execution Date</Text>
          <TouchableOpacity style={styles.pickerInteractiveContainer} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <View style={styles.pickerInlineContent}>
              <Ionicons name="calendar" size={18} color={COLORS.primary} style={styles.inputOrnamentIcon} />
              <Text style={styles.pickerOutputText}>{formatDisplayDate(dateValue)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
          </TouchableOpacity>

          {/* NATIVE CLOCK TIMEPICKER PICKER TRIGGER PANEL */}
          <Text style={styles.fieldLabel}>Preferred Start Time Slot</Text>
          <TouchableOpacity style={styles.pickerInteractiveContainer} onPress={() => setShowTimePicker(true)} activeOpacity={0.7}>
            <View style={styles.pickerInlineContent}>
              <Ionicons name="time" size={18} color={COLORS.primary} style={styles.inputOrnamentIcon} />
              <Text style={styles.pickerOutputText}>{formatDisplayTime(timeValue)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
          </TouchableOpacity>

          {/* RENDER DYNAMIC PLATFORM PICKER DIRECTIVES */}
          {showDatePicker && (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={timeValue}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <View style={styles.rowFormSplit}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Deployment (Days)</Text>
              <View style={styles.inputIconDecorationWrapper}>
                <Ionicons name="hourglass-outline" size={18} color={COLORS.subtext} style={styles.inputOrnamentIcon} />
                <TextInput style={styles.inputWithIconStyle} value={durationDays} onChangeText={setDurationDays} keyboardType="numeric" placeholder="1" placeholderTextColor="#94A3B8" />
              </View>
            </View>
          </View>

          {/* DYNAMIC OPT-IN INTERACTIVE OVERTIME PANEL SWITCH */}
          <View style={styles.overtimeToggleCardRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.overtimeToggleMainLabel}>Include Overtime Blocks?</Text>
              <Text style={styles.overtimeToggleSubLabel}>Extends provider operational shift hourly</Text>
            </View>
            <Switch
              value={isOvertimeEnabled}
              onValueChange={(val) => {
                setIsOvertimeEnabled(val);
                if (!val) setOvertimeHours("0");
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={Platform.OS === 'ios' ? COLORS.white : isOvertimeEnabled ? COLORS.primary : '#F4F3F4'}
            />
          </View>

          {isOvertimeEnabled && (
            <View style={styles.overtimeExpandedInnerSubcard}>
              <Text style={[styles.fieldLabel, { marginTop: 2, color: COLORS.primary }]}>Overtime Target Limit (Hours)</Text>
              <View style={[styles.inputIconDecorationWrapper, { borderColor: COLORS.primary }]}>
                <Ionicons name="stopwatch-outline" size={18} color={COLORS.primary} style={styles.inputOrnamentIcon} />
                <TextInput
                  style={[styles.inputWithIconStyle, { fontWeight: '700', color: COLORS.primary }]}
                  value={overtimeHours}
                  onChangeText={setOvertimeHours}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.primary}
                />
              </View>
            </View>
          )}
        </View>

        {/* SECTION 5: METHOD CHANNELS GRID SELECTOR */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Gateway Payment Method</Text>
          <View style={styles.paymentMethodFlexGrid}>
            {["COD", "Razorpay", "Wallet", "Card"].map((method) => {
              const isSelected = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[styles.payOptionButton, isSelected && styles.payOptionButtonActive]}
                  onPress={() => setPaymentMethod(method)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={getPaymentIcon(method)}
                    size={18}
                    color={isSelected ? COLORS.primary : COLORS.subtext}
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={[styles.payOptionText, isSelected && styles.payOptionTextActive]}>{method}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION 6: ADDITIONAL CUSTOM NOTES INPUT FIELD */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Custom Order Notes</Text>
          <View style={styles.customTextAreaWrapperStyle}>
            <TextInput
              style={styles.textArea}
              value={customNotes}
              onChangeText={setCustomNotes}
              placeholder="Type any additional instructions left for the deployment provider here..."
              placeholderTextColor="#94A3B8"
              multiline={true}
              numberOfLines={3}
              maxLength={500}
            />
          </View>
        </View>

        {/* SECTION 7: BILL DETAILS TRANSACTION MATRIX SUMMARY */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Strict Pricing Matrix Summary</Text>

          <View style={styles.priceBillRow}>
            <Text style={styles.billLabel}>Base Rate Charge (₹{dailyRate} × {calculatedBaseDays} days)</Text>
            <Text style={styles.billValue}>₹{calculatedBasePrice}</Text>
          </View>

          <View style={styles.priceBillRow}>
            <Text style={styles.billLabel}>Overtime Accumulation (₹{hourlyOvertimeRate}/hr × {calculatedOvertimeHours} hrs)</Text>
            <Text style={styles.billValue}>₹{calculatedOvertimeTotal}</Text>
          </View>

          <View style={styles.priceBillRow}>
            <Text style={styles.billLabel}>Platform Service Convenience Fee</Text>
            <Text style={styles.billValue}>₹{platformFee}</Text>
          </View>

          <View style={[styles.priceBillRow, styles.grandTotalRowBorder]}>
            <Text style={styles.grandBillTitle}>Grand Total Amount Owed</Text>
            <Text style={styles.grandBillValue}>₹{grandTotal}</Text>
          </View>
        </View>

      </ScrollView>

      {/* FOOTER ACTION STICKY BAR */}
      <View style={styles.footerStickyActionContainer}>
        <View style={styles.footerPriceMetaGroup}>
          <Text style={styles.footerMetaLabel}>Grand Payable Total:</Text>
          <Text style={styles.footerMetaPriceValue}>₹{grandTotal}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutSubmitCTA}
          onPress={handlePlaceBooking}
          disabled={checkoutSubmitting}
          activeOpacity={0.8}
        >
          {checkoutSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.ctaButtonLabelString}>Place Booking Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 20, },
  header: { paddingHorizontal: 20, paddingVertical: 18, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  headerIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 16, paddingBottom: 115 },
  sectionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.secondary, textTransform: 'uppercase', marginBottom: 14, letterSpacing: 0.6 },
  providerInfoWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCirclePlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  providerNameText: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  categoryBadgeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  providerProfessionTag: { fontSize: 13, color: COLORS.subtext, fontWeight: '600' },
  rateSplitRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 },
  rateBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  rateBadgeText: { color: COLORS.secondary, fontSize: 13, fontWeight: '600' },
  subServicesContainer: { marginTop: 2 },
  srvOption: { padding: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: 10, backgroundColor: COLORS.background },
  srvOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderWidth: 1.5 },
  srvHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  srvName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  srvNameActive: { color: COLORS.primary },
  customRadioContainer: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.subtext, justifyContent: 'center', alignItems: 'center' },
  customRadioContainerActive: { borderColor: COLORS.primary },
  customRadioInnerCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  srvDesc: { fontSize: 13, color: COLORS.subtext, marginVertical: 6, lineHeight: 18 },
  srvMetaTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: 'rgba(15, 23, 42, 0.05)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  srvDuration: { fontSize: 11, fontWeight: '600', color: COLORS.secondary },
  horizontalAddressTrack: { flexDirection: 'row', marginVertical: 2 },
  miniAddressTab: { width: 165, padding: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginRight: 10, backgroundColor: COLORS.background },
  miniAddressTabActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderWidth: 1.5 },
  miniTagHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  miniTagText: { fontSize: 11, fontWeight: '700', color: COLORS.subtext, textTransform: 'uppercase', marginLeft: 4 },
  miniTagTextActive: { color: COLORS.primary },
  miniRecipient: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  miniDetailText: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  selectedAddrFeedbackBox: { marginTop: 14, backgroundColor: COLORS.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  addressInlineDetailRow: { flexDirection: 'row', alignItems: 'flex-start' },
  finalAddrLabel: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18, fontWeight: '500' },
  addressInlineSeparatorLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 6 },
  finalAddrLabelSecondary: { flex: 1, fontSize: 12, color: COLORS.subtext, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginTop: 12, marginBottom: 6 },

  // Custom Form Pickers Dynamic Wrapper Elements
  pickerInteractiveContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  pickerInlineContent: { flexDirection: 'row', alignItems: 'center' },
  pickerOutputText: { fontSize: 14, fontWeight: '600', color: COLORS.text },

  inputIconDecorationWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12 },
  inputOrnamentIcon: { marginRight: 10 },
  inputWithIconStyle: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  rowFormSplit: { flexDirection: 'row', justifyContent: 'space-between' },
  overtimeToggleCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  overtimeToggleMainLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  overtimeToggleSubLabel: { fontSize: 12, color: COLORS.subtext, marginTop: 1 },
  overtimeExpandedInnerSubcard: { marginTop: 12, backgroundColor: COLORS.primaryLight, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primaryMedium },
  customTextAreaWrapperStyle: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  textArea: { height: 75, textAlignVertical: 'top', fontSize: 14, color: COLORS.text, paddingTop: 8 },
  paymentMethodFlexGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 2 },
  payOptionButton: { width: '48%', paddingVertical: 14, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  payOptionButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderWidth: 1.5 },
  payOptionText: { fontSize: 13, fontWeight: '600', color: COLORS.subtext },
  payOptionTextActive: { color: COLORS.primary, fontWeight: '700' },
  priceBillRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  billLabel: { fontSize: 14, color: COLORS.subtext, fontWeight: '400' },
  billValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  grandTotalRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 12, paddingTop: 12 },
  grandBillTitle: { fontSize: 15, fontWeight: '700', color: COLORS.secondary },
  grandBillValue: { fontSize: 19, fontWeight: '800', color: COLORS.primary },
  footerStickyActionContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 10 },
  footerPriceMetaGroup: { flexDirection: 'column' },
  footerMetaLabel: { fontSize: 12, color: COLORS.subtext, fontWeight: '500' },
  footerMetaPriceValue: { fontSize: 22, fontWeight: '800', color: COLORS.secondary, letterSpacing: -0.5 },
  checkoutSubmitCTA: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 20, flex: 1, marginLeft: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  ctaButtonLabelString: { color: COLORS.white, fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  warnButton: { backgroundColor: COLORS.errorLight, padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.error, width: '100%' },
  warnButtonText: { color: COLORS.error, fontWeight: '700', fontSize: 14 },

  // Custom Fading Notification Toast Popup Styles
  toastPopupContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 30, left: 20, right: 20, zIndex: 9999, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  toastType_success: { backgroundColor: '#ECFDF5', borderColor: 'rgba(16, 185, 129, 0.2)' },
  toastType_error: { backgroundColor: '#FEF2F2', borderColor: 'rgba(239, 68, 68, 0.2)' },
  toastType_warning: { backgroundColor: '#FFFBEB', borderColor: 'rgba(245, 158, 11, 0.2)' },
  toastPopupText: { color: COLORS.secondary, fontSize: 14, fontWeight: '600', flex: 1 }
});

export default ProviderCheckoutScreen;