// screens/SavedAddressesScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';

// Import Expo Icons
import { Ionicons } from '@expo/vector-icons';

// Import your Address APIs
import { 
  fetchUserAddresses, 
  addUserAddress,
  updateUserAddress,
  deleteUserAddress 
} from '../../../../api/UserAPI';

const COLORS = {
  primary: "#08B36A",
  primaryLight: "rgba(8, 179, 106, 0.1)",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E2E8F0",
  white: "#FFFFFF",
  error: "#EF4444",
  errorLight: "rgba(239, 68, 68, 0.1)",
  warning: "#F59E0B",
  warningLight: "rgba(245, 158, 11, 0.08)"
};

const SavedAddressesScreen = () => {
  // Address List States
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null = Add, string ID = Edit
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Form Field States
  const [addressType, setAddressType] = useState('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatHouseNo, setFlatHouseNo] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Custom Inline Alert States
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error' | 'warning'
  const [toastOpacity] = useState(new Animated.Value(0));

  // Custom Delete Confirmation Sheet State
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [addressIdToDelete, setAddressIdToDelete] = useState(null);

  // Fetch addresses on component mount
  useEffect(() => {
    loadAddresses();
  }, []);

  // Toast animation controller
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Automatically hide toast after 3.5 seconds
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

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetchUserAddresses();
      if (response.data && response.data.success) {
        setAddresses(response.data.data);
      } else {
        setAddresses(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showToast("Failed to load saved addresses.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open Form Modal (Clean for Adding or Populated for Editing)
  const openAddressForm = (addressToEdit = null) => {
    if (addressToEdit) {
      setEditingAddressId(addressToEdit._id);
      setAddressType(addressToEdit.addressType || 'Home');
      setFullName(addressToEdit.fullName || '');
      setPhone(addressToEdit.phone || '');
      setFlatHouseNo(addressToEdit.flatHouseNo || '');
      setStreetAddress(addressToEdit.streetAddress || '');
      setLandmark(addressToEdit.landmark || '');
      setCity(addressToEdit.city || '');
      setState(addressToEdit.state || '');
      setPincode(addressToEdit.pincode || '');
      setDeliveryInstructions(addressToEdit.deliveryInstructions || '');
      setIsDefault(addressToEdit.isDefault || false);
    } else {
      setEditingAddressId(null);
      setAddressType('Home');
      setFullName('');
      setPhone('');
      setFlatHouseNo('');
      setStreetAddress('');
      setLandmark('');
      setCity('');
      setState('');
      setPincode('');
      setDeliveryInstructions('');
      // If it's their first address, default it to true
      setIsDefault(addresses.length === 0);
    }
    setIsModalOpen(true);
  };

  // Handle Form Submission (Both Add and Update Operations)
  const handleSubmitForm = async () => {
    if (!fullName || !phone || !flatHouseNo || !streetAddress || !city || !state || !pincode) {
      showToast("Please complete all mandatory fields (*).", "warning");
      return;
    }

    const payload = {
      addressType,
      fullName,
      phone,
      flatHouseNo,
      streetAddress,
      landmark,
      city,
      state,
      pincode,
      deliveryInstructions,
      isDefault
    };

    try {
      setFormSubmitLoading(true);

      if (editingAddressId) {
        // API CALL: UPDATE ADDRESS
        await updateUserAddress(editingAddressId, payload);
        showToast("Address updated successfully.", "success");
      } else {
        // API CALL: ADD ADDRESS
        await addUserAddress(payload);
        showToast("Address saved successfully.", "success");
      }

      setIsModalOpen(false);
      loadAddresses(); // Refresh screen state
    } catch (error) {
      console.error("Form error:", error);
      showToast("Could not save address. Please check your inputs.", "error");
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // API CALL: TOGGLE QUICK DEFAULT FROM CARD
  const handleSetDefault = async (addressId) => {
    try {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr._id === addressId })));
      await updateUserAddress(addressId, { isDefault: true });
      showToast("Default address updated.", "success");
      loadAddresses();
    } catch (error) {
      console.error("Default switch error:", error);
      loadAddresses();
    }
  };

  // TRIGGER POPUP CONFIRMATION SHEET instead of native alert
  const promptDeleteConfirmation = (addressId) => {
    setAddressIdToDelete(addressId);
    setDeleteConfirmVisible(true);
  };

  // ACTUAL API CALL FOR DELETION
  const executeDeleteAddress = async () => {
    setDeleteConfirmVisible(false);
    if (!addressIdToDelete) return;

    try {
      await deleteUserAddress(addressIdToDelete);
      setAddresses(prev => prev.filter(addr => addr._id !== addressIdToDelete));
      showToast("Address deleted successfully.", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Could not complete deletion request.", "error");
    } finally {
      setAddressIdToDelete(null);
    }
  };

  // Helper for choosing dynamic header address tags
  const getAddressIcon = (type) => {
    switch (type) {
      case 'Home': return 'home-outline';
      case 'Work': return 'business-outline';
      default: return 'location-outline';
    }
  };

  const renderAddressItem = ({ item }) => (
    <View style={[styles.card, item.isDefault && styles.defaultCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.tagContainer}>
          <View style={styles.addressTypeTag}>
            <Ionicons name={getAddressIcon(item.addressType)} size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
            <Text style={styles.addressTypeTagText}>{item.addressType}</Text>
          </View>
          {item.isDefault && (
            <View style={styles.defaultTag}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} style={{ marginRight: 2 }} />
              <Text style={styles.defaultTagText}>DEFAULT</Text>
            </View>
          )}
        </View>
        {!item.isDefault && (
          <TouchableOpacity style={styles.setDefaultButton} onPress={() => handleSetDefault(item._id)}>
            <Ionicons name="star-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.setDefaultText}>Set Default</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.recipientName}>{item.fullName}</Text>
      
      <View style={styles.addressBody}>
        <Ionicons name="map-outline" size={16} color={COLORS.subtext} style={styles.bodyIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.addressDetails}>{item.flatHouseNo}, {item.streetAddress}</Text>
          {item.landmark ? (
            <Text style={styles.landmarkText}>
              <Text style={{ fontWeight: '500', color: COLORS.text }}>Landmark: </Text>{item.landmark}
            </Text>
          ) : null}
          <Text style={styles.addressDetails}>{item.city}, {item.state} - {item.pincode}</Text>
        </View>
      </View>
      
      <View style={styles.contactRow}>
        <Ionicons name="call-outline" size={15} color={COLORS.subtext} style={{ marginRight: 6 }} />
        <Text style={styles.phoneText}>{item.phone}</Text>
      </View>

      {item.deliveryInstructions ? (
        <View style={styles.instructionTextContainer}>
          <Ionicons name="document-text-outline" size={15} color={COLORS.warning} style={{ marginRight: 6, marginTop: 1 }} />
          <Text style={styles.instructionText}>{item.deliveryInstructions}</Text>
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => openAddressForm(item)}>
          <Ionicons name="pencil-outline" size={14} color={COLORS.secondary} style={{ marginRight: 4 }} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => promptDeleteConfirmation(item._id)}>
          <Ionicons name="trash-outline" size={14} color={COLORS.error} style={{ marginRight: 4 }} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* GLOBAL TOAST POPUP NOTIFICATION */}
      {toastVisible && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            styles[`toastType_${toastType}`],
            { opacity: toastOpacity }
          ]}
        >
          <Ionicons 
            name={toastType === 'success' ? 'checkmark-circle' : toastType === 'error' ? 'alert-circle' : 'warning'} 
            size={20} 
            color={toastType === 'success' ? COLORS.primary : toastType === 'error' ? COLORS.error : COLORS.warning} 
            style={{ marginRight: 10 }}
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Addresses</Text>
          <Text style={styles.headerSubtitle}>Manage your professional delivery details</Text>
        </View>
        <View style={styles.headerIconContainer}>
          <Ionicons name="location" size={24} color={COLORS.primary} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="map-outline" size={48} color={COLORS.subtext} />
          </View>
          <Text style={styles.emptyText}>No saved addresses found</Text>
          <Text style={styles.emptySubtext}>Add an address to ensure seamless checkout options.</Text>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          renderItem={renderAddressItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton} onPress={() => openAddressForm(null)}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* ALL-IN-ONE ADMISSIONS & EDITS MODAL FORM */}
      <Modal visible={isModalOpen} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={20} color={COLORS.error} />
                <Text style={styles.closeModalText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              {/* Type Selectors */}
              <Text style={styles.label}>Address Tag *</Text>
              <View style={styles.typeSelectorRow}>
                {['Home', 'Work', 'Other'].map((type) => (
                  <TouchableOpacity 
                    key={type} 
                    style={[styles.typeOption, addressType === type && styles.typeOptionSelected]}
                    onPress={() => setAddressType(type)}
                  >
                    <Ionicons 
                      name={getAddressIcon(type)} 
                      size={16} 
                      color={addressType === type ? COLORS.primary : COLORS.subtext} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={[styles.typeOptionText, addressType === type && styles.typeOptionTextSelected]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Recipient Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={16} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="e.g. John Doe" placeholderTextColor="#94A3B8" />
              </View>

              <Text style={styles.label}>Delivery Contact Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={16} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="e.g. +1234567890" placeholderTextColor="#94A3B8" />
              </View>

              <Text style={styles.label}>Flat / House No. / Building / Company *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={16} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput style={styles.input} value={flatHouseNo} onChangeText={setFlatHouseNo} placeholder="e.g. Apt 4B, Green Towers" placeholderTextColor="#94A3B8" />
              </View>

              <Text style={styles.label}>Street Address / Area / Colony *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="navigate-outline" size={16} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput style={styles.input} value={streetAddress} onChangeText={setStreetAddress} placeholder="e.g. Wall Street, Sector 12" placeholderTextColor="#94A3B8" />
              </View>

              <Text style={styles.label}>Nearby Landmark (Optional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="flag-outline" size={16} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput style={styles.input} value={landmark} onChangeText={setLandmark} placeholder="e.g. Opposite Metro Station" placeholderTextColor="#94A3B8" />
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>City *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.inputNoIcon} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#94A3B8" />
                  </View>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>State *</Text>
                  <View style={styles.inputContainer}>
                    <TextInput style={styles.inputNoIcon} value={state} onChangeText={setState} placeholder="State" placeholderTextColor="#94A3B8" />
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Pincode / Zipcode *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pin-outline" size={16} color={COLORS.subtext} style={styles.inputIcon} />
                <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="number-pad" placeholder="e.g. 110001" placeholderTextColor="#94A3B8" />
              </View>

              <Text style={styles.label}>Special Delivery Instructions (Optional)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput 
                  style={[styles.inputNoIcon, styles.textArea]} 
                  value={deliveryInstructions} 
                  onChangeText={setDeliveryInstructions} 
                  placeholder="e.g. Leave with guard, Ring bell twice"
                  placeholderTextColor="#94A3B8"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              {/* Set Default Switch Simulation */}
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDefault(!isDefault)} activeOpacity={0.7}>
                <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                  {isDefault && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Make this my default delivery address</Text>
              </TouchableOpacity>

              {/* Action Sheet Button */}
              <TouchableOpacity style={styles.saveFormButton} onPress={handleSubmitForm} disabled={formSubmitLoading} activeOpacity={0.8}>
                {formSubmitLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.saveFormButtonText}>{editingAddressId ? 'Update Address' : 'Save Address'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CUSTOM POPUP COMPONENT: DELETE CONFIRMATION DIALOG MODAL */}
      <Modal visible={deleteConfirmVisible} animationType="fade" transparent={true}>
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <View style={styles.dialogIconContainer}>
              <Ionicons name="trash" size={28} color={COLORS.error} />
            </View>
            <Text style={styles.dialogTitle}>Delete Address</Text>
            <Text style={styles.dialogSubtitle}>Are you sure you want to remove this delivery address from your profile? This action cannot be undone.</Text>
            
            <View style={styles.dialogActionRow}>
              <TouchableOpacity style={styles.dialogCancelButton} onPress={() => { setDeleteConfirmVisible(false); setAddressIdToDelete(null); }}>
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dialogConfirmButton} onPress={executeDeleteAddress}>
                <Text style={styles.dialogConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 20 },
  header: { paddingHorizontal: 20, paddingVertical: 18, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  headerIconContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16, opacity: 0.6 },
  listContainer: { padding: 16, paddingBottom: 110 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  defaultCard: { borderColor: COLORS.primary, borderWidth: 2, shadowOpacity: 0.08 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tagContainer: { flexDirection: 'row', alignItems: 'center' },
  addressTypeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  addressTypeTagText: { color: COLORS.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  defaultTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, marginLeft: 8 },
  defaultTagText: { color: COLORS.primary, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  setDefaultButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: COLORS.primaryLight },
  setDefaultText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  recipientName: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  addressBody: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  bodyIcon: { marginRight: 8, marginTop: 2 },
  addressDetails: { fontSize: 14, color: COLORS.subtext, lineHeight: 22, fontWeight: '400' },
  landmarkText: { fontSize: 14, color: COLORS.subtext, fontStyle: 'italic', lineHeight: 22, marginVertical: 1 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingLeft: 24 },
  phoneText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  instructionTextContainer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.warningLight, padding: 10, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.15)', marginLeft: 24 },
  instructionText: { flex: 1, fontSize: 13, color: '#B45309', lineHeight: 18, fontWeight: '500' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 16, paddingTop: 12 },
  editButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, marginRight: 12, backgroundColor: COLORS.white },
  editButtonText: { color: COLORS.secondary, fontSize: 13, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.errorLight },
  deleteButtonText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: COLORS.subtext, textAlign: 'center', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, borderTopWidth: 1, borderTopColor: COLORS.border, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 10 },
  addButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  addButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  
  // Custom Dynamic Toast Notification Popup Engine Elements
  toastContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 20, right: 20, zIndex: 9999, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  toastType_success: { backgroundColor: '#ECFDF5', borderColor: 'rgba(16, 185, 129, 0.2)' },
  toastType_error: { backgroundColor: '#FEF2F2', borderColor: 'rgba(239, 68, 68, 0.2)' },
  toastType_warning: { backgroundColor: '#FFFBEB', borderColor: 'rgba(245, 158, 11, 0.2)' },
  toastText: { color: COLORS.secondary, fontSize: 14, fontWeight: '600', flex: 1 },

  // Custom Delete Confirmation Sheet Elements
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialogCard: { backgroundColor: COLORS.white, width: '100%', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 10 },
  dialogIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.errorLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, marginBottom: 8 },
  dialogSubtitle: { fontSize: 14, color: COLORS.subtext, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  dialogActionRow: { flexDirection: 'row', width: '100%' },
  dialogCancelButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginRight: 12 },
  dialogCancelText: { color: COLORS.subtext, fontSize: 14, fontWeight: '600' },
  dialogConfirmButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.error, alignItems: 'center' },
  dialogConfirmText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

  // Modal Sheet Engine Elements
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '88%', paddingBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 19, fontWeight: '700', color: COLORS.secondary, letterSpacing: -0.3 },
  closeModalButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  closeModalText: { color: COLORS.error, fontSize: 13, fontWeight: '700', marginLeft: 2 },
  formContainer: { padding: 24 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.secondary, marginBottom: 6, marginTop: 14 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.text },
  inputNoIcon: { flex: 1, paddingVertical: 12, paddingHorizontal: 4, fontSize: 14, color: COLORS.text },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
  textAreaContainer: { alignItems: 'flex-start' },
  textArea: { height: 75, textAlignVertical: 'top', paddingTop: 10 },
  typeSelectorRow: { flexDirection: 'row', marginVertical: 6 },
  typeOption: { flex: 1, flexDirection: 'row', paddingVertical: 11, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.background },
  typeOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight, borderWidth: 1.5 },
  typeOptionText: { fontSize: 14, fontWeight: '600', color: COLORS.subtext },
  typeOptionTextSelected: { color: COLORS.primary, fontWeight: '700' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.subtext, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  saveFormButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 28, marginBottom: 40, flexDirection: 'row', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveFormButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 }
});

export default SavedAddressesScreen;