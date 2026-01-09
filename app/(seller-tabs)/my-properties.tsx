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
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import {
  realEstateColors,
  spacing,
  shadows,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";

export default function MyProperties() {
  const { user } = useUser();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    pendingProperties: 0,
    totalValue: 0,
    totalViews: 0,
    totalInquiries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = async () => {
    if (!user?.token) {
      console.error("No user token available");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log("Fetching properties and stats with token:", user.token);

      // Fetch both properties and stats
      const [propertiesResponse, statsResponse] = await Promise.all([
        propertyAPI.getMyProperties(user.token),
        propertyAPI.getPropertyStats(user.token),
      ]);

      console.log("Properties response:", propertiesResponse);
      console.log("Stats response:", statsResponse);

      // Handle properties response
      if (propertiesResponse && propertiesResponse.properties) {
        setProperties(propertiesResponse.properties);
      } else if (propertiesResponse && Array.isArray(propertiesResponse)) {
        setProperties(propertiesResponse);
      } else {
        console.log("No properties found or invalid response");
        setProperties([]);
      }

      // Handle stats response
      if (statsResponse && typeof statsResponse === "object") {
        setStats(statsResponse);
      } else {
        setStats({
          totalProperties: 0,
          activeProperties: 0,
          soldProperties: 0,
          pendingProperties: 0,
          totalValue: 0,
          totalViews: 0,
          totalInquiries: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load properties");
      setProperties([]);
      setStats({
        totalProperties: 0,
        activeProperties: 0,
        soldProperties: 0,
        pendingProperties: 0,
        totalValue: 0,
        totalViews: 0,
        totalInquiries: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleDeleteProperty = (propertyId: string) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await propertyAPI.deleteProperty(propertyId, user?.token);
              fetchProperties(); // Refresh the list
              Alert.alert("Success", "Property deleted successfully");
            } catch (error) {
              console.error("Error deleting property:", error);
              Alert.alert("Error", "Failed to delete property");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return realEstateColors.green[600];
      case "sold":
        return realEstateColors.blue[600];
      case "pending":
        return realEstateColors.orange[600];
      case "draft":
        return realEstateColors.gray[600];
      default:
        return realEstateColors.gray[600];
    }
  };

  const PropertyCard = ({ property }: { property: any }) => (
    <Card style={styles.propertyCard}>
      <View style={styles.propertyImageContainer}>
        {property.images && property.images.length > 0 ? (
          <Image
            source={{ uri: property.images[0] }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <IconSymbol
              name="photo"
              size={32}
              color={realEstateColors.gray[400]}
            />
          </View>
        )}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(property.status) },
          ]}
        >
          <Text style={styles.statusText}>{property.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.propertyContent}>
        <Text style={styles.propertyTitle} numberOfLines={2}>
          {property.title}
        </Text>
        <Text style={styles.propertyLocation} numberOfLines={1}>
          {property.location.city}, {property.location.state}
        </Text>
        <Text style={styles.propertyPrice}>
          ${property.price.toLocaleString()}
        </Text>
        <View style={styles.propertyDetails}>
          <View style={styles.detailItem}>
            <IconSymbol
              name="bed.double"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.detailItem}>
            <IconSymbol
              name="bathtub"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.detailItem}>
            <IconSymbol
              name="square.grid.3x3"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{property.area} sq ft</Text>
          </View>
        </View>
      </View>

      <View style={styles.propertyActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push(`/(seller-tabs)/edit-property?id=${property._id}`)
          }
        >
          <IconSymbol
            name="pencil"
            size={20}
            color={realEstateColors.primary[600]}
          />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.verifyButton]}
          onPress={() =>
            router.push(
              `/(seller-tabs)/property-documents?propertyId=${property._id}`
            )
          }
        >
          <Ionicons
            name="document-text"
            size={20}
            color={realEstateColors.secondary[600]}
          />
          <Text style={[styles.actionText, styles.verifyText]}>Docs</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProperty(property._id)}
        >
          <IconSymbol
            name="trash"
            size={20}
            color={realEstateColors.red[600]}
          />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Properties</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(seller-tabs)/add-property")}
        >
          <IconSymbol name="plus" size={20} color={realEstateColors.white} />
          <Text style={styles.addButtonText}>Add Property</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Analytics Section */}
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsTitle}>Overview</Text>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, shadows.sm]}>
              <LinearGradient
                colors={[
                  realEstateColors.primary[600],
                  realEstateColors.primary[700],
                ]}
                style={styles.statGradient}
              >
                <FontAwesome5
                  name="building"
                  size={24}
                  color={realEstateColors.white}
                />
                <Text style={styles.statValue}>{stats.totalProperties}</Text>
                <Text style={styles.statLabel}>Total Properties</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statBox, shadows.sm]}>
              <LinearGradient
                colors={[
                  realEstateColors.green[500],
                  realEstateColors.green[600],
                ]}
                style={styles.statGradient}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={realEstateColors.white}
                />
                <Text style={styles.statValue}>{stats.activeProperties}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statBox, shadows.sm]}>
              <LinearGradient
                colors={[
                  realEstateColors.blue[500],
                  realEstateColors.blue[600],
                ]}
                style={styles.statGradient}
              >
                <MaterialIcons
                  name="verified"
                  size={24}
                  color={realEstateColors.white}
                />
                <Text style={styles.statValue}>{stats.soldProperties}</Text>
                <Text style={styles.statLabel}>Sold</Text>
              </LinearGradient>
            </View>

            <View style={[styles.statBox, shadows.sm]}>
              <LinearGradient
                colors={[
                  realEstateColors.orange[500],
                  realEstateColors.orange[600],
                ]}
                style={styles.statGradient}
              >
                <MaterialIcons
                  name="access-time"
                  size={24}
                  color={realEstateColors.white}
                />
                <Text style={styles.statValue}>{stats.pendingProperties}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Value and Engagement Stats */}
          <View style={styles.additionalStats}>
            <View style={[styles.valueBox, shadows.sm]}>
              <View style={styles.valueBoxContent}>
                <FontAwesome5
                  name="dollar-sign"
                  size={20}
                  color={realEstateColors.green[600]}
                />
                <View style={styles.valueTextContainer}>
                  <Text style={styles.valueLabel}>Total Value</Text>
                  <Text style={styles.valueAmount}>
                    ${stats.totalValue.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.engagementRow}>
              <View style={[styles.engagementBox, shadows.sm]}>
                <Ionicons
                  name="eye"
                  size={20}
                  color={realEstateColors.secondary[600]}
                />
                <Text style={styles.engagementValue}>{stats.totalViews}</Text>
                <Text style={styles.engagementLabel}>Views</Text>
              </View>

              <View style={[styles.engagementBox, shadows.sm]}>
                <Ionicons
                  name="chatbubbles"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
                <Text style={styles.engagementValue}>
                  {stats.totalInquiries}
                </Text>
                <Text style={styles.engagementLabel}>Inquiries</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Properties List */}
        {properties.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <IconSymbol
                name="building.2"
                size={64}
                color={realEstateColors.primary[600]}
              />
            </View>
            <Text style={styles.emptyTitle}>No Properties Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first property listing
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push("/(seller-tabs)/add-property")}
            >
              <LinearGradient
                colors={[
                  realEstateColors.primary[600],
                  realEstateColors.primary[700],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <IconSymbol
                  name="plus.circle.fill"
                  size={22}
                  color={realEstateColors.white}
                />
                <Text style={styles.emptyButtonText}>
                  Add Your First Property
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <View style={styles.propertiesList}>
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: realEstateColors.white,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: realEstateColors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  addButtonText: {
    color: realEstateColors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  propertiesList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  propertyImageContainer: {
    position: "relative",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: realEstateColors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    color: realEstateColors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  propertyContent: {
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.primary[600],
    marginBottom: spacing.sm,
  },
  propertyDetails: {
    flexDirection: "row",
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  propertyActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: realEstateColors.primary[600],
    backgroundColor: realEstateColors.white,
    minHeight: 50,
  },
  verifyButton: {
    borderColor: realEstateColors.secondary[600],
  },
  deleteButton: {
    borderColor: realEstateColors.red[600],
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: realEstateColors.primary[600],
    marginTop: 4,
  },
  verifyText: {
    color: realEstateColors.secondary[600],
  },
  deleteText: {
    color: realEstateColors.red[600],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: realEstateColors.gray[600],
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: realEstateColors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  emptyButtonText: {
    color: realEstateColors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  // Analytics Section Styles
  analyticsSection: {
    padding: spacing.lg,
    backgroundColor: realEstateColors.gray[50],
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 12,
    overflow: "hidden",
  },
  statGradient: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 110,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: realEstateColors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
  },
  additionalStats: {
    gap: spacing.sm,
  },
  valueBox: {
    backgroundColor: realEstateColors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  valueBoxContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  valueAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.green[600],
  },
  engagementRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  engagementBox: {
    flex: 1,
    backgroundColor: realEstateColors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  engagementLabel: {
    fontSize: 12,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
});
