import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");

// High-quality professional background images
const BANNERS = [
  {
    id: "1",
    title: "50% OFF",
    subtitle: "On your first House Cleaning",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop",
    overlay: "rgba(8, 179, 106, 0.60)", // Primary Green Overlay
  },
  {
    id: "2",
    title: "Expert AC Repair",
    subtitle: "Starting at just ₹499",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1000&auto=format&fit=crop",
    overlay: "rgba(15, 23, 42, 0.60)", // Dark Blue Overlay
  },
  {
    id: "3",
    title: "Instant Plumbing",
    subtitle: "Certified help in 30 mins",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca1f965?q=80&w=1000&auto=format&fit=crop",
    overlay: "rgba(37, 99, 235, 0.60)", // Blue Overlay
  },
];

const HomeBanners = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    let interval = setInterval(() => {
      let nextIndex = activeIndex === BANNERS.length - 1 ? 0 : activeIndex + 1;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4500); // 4.5 seconds rotation

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== activeIndex) {
        setActiveIndex(index);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.bannerContainer}>
        <TouchableOpacity activeOpacity={0.95} style={styles.touchable}>
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.backgroundImage}
            imageStyle={{ borderRadius: 24 }}
          >
            {/* The Overlay gives the text contrast */}
            <View style={[styles.overlay, { backgroundColor: item.overlay }]}>
              <View style={styles.content}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.subtitleText}>{item.subtitle}</Text>
                
                <TouchableOpacity style={styles.glassBtn}>
                  <Text style={styles.btnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        snapToAlignment="center"
        decelerationRate="fast"
      />
      
      {/* Dynamic Indicators */}
      <View style={styles.indicatorContainer}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    marginVertical: 10,
  },
  bannerContainer: {
    width: width,
    paddingHorizontal: 20,
    height: 180,
  },
  touchable: {
    flex: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    borderRadius: 24,
    padding: 25,
    justifyContent: 'center',
  },
  content: {
    maxWidth: '70%',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    marginBottom: 15,
  },
  glassBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 22,
    backgroundColor: "#08B36A",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "#CBD5E1",
  },
});

export default HomeBanners;