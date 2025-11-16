import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "@/components/ui/Header";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import { IconSymbol } from "@/components/IconSymbol";
import { CustomButton } from "@/components/ui/CustomButton";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";

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

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([
    {
      id: "1",
      title: "Modern Villa",
      price: "$850,000",
      location: "Beverly Hills, CA",
      bedrooms: 4,
      bathrooms: 3,
      area: "2,500 sq ft",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
      isFavorite: true,
    },
    {
      id: "2",
      title: "Downtown Apartment",
      price: "$450,000",
      location: "Manhattan, NY",
      bedrooms: 2,
      bathrooms: 2,
      area: "1,200 sq ft",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      isFavorite: true,
    },
    {
      id: "3",
      title: "Cozy Cottage",
      price: "$320,000",
      location: "Portland, OR",
      bedrooms: 3,
      bathrooms: 2,
      area: "1,800 sq ft",
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      isFavorite: true,
    },
  ]);

  // Animation for stats card
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-20))[0];

  useEffect(() => {
    if (favoriteProperties.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [favoriteProperties.length]);

  const toggleFavorite = (propertyId: string) => {
    console.log("Toggling favorite for property:", propertyId);
    setFavoriteProperties((prev) =>
      prev.filter((property) => property.id !== propertyId)
    );
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <Pressable
      onPress={() => router.push(`/(tabs)/property-details?id=${item.id}`)}
      style={({ pressed }) => [
        { opacity: pressed ? 0.95 : 1 },
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <Card style={styles.propertyCard} variant="elevated">
        <View style={styles.propertyContent}>
          <Image source={{ uri: item.image }} style={styles.propertyImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.imageGradient}
          />
          <Pressable
            style={({ pressed }) => [
              styles.favoriteButton,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <IconSymbol name="heart.fill" size={24} color="#EF4444" />
          </Pressable>
          <View style={styles.imageOverlay}>
            <View style={styles.priceBadge}>
              <Text style={styles.propertyPrice}>{item.price}</Text>
            </View>
          </View>
        </View>
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyTitle}>{item.title}</Text>
          <View style={styles.locationRow}>
            <IconSymbol
              name="mappin.and.ellipse"
              size={14}
              color={realEstateColors.gray[400]}
            />
            <Text style={styles.propertyLocation}>{item.location}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.propertyFeatures}>
            <View style={styles.feature}>
              <IconSymbol
                name="bed.double"
                size={20}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.featureText}>{item.bedrooms} beds</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol
                name="drop"
                size={20}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.featureText}>{item.bathrooms} baths</Text>
            </View>
            <View style={styles.feature}>
              <IconSymbol
                name="square.grid.3x3"
                size={20}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.featureText}>{item.area}</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <IconSymbol
          name="heart"
          size={80}
          color={realEstateColors.primary[200]}
        />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyDescription}>
        Start exploring properties and tap the heart icon to save your favorites
        here!
      </Text>
      <CustomButton
        title="Explore Properties"
        onPress={() => router.push("/(tabs)/search")}
        style={styles.exploreButton}
      />
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Header title="Favorites" />

      {favoriteProperties.length > 0 ? (
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.statsCardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[realEstateColors.primary[50], realEstateColors.white]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol
                    name="heart.fill"
                    size={18}
                    color={realEstateColors.primary[600]}
                  />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>
                  {favoriteProperties.length}
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  Saved
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol
                    name="dollarsign.circle.fill"
                    size={18}
                    color={realEstateColors.primary[600]}
                  />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>
                  $
                  {(
                    favoriteProperties.reduce(
                      (sum, p) =>
                        sum + parseInt(p.price.replace(/[^0-9]/g, "")),
                      0
                    ) / 1000
                  ).toFixed(0)}
                  K
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  Total Value
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <IconSymbol
                    name="creditcard.fill"
                    size={18}
                    color={realEstateColors.primary[600]}
                  />
                </View>
                <Text style={styles.statValue} numberOfLines={1}>
                  $
                  {(
                    favoriteProperties.reduce(
                      (sum, p) =>
                        sum + parseInt(p.price.replace(/[^0-9]/g, "")),
                      0
                    ) /
                    favoriteProperties.length /
                    1000
                  ).toFixed(0)}
                  K
                </Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  Avg. Price
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          <FlatList
            data={favoriteProperties}
            renderItem={renderProperty}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        renderEmptyState()
      )}
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
  },
  statsCardWrapper: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: spacing.lg + spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: realEstateColors.primary[100],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    height: 145,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: realEstateColors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    shadowColor: realEstateColors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: realEstateColors.primary[700],
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: realEstateColors.gray[700],
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 13,
    maxWidth: "100%",
  },
  statDivider: {
    width: 1.5,
    height: "70%",
    backgroundColor: realEstateColors.primary[200],
    marginHorizontal: spacing.sm,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    marginBottom: spacing.lg,
    overflow: "hidden",
    borderRadius: 24,
  },
  propertyContent: {
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: 220,
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  imageOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  priceBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  propertyDetails: {
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
    marginBottom: spacing.md,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.primary[600],
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[500],
  },
  divider: {
    height: 1,
    backgroundColor: realEstateColors.gray[200],
    marginBottom: spacing.md,
  },
  propertyFeatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: realEstateColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  exploreButton: {
    minWidth: 200,
  },
});
