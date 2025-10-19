import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  realEstateColors,
  spacing,
  shadows,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";

const { width } = Dimensions.get("window");

export default function SellerDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    pendingProperties: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user?.token) {
      console.error("No user token available");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log("Fetching stats with token:", user.token);
      const response = await propertyAPI.getPropertyStats(user.token);
      console.log("Stats response:", response);

      // Handle case where response might be undefined
      if (response && typeof response === "object") {
        setStats(response);
      } else {
        console.log("No stats found or invalid response");
        setStats({
          totalProperties: 0,
          activeProperties: 0,
          soldProperties: 0,
          pendingProperties: 0,
          totalValue: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      Alert.alert("Error", "Failed to load dashboard statistics");
      setStats({
        totalProperties: 0,
        activeProperties: 0,
        soldProperties: 0,
        pendingProperties: 0,
        totalValue: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({
    title,
    value,
    IconComponent,
    iconName,
    color = realEstateColors.primary[600],
  }: {
    title: string;
    value: number;
    IconComponent: any;
    iconName: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statCardInner, shadows.md]}>
        <View style={styles.statIconContainer}>
          <LinearGradient
            colors={[color + "20", color + "10"]}
            style={styles.statIconGradient}
          >
            <IconComponent name={iconName} size={28} color={color} />
          </LinearGradient>
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  const QuickAction = ({
    title,
    IconComponent,
    iconName,
    onPress,
    color = realEstateColors.primary[600],
    gradient,
  }: {
    title: string;
    IconComponent: any;
    iconName: string;
    onPress: () => void;
    color?: string;
    gradient?: string[];
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        shadows.md,
        pressed && styles.quickActionPressed,
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={gradient || [color + "15", color + "08"]}
        style={styles.quickActionGradient}
      >
        <View
          style={[styles.quickActionIcon, { backgroundColor: color + "25" }]}
        >
          <IconComponent name={iconName} size={30} color={color} />
        </View>
        <Text style={styles.quickActionText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={realEstateColors.primary[500]}
          />
        }
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={[
            realEstateColors.primary[600],
            realEstateColors.primary[700],
          ]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.firstName}!
              </Text>
              <Text style={styles.subtitle}>
                Manage your properties with ease
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <FontAwesome5
                name="building"
                size={28}
                color={realEstateColors.white}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Overview Section */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Overview</Text>
            <Text style={styles.sectionSubtitle}>
              Your property statistics at a glance
            </Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Properties"
              value={stats.totalProperties}
              IconComponent={FontAwesome5}
              iconName="building"
              color={realEstateColors.primary[600]}
            />
            <StatCard
              title="Active Listings"
              value={stats.activeProperties}
              IconComponent={Ionicons}
              iconName="checkmark-circle"
              color={realEstateColors.green[600]}
            />
            <StatCard
              title="Sold Properties"
              value={stats.soldProperties}
              IconComponent={MaterialIcons}
              iconName="verified"
              color={realEstateColors.blue[600]}
            />
            <StatCard
              title="Pending Sales"
              value={stats.pendingProperties}
              IconComponent={MaterialIcons}
              iconName="access-time"
              color={realEstateColors.orange[600]}
            />
          </View>
        </View>

        {/* Total Value Card with Enhanced Design */}
        <View style={styles.valueSection}>
          <LinearGradient
            colors={[realEstateColors.green[500], realEstateColors.green[600]]}
            style={[styles.valueCard, shadows.lg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.valueContent}>
              <View style={styles.valueIconContainer}>
                <FontAwesome5
                  name="dollar-sign"
                  size={36}
                  color={realEstateColors.white}
                />
              </View>
              <View style={styles.valueTextContainer}>
                <Text style={styles.valueLabel}>Total Portfolio Value</Text>
                <Text style={styles.valueAmount}>
                  ${stats.totalValue.toLocaleString()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>
              Manage your properties efficiently
            </Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Add Property"
              IconComponent={Ionicons}
              iconName="add-circle"
              color={realEstateColors.primary[600]}
              onPress={() => router.push("/(seller-tabs)/add-property")}
            />
            <QuickAction
              title="My Properties"
              IconComponent={FontAwesome5}
              iconName="building"
              color={realEstateColors.blue[600]}
              onPress={() => router.push("/(seller-tabs)/my-properties")}
            />
            <QuickAction
              title="Inquiries"
              IconComponent={Ionicons}
              iconName="chatbubbles"
              color={realEstateColors.orange[600]}
              onPress={() => router.push("/(seller-tabs)/property-inquiries")}
            />
            <QuickAction
              title="My Profile"
              IconComponent={Ionicons}
              iconName="person-circle"
              color={realEstateColors.secondary[600]}
              onPress={() => router.push("/(seller-tabs)/seller-profile")}
            />
          </View>
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  // Enhanced Header Styles
  headerGradient: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  // Section Headers
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  // Stats Section
  statsSection: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
  },
  statCardInner: {
    backgroundColor: realEstateColors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: realEstateColors.gray[100],
  },
  statIconContainer: {
    marginBottom: spacing.md,
  },
  statIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
  },
  statTitle: {
    fontSize: 13,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  // Value Card Section
  valueSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  valueCard: {
    borderRadius: 20,
    padding: spacing.xl,
    overflow: "hidden",
  },
  valueContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  valueTextContainer: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  valueLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: realEstateColors.white,
  },
  // Quick Actions Section
  quickActionsSection: {
    padding: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: realEstateColors.white,
  },
  quickActionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  quickActionGradient: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: realEstateColors.gray[800],
    textAlign: "center",
  },
  // Bottom Padding
  bottomPadding: {
    height: spacing.xl,
  },
});
