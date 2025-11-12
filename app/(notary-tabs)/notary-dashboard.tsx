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
import { KycWarningBanner } from "@/components/KycWarningBanner";
import { useKycReminder } from "@/hooks/useKycReminder";
import { propertyAPI } from "@/utils/api";
import { Image } from "react-native";

const { width } = Dimensions.get("window");

export default function NotaryDashboard() {
  const { user, isLoading: userLoading } = useUser();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
  });
  const [propertiesWithDocuments, setPropertiesWithDocuments] = useState<any[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showReminder, dismissReminder } = useKycReminder();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [userLoading, user]);

  const fetchStats = async () => {
    try {
      if (!user?.token) return;

      // Fetch properties with submitted legal documents
      const response = await propertyAPI.getPropertiesWithLegalDocuments(
        user.token
      );

      if (response && response.properties) {
        setPropertiesWithDocuments(response.properties);

        // Calculate stats from the actual data
        const totalDocs = response.properties.length;
        const pendingDocs = response.properties.filter(
          (p: any) =>
            p.legalDocuments.notaryStatus === "pending" ||
            p.legalDocuments.notaryStatus === "under-review"
        ).length;
        const verifiedDocs = response.properties.filter(
          (p: any) => p.legalDocuments.notaryStatus === "verified"
        ).length;

        setStats({
          totalDocuments: totalDocs,
          pendingDocuments: pendingDocs,
          verifiedDocuments: verifiedDocs,
          totalAppointments: 0, // TODO: Implement appointments API
          upcomingAppointments: 0,
          completedAppointments: 0,
        });
      } else {
        // Fallback to empty stats if no response
        setPropertiesWithDocuments([]);
        setStats({
          totalDocuments: 0,
          pendingDocuments: 0,
          verifiedDocuments: 0,
          totalAppointments: 0,
          upcomingAppointments: 0,
          completedAppointments: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      Alert.alert("Error", "Failed to load dashboard statistics");
      setPropertiesWithDocuments([]);
      setStats({
        totalDocuments: 0,
        pendingDocuments: 0,
        verifiedDocuments: 0,
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }) => {
    const [pressed, setPressed] = useState(false);

    return (
      <Pressable
        style={styles.statCard}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
        <View
          style={[
            styles.statCardInner,
            shadows.md,
            pressed && styles.statCardPressed,
          ]}
        >
          <View style={styles.statIconContainer}>
            <View style={styles.statIconSquare}>
              <IconComponent name={iconName} size={22} color={color} />
            </View>
          </View>
          <View style={styles.statInfo}>
            <Text
              style={[styles.statTitle, pressed && styles.statTitlePressed]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            <Text
              style={[styles.statValue, pressed && styles.statValuePressed]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {value.toLocaleString()}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

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
    gradient?: readonly [string, string, ...string[]];
  }) => {
    const gradientColors =
      gradient || ([color + "15", color + "08"] as readonly [string, string]);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.quickAction,
          shadows.md,
          pressed && styles.quickActionPressed,
        ]}
        onPress={onPress}
      >
        <LinearGradient
          colors={gradientColors}
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
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* KYC Warning Banner - Positioned on top */}
      {showReminder && <KycWarningBanner onDismiss={dismissReminder} />}

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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.firstName}!
              </Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                Manage documents and appointments with ease
              </Text>
            </View>
            <View style={styles.headerIcon}>
              <FontAwesome5
                name="stamp"
                size={24}
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
              Your notary statistics at a glance
            </Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Documents"
              value={stats.totalDocuments}
              IconComponent={Ionicons}
              iconName="document-text"
              color={realEstateColors.primary[600]}
            />
            <StatCard
              title="Pending Documents"
              value={stats.pendingDocuments}
              IconComponent={MaterialIcons}
              iconName="pending-actions"
              color={realEstateColors.orange[600]}
            />
            <StatCard
              title="Verified Documents"
              value={stats.verifiedDocuments}
              IconComponent={MaterialIcons}
              iconName="verified"
              color={realEstateColors.green[600]}
            />
            <StatCard
              title="Total Appointments"
              value={stats.totalAppointments}
              IconComponent={Ionicons}
              iconName="calendar"
              color={realEstateColors.blue[600]}
            />
            <StatCard
              title="Upcoming Appointments"
              value={stats.upcomingAppointments}
              IconComponent={Ionicons}
              iconName="time"
              color={realEstateColors.secondary[600]}
            />
            <StatCard
              title="Completed Appointments"
              value={stats.completedAppointments}
              IconComponent={Ionicons}
              iconName="checkmark-circle"
              color={realEstateColors.purple[600]}
            />
          </View>
        </View>

        {/* Properties with Submitted Documents Section */}
        {propertiesWithDocuments.length > 0 && (
          <View style={styles.propertiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Properties Awaiting Verification
              </Text>
              <Text style={styles.sectionSubtitle}>
                {propertiesWithDocuments.length} properties with submitted
                documents
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.propertiesScroll}
              contentContainerStyle={styles.propertiesScrollContent}
            >
              {propertiesWithDocuments.slice(0, 5).map((property: any) => (
                <Pressable
                  key={property.propertyId}
                  style={({ pressed }) => [
                    styles.propertyCard,
                    pressed && styles.propertyCardPressed,
                  ]}
                  onPress={() =>
                    router.push(
                      `/(notary-tabs)/property-document-details?propertyId=${property.propertyId}`
                    )
                  }
                >
                  <View style={styles.propertyCardInner}>
                    {/* Image Container with Overlay */}
                    <View style={styles.propertyImageContainer}>
                      {property.propertyImages &&
                      property.propertyImages.length > 0 ? (
                        <Image
                          source={{ uri: property.propertyImages[0] }}
                          style={styles.propertyImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.propertyImagePlaceholder}>
                          <Ionicons
                            name="home"
                            size={40}
                            color={realEstateColors.gray[400]}
                          />
                        </View>
                      )}
                      {/* Price Badge Overlay */}
                      {property.propertyPrice && (
                        <LinearGradient
                          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.6)"]}
                          style={styles.priceOverlay}
                        >
                          <Text style={styles.priceText}>
                            ${property.propertyPrice.toLocaleString()}
                          </Text>
                        </LinearGradient>
                      )}
                      {/* Status Badge on Image */}
                      <View style={styles.statusBadgeContainer}>
                        <View
                          style={[
                            styles.statusBadgeImage,
                            {
                              backgroundColor:
                                property.legalDocuments.notaryStatus ===
                                "pending"
                                  ? realEstateColors.orange[600]
                                  : property.legalDocuments.notaryStatus ===
                                    "verified"
                                  ? realEstateColors.green[600]
                                  : realEstateColors.blue[600],
                            },
                          ]}
                        >
                          <Ionicons
                            name={
                              property.legalDocuments.notaryStatus === "pending"
                                ? "time"
                                : property.legalDocuments.notaryStatus ===
                                  "verified"
                                ? "checkmark-circle"
                                : "document-text"
                            }
                            size={12}
                            color={realEstateColors.white}
                          />
                          <Text style={styles.statusBadgeTextImage}>
                            {property.legalDocuments.notaryStatus.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Card Content */}
                    <View style={styles.propertyCardContent}>
                      <Text style={styles.propertyCardTitle} numberOfLines={2}>
                        {property.propertyTitle}
                      </Text>
                      <View style={styles.addressRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={realEstateColors.gray[500]}
                        />
                        <Text
                          style={styles.propertyCardAddress}
                          numberOfLines={1}
                        >
                          {property.propertyAddress}
                        </Text>
                      </View>
                      {property.seller && (
                        <View style={styles.sellerInfo}>
                          <View style={styles.sellerIconContainer}>
                            <Ionicons
                              name="person"
                              size={12}
                              color={realEstateColors.primary[600]}
                            />
                          </View>
                          <Text style={styles.sellerName} numberOfLines={1}>
                            {property.seller.name}
                          </Text>
                        </View>
                      )}
                      {/* Action Indicator */}
                      <View style={styles.actionIndicator}>
                        <Text style={styles.actionText}>Tap to review</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={realEstateColors.primary[600]}
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Pending Documents Alert Card */}
        {stats.pendingDocuments > 0 && (
          <View style={styles.alertSection}>
            <LinearGradient
              colors={[
                realEstateColors.orange[500],
                realEstateColors.orange[600],
              ]}
              style={[styles.alertCard, shadows.lg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.alertContent}>
                <View style={styles.alertIconContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={36}
                    color={realEstateColors.white}
                  />
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertLabel}>Pending Documents</Text>
                  <Text style={styles.alertValue}>
                    {stats.pendingDocuments} document
                    {stats.pendingDocuments > 1 ? "s" : ""} awaiting
                    verification
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>
              Manage your notary tasks efficiently
            </Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              title="Documents"
              IconComponent={Ionicons}
              iconName="document-text"
              color={realEstateColors.primary[600]}
              onPress={() =>
                router.push("/(notary-tabs)/document-verification")
              }
            />
            <QuickAction
              title="Appointments"
              IconComponent={Ionicons}
              iconName="calendar"
              color={realEstateColors.blue[600]}
              onPress={() => router.push("/(notary-tabs)/appointments")}
            />
            <QuickAction
              title="Schedule"
              IconComponent={Ionicons}
              iconName="time"
              color={realEstateColors.orange[600]}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Schedule management will be available soon"
                )
              }
            />
            <QuickAction
              title="My Profile"
              IconComponent={Ionicons}
              iconName="person-circle"
              color={realEstateColors.secondary[600]}
              onPress={() => router.push("/(notary-tabs)/notary-profile")}
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
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: spacing.sm,
    minWidth: 0, // Allow text to shrink
    flexShrink: 1,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    flexShrink: 0, // Prevent icon from shrinking
  },
  welcomeText: {
    fontSize: 24,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: realEstateColors.gray[50],
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2, // Calculate exact width: (screen width - left/right padding - gap between cards) / 2
    marginBottom: spacing.md,
  },
  statCardInner: {
    backgroundColor: realEstateColors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: realEstateColors.gray[200],
    position: "relative",
    overflow: "hidden",
    height: 100, // Fixed height for all cards
  },
  statCardPressed: {
    backgroundColor: realEstateColors.primary[600],
    borderColor: realEstateColors.primary[500],
  },
  statIconContainer: {
    marginRight: spacing.sm,
  },
  statIconSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: realEstateColors.gray[100],
  },
  statInfo: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0, // Allow text to shrink
  },
  statTitle: {
    fontSize: 12,
    color: realEstateColors.gray[700],
    fontWeight: "500",
    flexShrink: 1,
    lineHeight: 16,
  },
  statTitlePressed: {
    color: realEstateColors.white,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
  },
  statValuePressed: {
    color: realEstateColors.white,
  },
  // Alert Card Section
  alertSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  alertCard: {
    borderRadius: 20,
    padding: spacing.xl,
    overflow: "hidden",
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertTextContainer: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  alertLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  alertValue: {
    fontSize: 18,
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
  // Properties Section
  propertiesSection: {
    padding: spacing.lg,
    backgroundColor: realEstateColors.gray[50],
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  propertiesScroll: {
    marginTop: spacing.md,
  },
  propertiesScrollContent: {
    paddingRight: spacing.lg,
  },
  propertyCard: {
    width: 300,
    marginRight: spacing.md,
  },
  propertyCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  propertyCardInner: {
    backgroundColor: realEstateColors.white,
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.lg,
    borderWidth: 1,
    borderColor: realEstateColors.gray[200],
  },
  propertyImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  propertyImage: {
    width: "100%",
    height: "100%",
    backgroundColor: realEstateColors.gray[100],
  },
  propertyImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: realEstateColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  priceOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.white,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusBadgeContainer: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  statusBadgeImage: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    ...shadows.md,
  },
  statusBadgeTextImage: {
    fontSize: 10,
    fontWeight: "700",
    color: realEstateColors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  propertyCardContent: {
    padding: spacing.md,
    paddingTop: spacing.md,
  },
  propertyCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  propertyCardAddress: {
    fontSize: 13,
    color: realEstateColors.gray[600],
    flex: 1,
    lineHeight: 18,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  sellerIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  sellerName: {
    fontSize: 13,
    color: realEstateColors.gray[700],
    fontWeight: "600",
    flex: 1,
  },
  actionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: realEstateColors.primary[600],
    letterSpacing: 0.3,
  },
});
