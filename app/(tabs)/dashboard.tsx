import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { CustomButton } from "@/components/ui/CustomButton";
import { IconSymbol } from "@/components/IconSymbol";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { KycWarningBanner } from "@/components/KycWarningBanner";
import { useKycReminder } from "@/hooks/useKycReminder";
import { propertyAPI } from "@/utils/api";
import { transformProperties, FrontendProperty } from "@/utils/propertyUtils";

const mockProperties: FrontendProperty[] = [
  {
    id: "1",
    title: "Modern Villa",
    price: "$850,000",
    location: "Beverly Hills, CA",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,500 sq ft",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    isFavorite: false,
    type: "Villa",
  },
  {
    id: "2",
    title: "Luxury Apartment",
    price: "$650,000",
    location: "Manhattan, NY",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,800 sq ft",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400",
    isFavorite: true,
    type: "Apartment",
  },
  {
    id: "3",
    title: "Cozy House",
    price: "$450,000",
    location: "Austin, TX",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,600 sq ft",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400",
    isFavorite: false,
    type: "House",
  },
  {
    id: "4",
    title: "Downtown Condo",
    price: "$520,000",
    location: "Seattle, WA",
    bedrooms: 2,
    bathrooms: 1,
    area: "1,200 sq ft",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    isFavorite: false,
    type: "Condo",
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [backendProperties, setBackendProperties] = useState<FrontendProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { showReminder, dismissReminder } = useKycReminder();

  const categories = ["All", "House", "Apartment", "Villa", "Condo"];

  // Combine mock properties with backend properties
  const allProperties = [...mockProperties, ...backendProperties];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [userLoading, user]);

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.token) {
        setPropertiesLoading(false);
        return;
      }

      try {
        setPropertiesLoading(true);
        const response = await propertyAPI.getAllProperties(user.token, {
          limit: 100, // Fetch more properties for featured section
        });

        if (response && response.properties) {
          const transformedProperties = transformProperties(
            response.properties,
            user._id
          );
          setBackendProperties(transformedProperties);
        } else {
          setBackendProperties([]);
        }
      } catch (error: any) {
        console.error("Error fetching properties:", error);
        // Don't show alert for network errors, just log and use empty array
        setBackendProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    };

    if (user?.token) {
      fetchProperties();
    }
  }, [user?.token, user?._id]);

  // Filter properties based on selected category
  const filteredProperties =
    selectedCategory === "All"
      ? allProperties
      : allProperties.filter(
          (property) =>
            property.type.toLowerCase() === selectedCategory.toLowerCase()
        );

  const toggleFavorite = (propertyId: string) => {
    // Note: In a real app, this would update the backend
    // For now, we'll just show the visual feedback
  };

  const renderProperty = ({ item }: { item: FrontendProperty }) => (
    <Pressable
      onPress={() => router.push(`/(tabs)/property-details?id=${item.id}`)}
    >
      <Card style={styles.propertyCard} variant="elevated">
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.propertyImage} />
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <IconSymbol
              name={item.isFavorite ? "heart.fill" : "heart"}
              size={20}
              color={
                item.isFavorite
                  ? realEstateColors.error
                  : realEstateColors.white
              }
            />
          </Pressable>
        </View>

        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{item.title}</Text>
          <Text style={styles.propertyPrice}>{item.price}</Text>
          <Text style={styles.propertyLocation}>{item.location}</Text>

          <View style={styles.propertyDetails}>
            <View style={styles.detailItem}>
              <IconSymbol
                name="bed.double"
                size={16}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.detailText}>{item.bedrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <IconSymbol
                name="drop"
                size={16}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.detailText}>{item.bathrooms}</Text>
            </View>
            <View style={styles.detailItem}>
              <IconSymbol
                name="square"
                size={16}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.detailText}>{item.area}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* KYC Warning Banner - Positioned on top */}
      {showReminder && <KycWarningBanner onDismiss={dismissReminder} />}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : "Guest"}
            </Text>
          </View>
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <IconSymbol
              name="person.circle"
              size={40}
              color={realEstateColors.primary[600]}
            />
          </Pressable>
        </View>

        {/* Search Bar */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
        >
          <IconSymbol
            name="magnifyingglass"
            size={20}
            color={realEstateColors.gray[400]}
          />
          <Text style={styles.searchPlaceholder}>Search properties...</Text>
          <IconSymbol
            name="slider.horizontal.3"
            size={20}
            color={realEstateColors.gray[400]}
          />
        </Pressable>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>1,234</Text>
            <Text style={styles.statLabel}>Properties</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>56</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Viewed</Text>
          </Card>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => {
                  console.log("Category selected:", category);
                  setSelectedCategory(category);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Properties */}
        <View style={styles.propertiesContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.featuredTitle}>Featured Properties</Text>
              {selectedCategory !== "All" && (
                <Text style={styles.categoryIndicator}>
                  Showing: {selectedCategory}
                </Text>
              )}
            </View>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          {propertiesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={realEstateColors.primary[600]}
              />
              <Text style={styles.loadingText}>Loading properties...</Text>
            </View>
          ) : filteredProperties.length > 0 ? (
            <FlatList
              data={filteredProperties}
              renderItem={renderProperty}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propertiesList}
              snapToInterval={300 + spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <IconSymbol
                  name="house"
                  size={48}
                  color={realEstateColors.gray[400]}
                />
              </View>
              <Text style={styles.emptyStateText}>
                No {selectedCategory.toLowerCase()} properties found
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try selecting a different category
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {/* Buy Property */}
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push("/(tabs)/search")}
            >
              <ExpoLinearGradient
                colors={[
                  realEstateColors.primary[600],
                  realEstateColors.primary[700],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <IconSymbol
                    name="house.fill"
                    size={28}
                    color={realEstateColors.white}
                  />
                </View>
                <Text style={styles.actionTitle}>Buy Property</Text>
                <Text style={styles.actionDescription}>
                  Explore properties for sale
                </Text>
              </ExpoLinearGradient>
            </Pressable>

            {/* Rent Property */}
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push("/(tabs)/search")}
            >
              <ExpoLinearGradient
                colors={[
                  realEstateColors.blue[600],
                  realEstateColors.blue[700],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <IconSymbol
                    name="doc.text.fill"
                    size={28}
                    color={realEstateColors.white}
                  />
                </View>
                <Text style={styles.actionTitle}>Rent Property</Text>
                <Text style={styles.actionDescription}>
                  Find rental properties
                </Text>
              </ExpoLinearGradient>
            </Pressable>

            {/* Mortgage Calculator */}
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push("/mortgage-calculator")}
            >
              <ExpoLinearGradient
                colors={[
                  realEstateColors.purple[600],
                  realEstateColors.purple[700],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <IconSymbol
                    name="dollarsign.circle.fill"
                    size={28}
                    color={realEstateColors.white}
                  />
                </View>
                <Text style={styles.actionTitle}>Calculator</Text>
                <Text style={styles.actionDescription}>
                  Estimate mortgage payments
                </Text>
              </ExpoLinearGradient>
            </Pressable>

            {/* Partner Banks */}
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push("/partner-banks")}
            >
              <ExpoLinearGradient
                colors={[
                  realEstateColors.green[600],
                  realEstateColors.green[700],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <View style={styles.actionIconContainer}>
                  <IconSymbol
                    name="creditcard.fill"
                    size={28}
                    color={realEstateColors.white}
                  />
                </View>
                <Text style={styles.actionTitle}>Partner Banks</Text>
                <Text style={styles.actionDescription}>
                  Explore financing options
                </Text>
              </ExpoLinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: realEstateColors.gray[600],
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
  },
  profileButton: {
    padding: spacing.xs,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: realEstateColors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: realEstateColors.gray[200],
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: realEstateColors.gray[400],
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.primary[600],
  },
  statLabel: {
    fontSize: 12,
    color: realEstateColors.gray[600],
    marginTop: spacing.xs,
  },
  categoriesContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textAlign: "left",
  },
  categories: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: realEstateColors.white,
    borderWidth: 1.5,
    borderColor: realEstateColors.gray[300],
    minWidth: 90,
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: realEstateColors.primary[600],
    borderColor: realEstateColors.primary[600],
    shadowColor: realEstateColors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 15,
    color: realEstateColors.gray[700],
    fontWeight: "600",
  },
  categoryTextActive: {
    color: realEstateColors.white,
    fontWeight: "700",
  },
  propertiesContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    textAlign: "left",
  },
  categoryIndicator: {
    fontSize: 13,
    color: realEstateColors.primary[600],
    fontWeight: "500",
    marginTop: spacing.xs,
    textAlign: "left",
  },
  seeAllText: {
    fontSize: 14,
    color: realEstateColors.primary[600],
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  propertiesList: {
    paddingLeft: spacing.lg,
    gap: spacing.md,
  },
  propertyCard: {
    width: 300,
    padding: 0,
    overflow: "hidden",
    marginRight: spacing.md,
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  propertyInfo: {
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.primary[600],
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[600],
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
    fontSize: 12,
    color: realEstateColors.gray[600],
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl * 1.5,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: realEstateColors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: realEstateColors.gray[200],
    borderStyle: "dashed",
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: realEstateColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "600",
    color: realEstateColors.gray[800],
    marginTop: spacing.lg,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: realEstateColors.gray[500],
    marginTop: spacing.sm,
    textAlign: "center",
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  actionGradient: {
    padding: spacing.lg,
    minHeight: 140,
    justifyContent: "space-between",
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 16,
  },
});
