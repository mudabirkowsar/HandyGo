// screens/AllReviews.js
import React, { useState, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
    Animated
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Import your live API calls from the correct Provider endpoint paths
import { fetchMyDashboardReviews } from '../../../../api/ProviderAPI';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    background: "#F8FAFC",
    card: "#FFFFFF",
    textMain: "#0F172A",
    textMuted: "#64748B",
    white: "#FFFFFF",
    border: "#E2E8F0",
    warning: "#F59E0B"
};

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // Custom Toast Architecture
    const [toastMessage, setToastMessage] = useState("");
    const toastOpacity = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            // Reset variables on initial navigation focus window entry points
            setPage(1);
            loadReviewsPipeline(1, false);
        }, [])
    );

    const showToast = (message) => {
        setToastMessage(message);
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

    const loadReviewsPipeline = async (targetPage, isAppendedFlow = false) => {
        try {
            if (isAppendedFlow) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const response = await fetchMyDashboardReviews(targetPage, 15);

            if (response?.data?.success) {
                const receivedData = response.data.data;
                const metaPagination = response.data.pagination;

                if (isAppendedFlow) {
                    setReviews(prev => [...prev, ...receivedData]);
                } else {
                    setReviews(receivedData);
                }

                setHasNextPage(metaPagination?.hasNextPage || false);
                setTotalItems(metaPagination?.totalItems || 0);
            }
        } catch (error) {
            console.error("Dashboard feedback stream breakdown summary error:", error);
            showToast("Failed to sync structural review matrices portfolio.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMoreThreshold = () => {
        if (!loadingMore && hasNextPage) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadReviewsPipeline(nextPage, true);
        }
    };

    const formatReviewDate = (dateString) => {
        try {
            if (!dateString) return "Recent";
            const dateObj = new Date(dateString);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
        } catch (e) {
            return "Recent";
        }
    };

    const renderReviewItem = ({ item, index }) => {
        const userImg = item.user?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150';
        return (
            <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                    <Image source={{ uri: userImg }} style={styles.userAvatar} />
                    <View style={styles.userMetaColumn}>
                        <Text style={styles.userNameText}>{item.user?.fullName || "Anonymous Client"}</Text>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons
                                    key={star}
                                    name={star <= item.rating ? "star" : "star-outline"}
                                    size={13}
                                    color={COLORS.warning}
                                    style={{ marginRight: 2 }}
                                />
                            ))}
                        </View>
                    </View>
                    <Text style={styles.timestampText}>{formatReviewDate(item.createdAt)}</Text>
                </View>

                {item.comment ? (
                    <Text style={styles.commentText}>{item.comment}</Text>
                ) : (
                    <Text style={[styles.commentText, { fontStyle: 'italic', color: COLORS.textMuted }]}>
                        Left a rating score allocation without additional commentary description properties.
                    </Text>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

            {/* Dynamic Fading Toast Overlay */}
            <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>

            {/* Application Header Profile Title */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Client Reviews</Text>
                    <Text style={styles.headerSubtitle}>Total: {totalItems} feedback submissions received</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshBtn}
                    onPress={() => { setPage(1); loadReviewsPipeline(1, false); }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="refresh-outline" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Pulling your feedback profile data stream...</Text>
                </View>
            ) : reviews.length > 0 ? (
                <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMoreThreshold}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={() => (
                        loadingMore ? (
                            <View style={styles.footerLoaderContainer}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                            </View>
                        ) : null
                    )}
                />
            ) : (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="chatbubbles-outline" size={44} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.emptyTitleText}>No Reviews Recorded Yet</Text>
                    <Text style={styles.emptySubtext}>When clients rate your job completions, their commentary histories stream straight to this screen.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10
    },
    toastContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 10,
        left: 20,
        right: 20,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#FEF2F2",
        borderColor: "rgba(239, 68, 68, 0.2)",
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.danger,
        marginLeft: 8,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.secondary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '500',
        marginTop: 2,
    },
    refreshBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textMuted,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    reviewCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.01,
        shadowRadius: 8,
        elevation: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: COLORS.background,
    },
    userMetaColumn: {
        flex: 1,
        marginLeft: 12,
    },
    userNameText: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.textMain,
    },
    starsRow: {
        flexDirection: 'row',
        marginTop: 3,
    },
    timestampText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.textMuted,
    },
    commentText: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 19,
        marginTop: 12,
        fontWeight: '400',
    },
    footerLoaderContainer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyTitleText: {
        color: COLORS.secondary,
        fontSize: 17,
        fontWeight: '800',
        textAlign: 'center',
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 6,
        lineHeight: 19,
    }
});

export default AllReviews;