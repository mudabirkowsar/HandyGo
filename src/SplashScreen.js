import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  StatusBar,
  Dimensions,
  Easing,
} from 'react-native';

const { width } = Dimensions.get('window');

// Premium Color System
const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
};

export default function SplashScreen({ navigation }) {

  // Animation Values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Kick off visual animations sequence
    Animated.sequence([
      // Logo Pops in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 10,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      // Text Slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Loading Bar Track Progress Animation (3000ms total duration)
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false, // width adjustments cannot use native driver layer
    }).start();

    // 3. Coordinate Initialization with Authenticated Device States
    checkAuthenticationAndNavigate();
  }, []);

  const checkAuthenticationAndNavigate = async () => {
    try {
      // Safely fetch string contents asynchronously from system sandboxes
      const providerToken = await AsyncStorage.getItem('providerToken');
      const userToken = await AsyncStorage.getItem('userToken');

      // We explicitly hold navigation transitions until loading progress completes (3000ms)
      setTimeout(() => {
        if (providerToken) {
          navigation.replace('ProviderHome');
        } else if (userToken) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      }, 3100); // 3100ms matches cleanly with the progress animation bar ending frame

    } catch (error) {
      console.error("Critical routing validation exception occurred:", error);
      // Fallback routing behavior to ensure application state doesn't freeze
      navigation.replace('Login');
    }
  };

  // Interpolate loading width
  const loaderWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.mainContent}>
        {/* Animated Logo Image */}
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={require('../assets/logo/handyGoo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Text Brand */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
            alignItems: 'center',
          }}
        >
          <View style={styles.titleWrapper}>
            <Text style={styles.titleHandy}>Handy</Text>
            <Text style={styles.titleGo}>Go</Text>
          </View>
          <Text style={styles.subtitle}>Your Home Service Partner</Text>
        </Animated.View>
      </View>

      {/* Footer Loading Area */}
      <View style={styles.footer}>
        <Text style={styles.loadingText}>Initializing services...</Text>
        <View style={styles.loaderBackground}>
          <Animated.View style={[styles.loaderFill, { width: loaderWidth }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.card,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    // Soft Shadow Engine Layout Configurations
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 4,
  },
  logo: {
    width: 80,
    height: 80,
  },
  titleWrapper: {
    flexDirection: 'row',
  },
  titleHandy: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  titleGo: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 6,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.subtext,
    marginBottom: 12,
    fontWeight: '500',
  },
  loaderBackground: {
    width: width * 0.55,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
});