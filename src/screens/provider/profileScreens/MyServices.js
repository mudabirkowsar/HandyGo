import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    fetchProviderServices,
    addProviderService,
    updateProviderService,
    deleteProviderService,
} from "../../../../api/ProviderAPI";

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
    info: "#3B82F6",
};

const MyServices = () => {
    // State variables
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null); // null = Add, truthy ID = Edit

    // Form States
    const [formName, setFormName] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formDuration, setFormDuration] = useState(""); // Maps to durationInMins

    // Custom Alert Popup States
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: "success", // 'success' | 'error' | 'confirm'
        title: "",
        message: "",
        onConfirm: null,
    });

    // Fetch itemized services on component mount
    useEffect(() => {
        loadServices();
    }, []);

    // Helper to trigger custom popups
    const showAlert = (type, title, message, onConfirm = null) => {
        setAlertConfig({ type, title, message, onConfirm });
        setAlertVisible(true);
    };

    const loadServices = async () => {
        setLoading(true);
        try {
            const response = await fetchProviderServices();
            if (response?.data?.success) {
                setServices(response.data.data.services || []);
            }
        } catch (error) {
            showAlert("error", "Error", error?.response?.data?.message || "Failed to load services.");
        } finally {
            setLoading(false);
        }
    };

    // Open Modal for creation or updating
    const openServiceModal = (service = null) => {
        if (service) {
            setEditingServiceId(service._id);
            setFormName(service.name);
            setFormPrice(String(service.price));
            setFormDescription(service.description || "");
            setFormDuration(service.durationInMins ? String(service.durationInMins) : "");
        } else {
            setEditingServiceId(null);
            setFormName("");
            setFormPrice("");
            setFormDescription("");
            setFormDuration("");
        }
        setIsModalOpen(true);
    };

    // Form Submission handler
    const handleSubmitService = async () => {
        if (!formName.trim() || !formPrice.trim()) {
            showAlert("error", "Validation Error", "Name and Price are required.");
            return;
        }

        const payload = {
            name: formName.trim(),
            price: Number(formPrice),
            description: formDescription.trim(),
            durationInMins: formDuration.trim() ? Number(formDuration) : undefined,
        };

        try {
            let response;
            if (editingServiceId) {
                response = await updateProviderService(editingServiceId, payload);
            } else {
                response = await addProviderService(payload);
            }

            if (response?.data?.success) {
                setServices(response.data.data);
                setIsModalOpen(false);
                setTimeout(() => {
                    showAlert("success", "Success", `Service ${editingServiceId ? "updated" : "added"} successfully.`);
                }, 400); // Small timeout so modals don't clash on iOS
            }
        } catch (error) {
            showAlert("error", "Error", error?.response?.data?.message || "Operation failed.");
        }
    };

    // Handle item deletion
    const handleDeleteService = (serviceId) => {
        showAlert(
            "confirm",
            "Confirm Deletion",
            "Are you sure you want to delete this specific service item?",
            async () => {
                try {
                    const response = await deleteProviderService(serviceId);
                    if (response?.data?.success) {
                        setServices(response.data.data);
                    }
                } catch (error) {
                    showAlert("error", "Error", error?.response?.data?.message || "Failed to delete.");
                }
            }
        );
    };

    const renderHeader = () => (
        <View style={styles.servicesHeaderRow}>
            <View style={styles.titleContainer}>
                <Text style={styles.pageTitle}>My Services</Text>
                <Text style={styles.pageSubtitle}>
                    Add and manage individual custom options with specific pricing and durations
                </Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => openServiceModal(null)}
                activeOpacity={0.8}
            >
                <Ionicons name="add-circle-outline" size={18} color={COLORS.white} style={styles.addIcon} />
                <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <FlatList
                data={services}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.subtext} />
                        <Text style={styles.emptyText}>No itemized services added yet.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.serviceItemCard}>
                        <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{item.name}</Text>
                            {item.description ? (
                                <Text style={styles.serviceDesc} numberOfLines={2}>
                                    {item.description}
                                </Text>
                            ) : null}

                            <View style={styles.metaRow}>
                                <Text style={styles.servicePrice}>₹{item.price}</Text>
                                {item.durationInMins ? (
                                    <View style={styles.durationTag}>
                                        <Ionicons name="time-outline" size={14} color={COLORS.subtext} style={styles.metaIcon} />
                                        <Text style={styles.durationText}>{item.durationInMins} mins</Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                        <View style={styles.actionButtonsColumn}>
                            <TouchableOpacity
                                style={styles.editBtn}
                                onPress={() => openServiceModal(item)}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="pencil-sharp" size={16} color={COLORS.primary} />
                                <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDeleteService(item._id)}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                                <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Add / Edit Sub-Service Modal */}
            <Modal visible={isModalOpen} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingServiceId ? "Edit Service Details" : "Create Custom Offering"}
                            </Text>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} activeOpacity={0.7}>
                                <Ionicons name="close" size={24} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Service Offering Name*</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Hand Mehndi, Bridals, Foot Patterns"
                                placeholderTextColor={COLORS.subtext}
                                value={formName}
                                onChangeText={setFormName}
                            />

                            <View style={styles.inlineInputsRow}>
                                <View style={styles.halfInputGroup}>
                                    <Text style={styles.label}>Price (₹)*</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 1500"
                                        placeholderTextColor={COLORS.subtext}
                                        keyboardType="numeric"
                                        value={formPrice}
                                        onChangeText={setFormPrice}
                                    />
                                </View>

                                <View style={styles.halfInputGroup}>
                                    <Text style={styles.label}>Duration (mins)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 90"
                                        placeholderTextColor={COLORS.subtext}
                                        keyboardType="numeric"
                                        value={formDuration}
                                        onChangeText={setFormDuration}
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Description / Details</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Provide helpful package details or variant specs..."
                                placeholderTextColor={COLORS.subtext}
                                multiline
                                numberOfLines={3}
                                value={formDescription}
                                onChangeText={setFormDescription}
                            />

                            <View style={styles.modalActionsRow}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.cancelModalBtn]}
                                    onPress={() => setIsModalOpen(false)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelModalBtnText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.submitModalBtn]}
                                    onPress={handleSubmitService}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.submitModalBtnText}>Save Service</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- BRAND NEW REUSABLE CUSTOM POPUP MODAL --- */}
            <Modal visible={alertVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <View style={styles.alertIconContainer}>
                            {alertConfig.type === "success" && (
                                <Ionicons name="checkmark-circle" size={54} color={COLORS.primary} />
                            )}
                            {alertConfig.type === "error" && (
                                <Ionicons name="alert-circle" size={54} color={COLORS.danger} />
                            )}
                            {alertConfig.type === "confirm" && (
                                <Ionicons name="help-circle" size={54} color={COLORS.warning} />
                            )}
                        </View>

                        <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                        <Text style={styles.alertMessage}>{alertConfig.message}</Text>

                        <View style={styles.alertButtonRow}>
                            {alertConfig.type === "confirm" ? (
                                <>
                                    <TouchableOpacity
                                        style={[styles.alertButton, styles.alertCancelButton]}
                                        onPress={() => setAlertVisible(false)}
                                    >
                                        <Text style={styles.alertCancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.alertButton, styles.alertConfirmButton]}
                                        onPress={() => {
                                            setAlertVisible(false);
                                            if (alertConfig.onConfirm) alertConfig.onConfirm();
                                        }}
                                    >
                                        <Text style={styles.alertConfirmButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.alertButton, styles.alertPrimaryButton]}
                                    onPress={() => setAlertVisible(false)}
                                >
                                    <Text style={styles.alertPrimaryButtonText}>OK</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default MyServices;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    servicesHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
        marginTop: 8,
    },
    titleContainer: {
        flex: 1,
        paddingRight: 12,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    pageSubtitle: {
        fontSize: 13,
        color: COLORS.subtext,
        marginTop: 4,
        lineHeight: 18,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    addIcon: {
        marginRight: 4,
    },
    addButtonText: {
        color: COLORS.white,
        fontWeight: "600",
        fontSize: 14,
    },
    serviceItemCard: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        flexDirection: "row",
        marginBottom: 12,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 3,
        elevation: 1,
    },
    serviceInfo: {
        flex: 1,
        justifyContent: "center",
        paddingRight: 8,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.text,
    },
    serviceDesc: {
        fontSize: 13,
        color: COLORS.subtext,
        marginTop: 4,
        lineHeight: 17,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    servicePrice: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.primary,
    },
    durationTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginLeft: 12,
    },
    metaIcon: {
        marginRight: 4,
    },
    durationText: {
        fontSize: 12,
        fontWeight: "500",
        color: COLORS.subtext,
    },
    actionButtonsColumn: {
        justifyContent: "space-between",
        alignItems: "flex-end",
        width: 75,
    },
    editBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    editBtnText: {
        color: COLORS.primary,
        fontWeight: "600",
        fontSize: 13,
        marginLeft: 4,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    deleteBtnText: {
        color: COLORS.danger,
        fontWeight: "500",
        fontSize: 13,
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        color: COLORS.subtext,
        fontSize: 14,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: "85%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    inlineInputsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    halfInputGroup: {
        width: "48%",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.text,
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
        fontSize: 15,
        color: COLORS.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    modalActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 28,
        marginBottom: Platform.OS === "ios" ? 20 : 0,
    },
    modalBtn: {
        width: "48%",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelModalBtn: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    cancelModalBtnText: {
        color: COLORS.subtext,
        fontWeight: "600",
    },
    submitModalBtn: {
        backgroundColor: COLORS.primary,
    },
    submitModalBtnText: {
        color: COLORS.white,
        fontWeight: "600",
    },

    /* --- BRAND NEW ALERT POPUP STYLES --- */
    alertOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)", // Dark, semi-transparent blur effect
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
    alertButtonRow: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        gap: 12,
    },
    alertButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    alertPrimaryButton: {
        backgroundColor: COLORS.secondary,
        maxWidth: 140,
    },
    alertPrimaryButtonText: {
        color: COLORS.white,
        fontWeight: "600",
        fontSize: 15,
    },
    alertCancelButton: {
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    alertCancelButtonText: {
        color: COLORS.subtext,
        fontWeight: "600",
        fontSize: 15,
    },
    alertConfirmButton: {
        backgroundColor: COLORS.danger,
    },
    alertConfirmButtonText: {
        color: COLORS.white,
        fontWeight: "600",
        fontSize: 15,
    },
});