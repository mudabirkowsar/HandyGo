import React, { useEffect, useRef, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  StatusBar,
  Dimensions,
  Easing,
  Alert,
} from 'react-native';
import { AuthContext } from './context/AuthContext'; // Ensure this path matches your context file location

const { width } = Dimensions.get('window');

// Your Color Theme
const COLORS = {
  primary: "#08B36A",
  secondary: "#0F172A",
  background: "#F8FAFC",
  card: "#FFFFFF",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
};

export default function SplashScreen({ navigation }) {
  // Consume the reactive loading state and user profiles from your AuthContext
  const { user, userToken, loading } = useContext(AuthContext);

  // Animation Values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  // Effect 1: Handle Visual Animations on Mount
  useEffect(() => {
    // sequence of animations
    Animated.sequence([
      // 1. Logo Pops in
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
      // 2. Text Slides up
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

    // 3. Loading Bar Animation (Independent)
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, []);

  // Effect 2: Safe Session Verification & Routing Check
  useEffect(() => {
    // Variable to hold timer reference for local layout block tracking
    let determineNavigationRoute;

    // Only attempt routing options when AuthProvider has finished reading data from storage
    if (!loading) {
      determineNavigationRoute = setTimeout(() => {
        
        if (userToken && user) {
          // Normalize the role string to lowercase to prevent configuration mismatches
          const userRole = user.role ? String(user.role).toLowerCase().trim() : "customer";

          console.log("SPLASH LOGGED ROLE DETECTED:", userRole);
          // Alert.alert("Session Found", `Retrieved user role from context: ${userRole}`);

          if (userRole === "customer" || userRole === "user") {
            navigation.replace('MainTabs');
          } else if (userRole === "provider") {
            navigation.replace('ProviderProfileScreen');
          } else {
            navigation.replace('Login');
          }
        } else {
          console.log("SPLASH LOG: No active user token session discovered.");
          navigation.replace('Login');
        }

      }, 3200); // Gives the 3-second loader bar visual animation time to complete cleanly
    }

    // FIXED: The cleanup function is now returned properly at the top level of the hook
    return () => {
      if (determineNavigationRoute) {
        clearTimeout(determineNavigationRoute);
      }
    };
  }, [loading, user, userToken]);

  // Interpolate loading width
  const loaderWidth = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Light background means dark text in status bar */}
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
    // Soft Shadow
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
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
    fontSize: 14,
    color: COLORS.subtext,
    marginTop: 5,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    marginBottom: 10,
  },
  loaderBackground: {
    width: width * 0.6,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loaderFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});