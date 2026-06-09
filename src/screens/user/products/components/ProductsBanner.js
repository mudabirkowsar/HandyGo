import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const BANNER_WIDTH = width - 40; // Balanced layout padding
const AUTOPLAY_INTERVAL = 3000; // Time in milliseconds (3 seconds)

const COLORS = {
    primary: "#08B36A",
    secondary: "#0F172A",
    subtext: "#64748B",
    white: "#FFFFFF",
    border: "#E2E8F0",
    background: "#F8FAFC",
};

const ProductsBanner = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef(null);
    const autoPlayTimer = useRef(null);

    // 3 Premium distinct promotional marketplace banners
    const bannerData = [
        {
            id: "b1",
            tag: "MEGA SALE",
            title: "Super Monsoon Sale\nUp to 50% OFF",
            subtitle: "Premium home kits & hardware gear",
            cta: "Shop Now",
            image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600",
            bgColor: "#0F172A", // Slate Dark Theme
            accentColor: "#08B36A",
        },
        {
            id: "b2",
            tag: "CASHBACK",
            title: "Flat ₹500 Back\nOn First Order",
            subtitle: "Instant credit using code: FIRST500",
            cta: "Claim Offer",
            image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600",
            bgColor: "#065F46", // Dark Emerald Theme
            accentColor: "#F59E0B",
        },
        {
            id: "b3",
            tag: "NEW ARRIVAL",
            title: "Smart Equipment\nHas Just Arrived",
            subtitle: "Upgrade to wireless heavy-duty tools",
            cta: "Explore Now",
            image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600",
            bgColor: "#1E3A8A", // Deep Royal Blue Theme
            accentColor: "#38BDF8",
        },
    ];

    // Auto-play Engine Logic
    useEffect(() => {
        startAutoPlay();

        // Clean up interval timer on unmount to save memory performance
        return () => stopAutoPlay();
    }, [activeIndex]);

    const startAutoPlay = () => {
        stopAutoPlay(); // Reset any existing active timers
        autoPlayTimer.current = setInterval(() => {
            let nextIndex = activeIndex + 1;

            // Loop back to index 0 if we hit the end of the data array
            if (nextIndex >= bannerData.length) {
                nextIndex = 0;
            }

            flatListRef.current?.scrollToOffset({
                offset: nextIndex * (BANNER_WIDTH + 14), // Matches item size + layout gap tracking
                animated: true,
            });
        }, AUTOPLAY_INTERVAL);
    };

    const stopAutoPlay = () => {
        if (autoPlayTimer.current) {
            clearInterval(autoPlayTimer.current);
        }
    };

    // Tracks manual touch swipe scrolling motions to safely synchronize active indicator indices
    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(scrollPosition / (BANNER_WIDTH + 14));
        if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < bannerData.length) {
            setActiveIndex(currentIndex);
        }
    };

    return (
        <View style={styles.outerContainer}>
            <FlatList
                ref={flatListRef}
                data={bannerData}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={BANNER_WIDTH + 14} // Snaps perfectly onto each banner card
                decelerationRate="fast"
                contentContainerStyle={styles.listContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                // Temporarily freeze the auto changer when user manually holds down/drags the view
                onScrollBeginDrag={stopAutoPlay}
                onScrollEndDrag={startAutoPlay}
                renderItem={({ item }) => (
                    <View style={[styles.bannerCard, { backgroundColor: item.bgColor }]}>
                        {/* Visual background atmospheric pattern element */}
                        <View style={styles.decorativeCircle} />

                        {/* Left Box: Content Call-to-action */}
                        <View style={styles.contentColumn}>
                            <View style={[styles.tagBadge, { backgroundColor: "rgba(255, 255, 255, 0.15)" }]}>
                                <Text style={styles.tagText}>{item.tag}</Text>
                            </View>

                            <Text style={styles.titleText}>{item.title}</Text>
                            <Text style={styles.subtitleText} numberOfLines={1}>{item.subtitle}</Text>

                            <TouchableOpacity
                                style={[styles.ctaButton, { backgroundColor: item.accentColor }]}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.ctaText}>{item.cta}</Text>
                                <Ionicons name="arrow-forward" size={14} color={COLORS.white} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </View>

                        {/* Right Box: Floating Asset Picture Cover */}
                        <View style={styles.imageColumn}>
                            <Image source={{ uri: item.image }} style={styles.bannerImage} />
                        </View>
                    </View>
                )}
            />

            {/* Modern Interactive Dot Pagination Indicator Track */}
            <View style={styles.paginationTrack}>
                {bannerData.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dotElement,
                            index === activeIndex ? styles.activeDotElement : null,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        paddingTop: 15,
        paddingBottom: 20,
        backgroundColor: COLORS.white,
    },
    listContainer: {
        paddingHorizontal: 20,
        gap: 14,
    },
    bannerCard: {
        width: BANNER_WIDTH,
        height: 160,
        borderRadius: 20,
        flexDirection: "row",
        overflow: "hidden",
        position: "relative",
    },
    decorativeCircle: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        top: -60,
        left: -40,
        zIndex: 0,
    },
    contentColumn: {
        flex: 1.2,
        padding: 20,
        justifyContent: "center",
        zIndex: 1,
    },
    tagBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 10,
    },
    tagText: {
        color: "#F8FAFC",
        fontSize: 9,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    titleText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "800",
        lineHeight: 24,
        letterSpacing: -0.2,
    },
    subtitleText: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "400",
        marginTop: 4,
        marginBottom: 14,
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    ctaText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "700",
    },
    imageColumn: {
        flex: 0.9,
        height: "100%",
    },
    bannerImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    paginationTrack: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },
    dotElement: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#CBD5E1",
        marginHorizontal: 4,
    },
    activeDotElement: {
        width: 18, // Clean horizontal pill expansion effect
        backgroundColor: COLORS.secondary,
        borderRadius: 3,
    },
});

export default ProductsBanner;