import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 44) / 2; // Perfectly splits screen padding columns

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#111827",
    subtext: "#64748B",
    border: "#E2E8F0",
    white: "#FFFFFF",
    danger: "#EF4444",
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    // Premium commercial marketplace catalog mock database
    const catalogData = [
        {
            _id: "p1",
            title: "All-Purpose Cleaner",
            category: "Maintenance",
            description: "Professional grade eco-safe cleaning solution.",
            price: 499,
            rating: 4.7,
            totalReviews: 142,
            productImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500",
            inStock: true,
        },
        {
            _id: "p2",
            title: "Impact Drill Kit",
            category: "Tools",
            description: "21V wireless powerful impact variable drill machine.",
            price: 2899,
            rating: 4.9,
            totalReviews: 96,
            productImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500",
            inStock: true,
        },
        {
            _id: "p3",
            title: "Premium Paint Brushes",
            category: "Hardware",
            description: "Synthetic non-shed fine detail brush set pack.",
            price: 349,
            rating: 4.4,
            totalReviews: 58,
            productImage: "https://images.unsplash.com/photo-1530124566582-aa37dd159a76?q=80&w=500",
            inStock: false, // Triggers custom out of stock layer
        },
        {
            _id: "p4",
            title: "Smart LED Bulb 12W",
            category: "Electrical",
            description: "Wi-Fi controllable RGB dynamic multi-color lighting.",
            price: 799,
            rating: 4.6,
            totalReviews: 215,
            productImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500",
            inStock: true,
        },
        {
            _id: "p5",
            title: "All-Purpose Cleaner",
            category: "Maintenance",
            description: "Professional grade eco-safe cleaning solution.",
            price: 499,
            rating: 4.7,
            totalReviews: 142,
            productImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500",
            inStock: true,
        },
        {
            _id: "p6",
            title: "Impact Drill Kit",
            category: "Tools",
            description: "21V wireless powerful impact variable drill machine.",
            price: 2899,
            rating: 4.9,
            totalReviews: 96,
            productImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500",
            inStock: true,
        },
        {
            _id: "p7",
            title: "Premium Paint Brushes",
            category: "Hardware",
            description: "Synthetic non-shed fine detail brush set pack.",
            price: 349,
            rating: 4.4,
            totalReviews: 58,
            productImage: "https://images.unsplash.com/photo-1530124566582-aa37dd159a76?q=80&w=500",
            inStock: false, // Triggers custom out of stock layer
        },
        {
            _id: "p8",
            title: "Smart LED Bulb 12W",
            category: "Electrical",
            description: "Wi-Fi controllable RGB dynamic multi-color lighting.",
            price: 799,
            rating: 4.6,
            totalReviews: 215,
            productImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=500",
            inStock: true,
        },
    ];

    useEffect(() => {
        fetchMarketplaceProducts();
    }, []);

    const fetchMarketplaceProducts = async () => {
        setLoading(true);
        try {
            // Mimic server handshake response latency
            await new Promise((resolve) => setTimeout(resolve, 600));
            setProducts(catalogData);
        } catch (error) {
            console.log("Error handling product fetching:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Text style={styles.sectionSubtitle}>Top high-quality supplies picked for you</Text>
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
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContainer}
                numColumns={2}
                columnWrapperStyle={styles.rowWrapper}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} // Prevents virtualized rendering context layout crash when nested inside screens
                nestedScrollEnabled={true}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialCommunityIcons name="package-variant-bar-drop" size={44} color={COLORS.subtext} />
                        <Text style={styles.emptyText}>No premium products available.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.productCard}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate("ProductDetailsScreen", { productId: item._id })}
                    >
                        {/* Upper Media Block */}
                        <View style={styles.imageContainer}>
                            {item.productImage ? (
                                <Image source={{ uri: item.productImage }} style={styles.productPic} />
                            ) : (
                                <View style={[styles.productPic, styles.fallbackAvatar]}>
                                    <MaterialCommunityIcons name="image-off-outline" size={24} color={COLORS.subtext} />
                                </View>
                            )}

                            {/* Status Badge Overlays */}
                            {!item.inStock && (
                                <View style={styles.outOfStockBadge}>
                                    <Text style={styles.outOfStockText}>SOLD OUT</Text>
                                </View>
                            )}

                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                        </View>

                        {/* Lower Details Content Block */}
                        <View style={styles.infoBlock}>
                            <Text style={styles.productName} numberOfLines={1}>
                                {item.title}
                            </Text>

                            <Text style={styles.descriptionText} numberOfLines={1}>
                                {item.description}
                            </Text>

                            <View style={styles.divider} />

                            <View style={styles.metricsRow}>
                                {/* Rating Feedback Node */}
                                <View style={styles.ratingGroup}>
                                    <Ionicons name="star" size={13} color="#F59E0B" />
                                    <Text style={styles.ratingText}>
                                        {item.rating ? item.rating.toFixed(1) : "New"}
                                    </Text>
                                    {item.totalReviews > 0 && (
                                        <Text style={styles.reviewsText}>({item.totalReviews})</Text>
                                    )}
                                </View>

                                {/* Price Label Node */}
                                <Text style={styles.priceText} numberOfLines={1}>
                                    ₹{item.price}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: 20,
        paddingBottom: 70,
    },
    centerContainer: {
        paddingVertical: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 20,
    },
    headerSection: {
        marginBottom: 16,
        width: "100%",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: COLORS.subtext,
        marginTop: 2,
    },
    rowWrapper: {
        justifyContent: "space-between",
        marginBottom: 14,
    },
    productCard: {
        backgroundColor: COLORS.card,
        borderRadius: 14,
        width: CARD_WIDTH,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: "hidden",
        elevation: 2,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
    },
    imageContainer: {
        width: "100%",
        height: 115,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    productPic: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    fallbackAvatar: {
        backgroundColor: COLORS.border,
        alignItems: "center",
        justifyContent: "center",
    },
    outOfStockBadge: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    outOfStockText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    categoryBadge: {
        position: "absolute",
        bottom: 8,
        left: 8,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: "700",
        color: COLORS.white,
        textTransform: "uppercase",
    },
    infoBlock: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.text,
    },
    descriptionText: {
        fontSize: 12,
        color: COLORS.subtext,
        marginTop: 3,
        height: 16,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 10,
    },
    metricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ratingGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.text,
        marginLeft: 3,
    },
    reviewsText: {
        fontSize: 11,
        color: COLORS.subtext,
        marginLeft: 2,
    },
    priceText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.secondary,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 50,
        width: width - 40,
    },
    emptyText: {
        color: COLORS.subtext,
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
});

export default Products;