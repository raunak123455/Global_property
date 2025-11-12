import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  FlatList,
} from "react-native";
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

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  isFavorite: boolean;
}

const mockProperties: Property[] = [
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
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [properties, setProperties] = useState(mockProperties);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { showReminder, dismissReminder } = useKycReminder();

  const categories = ["All", "House", "Apartment", "Villa", "Condo"];

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, user]);

  const toggleFavorite = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === propertyId
          ? { ...property, isFavorite: !property.isFavorite }
          : property
      )
    );
  };

  const renderProperty = ({ item }: { item: Property }) => (
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
                onPress={() => setSelectedCategory(category)}
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
            <Text style={styles.sectionTitle}>Featured Properties</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <FlatList
            data={properties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.propertiesList}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <CustomButton
              title="Buy Property"
              onPress={() => console.log("Buy property")}
              style={styles.actionButton}
              leftIcon={
                <IconSymbol
                  name="house"
                  size={20}
                  color={realEstateColors.white}
                />
              }
            />
            <CustomButton
              title="Rent Property"
              onPress={() => console.log("Rent property")}
              variant="outline"
              style={styles.actionButton}
              leftIcon={
                <IconSymbol
                  name="key"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
              }
            />
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
  },
  categories: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: realEstateColors.white,
    borderWidth: 1,
    borderColor: realEstateColors.gray[200],
  },
  categoryButtonActive: {
    backgroundColor: realEstateColors.primary[600],
    borderColor: realEstateColors.primary[600],
  },
  categoryText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  categoryTextActive: {
    color: realEstateColors.white,
  },
  propertiesContainer: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    color: realEstateColors.primary[600],
    fontWeight: "500",
  },
  propertiesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  propertyCard: {
    width: 280,
    padding: 0,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
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
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
