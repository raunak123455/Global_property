import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  realEstateColors,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/RealEstateColors";
import { GradientButton } from "@/components/ui/GradientButton";
import { CustomButton } from "@/components/ui/CustomButton";
import { useUser } from "@/contexts/UserContext";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Check if user is already logged in
    if (!isLoading && user) {
      console.log("User already logged in, redirecting...", user);
      // Navigate based on user role
      if (user.role === "seller") {
        router.replace("/(seller-tabs)/seller-dashboard");
      } else if (user.role === "notary") {
        router.replace("/(notary-tabs)/notary-dashboard");
      } else {
        router.replace("/(tabs)/dashboard");
      }
    }
  }, [isLoading, user]);

  useEffect(() => {
    // Only run animations if user is not logged in
    if (!isLoading && !user) {
      // Entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, user]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Image
          source={require("@/assets/images/estate.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(0, 0, 0, 0)",
            "rgba(0, 0, 0, 0.3)",
            "rgba(0, 0, 0, 0.7)",
            "rgba(0, 0, 0, 0.9)",
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.gradient}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.brandText}>GLOBALO</Text>
          <ActivityIndicator
            size="large"
            color={realEstateColors.primary[400]}
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/estate.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          "rgba(0, 0, 0, 0)",
          "rgba(0, 0, 0, 0.3)",
          "rgba(0, 0, 0, 0.7)",
          "rgba(0, 0, 0, 0.9)",
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      />

      {/* Header with logo/brand */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.brandText}>GLOBALO</Text>
      </Animated.View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>Premium Real Estate</Text>
          <Text style={styles.titleLine1}>Discover</Text>
          <Text style={styles.titleLine2}>your unique</Text>
          <Text style={styles.titleLine3}>dream house</Text>
          <Text style={styles.description}>
            Find luxury properties that match your lifestyle. From modern
            apartments to exclusive villas.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            title="Get Started"
            onPress={() => router.push("/(auth)/login")}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
          <CustomButton
            title="Explore Properties"
            onPress={() => router.push("/(tabs)/search")}
            variant="outline"
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>

        {/* Trust indicators */}
        <Animated.View style={[styles.trustIndicators, { opacity: fadeAnim }]}>
          <View style={styles.indicator}>
            <Text style={styles.indicatorNumber}>500+</Text>
            <Text style={styles.indicatorLabel}>Properties</Text>
          </View>
          <View style={styles.indicator}>
            <Text style={styles.indicatorNumber}>50+</Text>
            <Text style={styles.indicatorLabel}>Cities</Text>
          </View>
          <View style={styles.indicator}>
            <Text style={styles.indicatorNumber}>24/7</Text>
            <Text style={styles.indicatorLabel}>Support</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.black,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  loader: {
    marginTop: spacing.md,
  },
  header: {
    position: "absolute",
    top: spacing.xl,
    left: spacing.lg,
    zIndex: 10,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "800",
    color: realEstateColors.white,
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: height * 0.15,
    paddingBottom: spacing.xl,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: spacing.xxl,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: realEstateColors.primary[300],
    textAlign: "left",
    marginBottom: spacing.sm,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  titleLine1: {
    fontSize: 42,
    fontWeight: "800",
    color: realEstateColors.white,
    textAlign: "left",
    lineHeight: 48,
    marginBottom: -spacing.xs,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleLine2: {
    fontSize: 42,
    fontWeight: "800",
    color: realEstateColors.white,
    textAlign: "left",
    lineHeight: 48,
    marginBottom: -spacing.xs,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleLine3: {
    fontSize: 42,
    fontWeight: "800",
    color: realEstateColors.white,
    textAlign: "left",
    lineHeight: 48,
    marginBottom: spacing.lg,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: "400",
    color: realEstateColors.gray[200],
    textAlign: "left",
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: width * 0.85,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    width: "100%",
    minHeight: 56,
    ...shadows.lg,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: "100%",
    minHeight: 52,
    borderColor: realEstateColors.white,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.white,
  },
  trustIndicators: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: borderRadius.xl,
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  indicator: {
    alignItems: "center",
    flex: 1,
  },
  indicatorNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  indicatorLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: realEstateColors.gray[300],
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
