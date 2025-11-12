import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "./IconSymbol";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";

interface KycWarningBannerProps {
  onDismiss?: () => void;
  dismissible?: boolean;
}

export const KycWarningBanner: React.FC<KycWarningBannerProps> = ({
  onDismiss,
  dismissible = true,
}) => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation sequence - scale up from center
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing icon animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleDismiss = () => {
    if (dismissible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.7,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    }
  };

  const handleVerifyNow = () => {
    router.push("/(tabs)/kyc-verification");
  };

  // Don't show if user is KYC verified or banner was dismissed
  if (!visible || user?.kycVerified) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay - tap to dismiss */}
      <Pressable
        style={styles.backdropContainer}
        onPress={dismissible ? handleDismiss : undefined}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        />
      </Pressable>

      <Animated.View
        style={[
          styles.outerContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 152, 0, 0.15)",
            "rgba(255, 193, 7, 0.12)",
            "rgba(255, 152, 0, 0.08)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <View style={styles.container}>
            {/* Animated accent bar */}
            <View style={styles.accentBar} />

            <View style={styles.content}>
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["#FF9800", "#FFB300"]}
                  style={styles.iconGradient}
                >
                  <IconSymbol
                    name="exclamationmark.shield.fill"
                    size={28}
                    color={realEstateColors.white}
                  />
                </LinearGradient>
              </Animated.View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>🔒 Verification Required</Text>
                <Text style={styles.description}>
                  Complete your KYC to unlock all features and start transacting
                  with confidence.
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.verifyButton,
                  pressed && styles.verifyButtonPressed,
                ]}
                onPress={handleVerifyNow}
              >
                <LinearGradient
                  colors={[
                    realEstateColors.primary[600],
                    realEstateColors.primary[700],
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.verifyButtonGradient}
                >
                  <IconSymbol
                    name="checkmark.shield.fill"
                    size={18}
                    color={realEstateColors.white}
                  />
                  <Text style={styles.verifyButtonText}>Verify Now</Text>
                  <IconSymbol
                    name="arrow.right"
                    size={16}
                    color={realEstateColors.white}
                  />
                </LinearGradient>
              </Pressable>

              {dismissible && (
                <Pressable
                  style={({ pressed }) => [
                    styles.dismissButton,
                    pressed && styles.dismissButtonPressed,
                  ]}
                  onPress={handleDismiss}
                >
                  <Text style={styles.dismissButtonText}>Maybe Later</Text>
                </Pressable>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdropContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  outerContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    marginTop: -150, // Half of approximate banner height for centering
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 15,
    zIndex: 10000,
  },
  gradientContainer: {
    borderRadius: borderRadius.xl,
    overflow: "hidden",
  },
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 152, 0, 0.2)",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#FF9800",
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  verifyButton: {
    flex: 1.2,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: realEstateColors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  verifyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  verifyButtonText: {
    color: realEstateColors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dismissButton: {
    flex: 0.8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: realEstateColors.gray[300],
  },
  dismissButtonPressed: {
    opacity: 0.7,
    backgroundColor: realEstateColors.gray[100],
  },
  dismissButtonText: {
    color: realEstateColors.gray[700],
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
