import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// Importing your specific API function
import { updateProviderDocs } from "../../../../api/ProviderAPI";

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

export default function DocumentsScreen({ navigation }) {
  // --- UI STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // 'aadhaarFrontImage', 'aadhaarBackImage', 'selfieImage'

  // --- FORM DATA ---
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [images, setImages] = useState({
    aadhaarFrontImage: null,
    aadhaarBackImage: null,
    selfieImage: null,
  });

  // --- IMAGE PICKING LOGIC ---
  const handleImageSource = async (sourceType) => {
    try {
      let result = null;

      if (sourceType === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Camera access is required.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Gallery access is required.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
        });
      }

      if (result && !result.canceled) {
        setImages((prev) => ({ ...prev, [activeSlot]: result.assets[0].uri }));
        setShowPicker(false);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick image. Try again.");
    }
  };

  const openPicker = (slot) => {
    setActiveSlot(slot);
    setShowPicker(true);
  };

  // --- API SUBMISSION LOGIC ---
  const handleFinalSubmit = async () => {
    // 1. Validation
    if (!aadhaarNumber || !panNumber || !images.aadhaarFrontImage || !images.aadhaarBackImage || !images.selfieImage) {
      Alert.alert("Incomplete Form", "Please fill in all numbers and upload all 3 photos.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Prepare FormData (Required for Multer)
      const formData = new FormData();
      formData.append("aadhaarNumber", aadhaarNumber);
      formData.append("panNumber", panNumber);

      // Helper to append image files
      const appendFile = (fieldName, uri) => {
        const fileName = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append(fieldName, {
          uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
          name: fileName,
          type: type,
        });
      };

      appendFile("aadhaarFrontImage", images.aadhaarFrontImage);
      appendFile("aadhaarBackImage", images.aadhaarBackImage);
      appendFile("selfieImage", images.selfieImage);

      // 3. Call API
      const response = await updateProviderDocs(formData);

      if (response.data.success) {
        setIsSubmitting(false);
        // Navigate to ShowPopup on Success
        navigation.navigate("ShowPopup");
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error("Upload Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to upload documents. Please try again.";
      Alert.alert("Upload Failed", errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>Submit documents for admin approval</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Aadhaar Number</Text>
            <TextInput
              style={styles.input}
              placeholder="12 Digit Number"
              keyboardType="numeric"
              maxLength={12}
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAN Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
              value={panNumber}
              onChangeText={setPanNumber}
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 15 }]}>Upload Photos</Text>

          <View style={styles.uploadGrid}>
            <UploadTile 
                title="Aadhaar Front" 
                image={images.aadhaarFrontImage} 
                onPress={() => openPicker('aadhaarFrontImage')} 
            />
            <UploadTile 
                title="Aadhaar Back" 
                image={images.aadhaarBackImage} 
                onPress={() => openPicker('aadhaarBackImage')} 
            />
          </View>

          <UploadTile 
            title="Selfie with ID Card" 
            image={images.selfieImage} 
            onPress={() => openPicker('selfieImage')} 
            fullWidth 
          />

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleFinalSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Documents</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Sheet Modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalBar} />
            <Text style={styles.modalTitle}>Choose Source</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.option} onPress={() => handleImageSource('camera')}>
                <View style={[styles.optionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="camera" size={30} color={COLORS.primary} />
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.option} onPress={() => handleImageSource('gallery')}>
                <View style={[styles.optionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="images" size={30} color="#2196F3" />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const UploadTile = ({ title, image, onPress, fullWidth }) => (
  <TouchableOpacity style={[styles.uploadBox, fullWidth && { width: '100%', height: 160 }]} onPress={onPress}>
    {image ? (
      <Image source={{ uri: image }} style={styles.preview} />
    ) : (
      <View style={styles.placeholder}>
        <Ionicons name="add-circle-outline" size={30} color={COLORS.primary} />
        <Text style={styles.placeholderText}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "900", color: COLORS.secondary },
  subtitle: { fontSize: 15, color: COLORS.subtext },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.secondary, marginBottom: 15 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.subtext, marginBottom: 5 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  uploadGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  uploadBox: { width: "48%", height: 120, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed", backgroundColor: COLORS.background, overflow: "hidden" },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 11, fontWeight: "600", color: COLORS.subtext, marginTop: 5 },
  preview: { width: "100%", height: "100%", resizeMode: "cover" },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 15, paddingVertical: 18, alignItems: "center", marginTop: 20 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalBar: { width: 40, height: 5, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  option: { alignItems: "center" },
  optionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  optionText: { fontSize: 14, fontWeight: "600" },
});