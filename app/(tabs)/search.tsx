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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { CustomButton } from "@/components/ui/CustomButton";
import { Header } from "@/components/ui/Header";
import { IconSymbol } from "@/components/IconSymbol";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useRouter } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";
import { transformProperties, FrontendProperty } from "@/utils/propertyUtils";

const mockSearchResults: FrontendProperty[] = [
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

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [backendProperties, setBackendProperties] = useState<FrontendProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Combine mock properties with backend properties
  const allProperties = [...mockSearchResults, ...backendProperties];

  const filters = [
    { id: "house", label: "House", icon: "house" },
    { id: "apartment", label: "Apartment", icon: "building.2" },
    { id: "villa", label: "Villa", icon: "house.lodge" },
    { id: "condo", label: "Condo", icon: "building" },
  ];

  const priceRanges = [
    { id: "under-300k", label: "Under $300K" },
    { id: "300k-500k", label: "$300K - $500K" },
    { id: "500k-800k", label: "$500K - $800K" },
    { id: "over-800k", label: "Over $800K" },
  ];

  // Fetch properties from backend (fetch once on mount)
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.token) {
        setPropertiesLoading(false);
        return;
      }

      try {
        setPropertiesLoading(true);
        const response = await propertyAPI.getAllProperties(user.token, {
          limit: 200, // Fetch more properties for search
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
        setBackendProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    };

    if (user?.token) {
      fetchProperties();
    }
  }, [user?.token, user?._id]);

  // Filter properties based on search query and selected filters (local filtering)
  const getFilteredProperties = () => {
    let filtered = [...allProperties];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(query) ||
          property.location.toLowerCase().includes(query) ||
          property.type.toLowerCase().includes(query)
      );
    }

    // Apply property type filters
    const typeFilters = selectedFilters.filter((f) =>
      ["house", "apartment", "villa", "condo"].includes(f)
    );
    if (typeFilters.length > 0) {
      filtered = filtered.filter((property) =>
        typeFilters.some((f) => property.type.toLowerCase() === f)
      );
    }

    // Apply price range filters
    const priceFilters = selectedFilters.filter((f) =>
      ["under-300k", "300k-500k", "500k-800k", "over-800k"].includes(f)
    );
    if (priceFilters.length > 0) {
      filtered = filtered.filter((property) => {
        const price = parseInt(property.price.replace(/[$,]/g, ""));
        return priceFilters.some((filter) => {
          switch (filter) {
            case "under-300k":
              return price < 300000;
            case "300k-500k":
              return price >= 300000 && price < 500000;
            case "500k-800k":
              return price >= 500000 && price < 800000;
            case "over-800k":
              return price >= 800000;
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  };

  const properties = getFilteredProperties();

  const toggleFavorite = (propertyId: string) => {
    // Note: In a real app, this would update the backend
    // For now, we'll just show the visual feedback
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const renderProperty = ({ item }: { item: FrontendProperty }) => (
    <Pressable
      onPress={() => router.push(`/(tabs)/property-details?id=${item.id}`)}
    >
      <Card style={styles.propertyCard} variant="elevated">
        <View style={styles.propertyContent}>
          <Image source={{ uri: item.image }} style={styles.propertyImage} />

          <View style={styles.propertyInfo}>
            <View style={styles.propertyHeader}>
              <View style={styles.propertyTitleContainer}>
                <Text style={styles.propertyTitle}>{item.title}</Text>
                <Text style={styles.propertyLocation}>{item.location}</Text>
              </View>
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
                      : realEstateColors.gray[400]
                  }
                />
              </Pressable>
            </View>

            <Text style={styles.propertyPrice}>{item.price}</Text>

            <View style={styles.propertyDetails}>
              <View style={styles.detailItem}>
                <IconSymbol
                  name="bed.double"
                  size={16}
                  color={realEstateColors.gray[500]}
                />
                <Text style={styles.detailText}>{item.bedrooms} beds</Text>
              </View>
              <View style={styles.detailItem}>
                <IconSymbol
                  name="drop"
                  size={16}
                  color={realEstateColors.gray[500]}
                />
                <Text style={styles.detailText}>{item.bathrooms} baths</Text>
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
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Header title="Search Properties" />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location, property type..."
            placeholderTextColor={realEstateColors.gray[500]}
            variant="light"
            isFocused={isSearchFocused}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            leftIcon={
              <IconSymbol
                name="magnifyingglass"
                size={22}
                color={realEstateColors.gray[600]}
              />
            }
            rightIcon={
              <Pressable
                onPress={() => setShowFilters(!showFilters)}
                style={styles.filterIconButton}
              >
                <IconSymbol
                  name="slider.horizontal.3"
                  size={22}
                  color={realEstateColors.primary[600]}
                />
              </Pressable>
            }
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Filters */}
        {showFilters && (
          <Card style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>Property Type</Text>
            <View style={styles.filterButtons}>
              {filters.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    selectedFilters.includes(filter.id) &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <IconSymbol
                    name={filter.icon as any}
                    size={20}
                    color={
                      selectedFilters.includes(filter.id)
                        ? realEstateColors.white
                        : realEstateColors.gray[600]
                    }
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilters.includes(filter.id) &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filtersTitle}>Price Range</Text>
            <View style={styles.priceRanges}>
              {priceRanges.map((range) => (
                <Pressable
                  key={range.id}
                  style={[
                    styles.priceRangeButton,
                    selectedFilters.includes(range.id) &&
                      styles.priceRangeButtonActive,
                  ]}
                  onPress={() => toggleFilter(range.id)}
                >
                  <Text
                    style={[
                      styles.priceRangeText,
                      selectedFilters.includes(range.id) &&
                        styles.priceRangeTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.filterActions}>
              <CustomButton
                title="Clear All"
                onPress={() => setSelectedFilters([])}
                variant="outline"
                style={styles.filterActionButton}
              />
              <CustomButton
                title="Apply Filters"
                onPress={() => setShowFilters(false)}
                style={styles.filterActionButton}
              />
            </View>
          </Card>
        )}

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {properties.length} properties found
          </Text>
          <Pressable style={styles.sortButton}>
            <Text style={styles.sortText}>Sort by</Text>
            <IconSymbol
              name="chevron.down"
              size={16}
              color={realEstateColors.gray[600]}
            />
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
        ) : properties.length > 0 ? (
          <FlatList
            data={properties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.propertiesList}
          />
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol
              name="magnifyingglass"
              size={64}
              color={realEstateColors.gray[400]}
            />
            <Text style={styles.emptyStateTitle}>No properties found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters to find more properties
            </Text>
            {(searchQuery || selectedFilters.length > 0) && (
              <CustomButton
                title="Clear Filters"
                onPress={() => {
                  setSearchQuery("");
                  setSelectedFilters([]);
                }}
                variant="outline"
                style={styles.clearFiltersButton}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterIconButton: {
    padding: spacing.xs,
    marginRight: -spacing.xs,
  },
  filtersCard: {
    marginBottom: spacing.md,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: realEstateColors.gray[100],
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: realEstateColors.primary[600],
  },
  filterButtonText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: realEstateColors.white,
  },
  priceRanges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priceRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
  },
  priceRangeButtonActive: {
    backgroundColor: realEstateColors.primary[600],
    borderColor: realEstateColors.primary[600],
  },
  priceRangeText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  priceRangeTextActive: {
    color: realEstateColors.white,
  },
  filterActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterActionButton: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sortText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  propertiesList: {
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: "hidden",
  },
  propertyContent: {
    flexDirection: "row",
  },
  propertyImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  propertyInfo: {
    flex: 1,
    padding: spacing.md,
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  propertyTitleContainer: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: 12,
    color: realEstateColors.gray[600],
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  propertyPrice: {
    fontSize: 18,
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
    fontSize: 12,
    color: realEstateColors.gray[600],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginTop: spacing.lg,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginTop: spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  clearFiltersButton: {
    marginTop: spacing.lg,
    minWidth: 150,
  },
});
