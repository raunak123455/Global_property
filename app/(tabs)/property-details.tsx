import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import { CustomButton } from "@/components/ui/CustomButton";
import { GradientButton } from "@/components/ui/GradientButton";
import { Header } from "@/components/ui/Header";
import { IconSymbol } from "@/components/IconSymbol";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { KycWarningBanner } from "@/components/KycWarningBanner";
import { propertyAPI } from "@/utils/api";
import { transformProperty, BackendProperty } from "@/utils/propertyUtils";

const { width } = Dimensions.get("window");

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
  type: string;
  description: string;
  features: string[];
  isTokenized?: boolean;
  totalTokens?: number;
  tokensSold?: number;
  tokenPrice?: number;
}

const mockProperties: { [key: string]: Property } = {
  "1": {
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
    description:
      "Beautiful modern villa located in the heart of Beverly Hills. This stunning property features 4 spacious bedrooms, 3 luxurious bathrooms, and a gorgeous open-concept living area with floor-to-ceiling windows that offer breathtaking views of the surrounding landscape.",
    features: [
      "Swimming Pool",
      "Garden",
      "Garage",
      "Fireplace",
      "Balcony",
      "Smart Home System",
      "Gym",
      "Security System",
    ],
    isTokenized: true,
    totalTokens: 10,
    tokensSold: 0,
    tokenPrice: 85000,
  },
  "2": {
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
    description:
      "Stunning luxury apartment in the heart of Manhattan. This contemporary residence offers 2 spacious bedrooms, 2 modern bathrooms, and an open-plan living space with panoramic city views. Features premium finishes throughout and access to world-class building amenities.",
    features: [
      "Concierge Service",
      "Gym",
      "Rooftop Terrace",
      "Central Air",
      "Hardwood Floors",
      "City Views",
      "Modern Kitchen",
      "Walk-in Closets",
    ],
    isTokenized: true,
    totalTokens: 10,
    tokensSold: 0,
    tokenPrice: 65000,
  },
  "3": {
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
    description:
      "Charming family home in a desirable Austin neighborhood. This well-maintained property features 3 comfortable bedrooms, 2 updated bathrooms, and a spacious backyard perfect for entertaining. Excellent schools nearby and close to downtown amenities.",
    features: [
      "Large Backyard",
      "Updated Kitchen",
      "Hardwood Floors",
      "Two-Car Garage",
      "Covered Patio",
      "Energy Efficient",
      "Storage Shed",
      "Sprinkler System",
    ],
    isTokenized: true,
    totalTokens: 10,
    tokensSold: 0,
    tokenPrice: 45000,
  },
  "4": {
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
    description:
      "Modern condo in the vibrant heart of downtown Seattle. This stylish unit features 2 bedrooms, 1 updated bathroom, and floor-to-ceiling windows with stunning water views. Walking distance to restaurants, shops, and public transit.",
    features: [
      "Water Views",
      "Modern Appliances",
      "In-Unit Laundry",
      "Secure Parking",
      "Storage Unit",
      "Pet Friendly",
      "Balcony",
      "Bike Storage",
    ],
    isTokenized: true,
    totalTokens: 10,
    tokensSold: 0,
    tokenPrice: 52000,
  },
};

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id as string;
  const { user } = useUser();
  const [showKycBanner, setShowKycBanner] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Check if property ID is in mock properties (1-4)
  const isMockProperty = mockProperties.hasOwnProperty(propertyId);

  useEffect(() => {
    const fetchProperty = async () => {
      // If it's a mock property, use mock data
      if (isMockProperty) {
        setProperty(mockProperties[propertyId]);
        setLoading(false);
        return;
      }

      // For backend properties, fetch from API
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch the property directly from the backend
        const foundProperty = await propertyAPI.getProperty(
          propertyId,
          user.token
        );

        if (foundProperty) {
          // Transform backend property to frontend format
          const transformedProperty = transformProperty(
            foundProperty as BackendProperty,
            user._id
          );

          // Convert to Property format with description and features
          const backendProp = foundProperty as any;
          const priceNumber = parseFloat(backendProp.price);
          const totalTokens = backendProp.totalTokens;

          // Calculate token price if tokenized
          let tokenPrice = backendProp.tokenPrice;
          if (backendProp.isTokenized && totalTokens && !tokenPrice) {
            tokenPrice = priceNumber / totalTokens;
          }

          const propertyData: Property = {
            id: transformedProperty.id,
            title: transformedProperty.title,
            price: transformedProperty.price,
            location: transformedProperty.location,
            bedrooms: transformedProperty.bedrooms,
            bathrooms: transformedProperty.bathrooms,
            area: transformedProperty.area,
            image: transformedProperty.image,
            isFavorite: transformedProperty.isFavorite,
            type: transformedProperty.type,
            description:
              backendProp.description ||
              "No description available for this property.",
            features: backendProp.features || [],
            isTokenized: backendProp.isTokenized || false,
            totalTokens: backendProp.totalTokens || undefined,
            tokensSold: backendProp.tokensSold || 0,
            tokenPrice: tokenPrice || undefined,
          };
          setProperty(propertyData);
        } else {
          // Property not found, show error or fallback
          Alert.alert("Error", "Property not found");
          router.back();
        }
      } catch (error: any) {
        console.error("Error fetching property:", error);
        Alert.alert("Error", "Failed to load property details");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, user?.token, user?._id, isMockProperty]);

  // Show loading state
  if (loading || !property) {
    return (
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Header showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={realEstateColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleBuyPress = () => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to purchase properties.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }

    // Check if user has completed KYC verification
    if (!user.kycVerified) {
      // Show KYC verification banner
      setShowKycBanner(true);
      return;
    }

    // Navigate to mortgage calculator with property details
    const priceNumber = parseFloat(property.price.replace(/[$,]/g, ""));
    router.push({
      pathname: "/mortgage-calculator",
      params: {
        price: priceNumber.toString(),
        title: property.title,
        location: property.location,
        id: propertyId,
      },
    });
  };

  const handleEnquirePress = () => {
    console.log("Enquire button pressed for property:", propertyId);
    // Implement enquire functionality
  };

  const handleBuyTokensPress = () => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to purchase fractional ownership.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/(auth)/login") },
        ]
      );
      return;
    }

    // Check if user has completed KYC verification
    if (!user.kycVerified) {
      setShowKycBanner(true);
      return;
    }

    // Show token purchase modal
    setShowTokenModal(true);
  };

  const toggleFavorite = () => {
    console.log("Toggle favorite for property:", propertyId);
    // Implement favorite toggle functionality
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* KYC Warning Banner - Shows when Buy Now is clicked without KYC */}
      {showKycBanner && (
        <KycWarningBanner onDismiss={() => setShowKycBanner(false)} />
      )}

      <Header
        showBackButton={true}
        rightComponent={
          <Pressable onPress={toggleFavorite} style={styles.headerButton}>
            <IconSymbol
              name={property.isFavorite ? "heart.fill" : "heart"}
              size={24}
              color={
                property.isFavorite
                  ? realEstateColors.error
                  : realEstateColors.gray[900]
              }
            />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.image }}
            style={styles.propertyImage}
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.propertyPrice}>{property.price}</Text>
          </View>
        </View>

        {/* Property Info */}
        <View style={styles.propertyInfo}>
          <View style={styles.propertyHeader}>
            <View style={styles.propertyTitleContainer}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyType}>{property.type}</Text>
            </View>
          </View>

          <View style={styles.propertyLocationContainer}>
            <IconSymbol
              name="location"
              size={16}
              color={realEstateColors.gray[500]}
            />
            <Text style={styles.propertyLocation}>{property.location}</Text>
          </View>

          <View style={styles.propertyDetails}>
            <View style={styles.detailItem}>
              <IconSymbol
                name="bed.double"
                size={20}
                color={realEstateColors.gray[700]}
              />
              <Text style={styles.detailValue}>{property.bedrooms}</Text>
              <Text style={styles.detailLabel}>Bedrooms</Text>
            </View>

            <View style={styles.detailItem}>
              <IconSymbol
                name="drop"
                size={20}
                color={realEstateColors.gray[700]}
              />
              <Text style={styles.detailValue}>{property.bathrooms}</Text>
              <Text style={styles.detailLabel}>Bathrooms</Text>
            </View>

            <View style={styles.detailItem}>
              <IconSymbol
                name="square"
                size={20}
                color={realEstateColors.gray[700]}
              />
              <Text style={styles.detailValue}>{property.area}</Text>
              <Text style={styles.detailLabel}>Area</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {property.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tokenization Information */}
        {property.isTokenized && property.totalTokens && (
          <View style={styles.section}>
            <View style={styles.tokenizationHeader}>
              <IconSymbol
                name="creditcard.fill"
                size={24}
                color={realEstateColors.primary[600]}
              />
              <Text style={styles.sectionTitle}>
                Fractional Ownership Available
              </Text>
            </View>
            <View style={styles.tokenizationInfo}>
              <View style={styles.tokenizationRow}>
                <Text style={styles.tokenizationLabel}>Total Tokens:</Text>
                <Text style={styles.tokenizationValue}>
                  {property.totalTokens.toLocaleString()}
                </Text>
              </View>
              <View style={styles.tokenizationRow}>
                <Text style={styles.tokenizationLabel}>Tokens Available:</Text>
                <Text style={styles.tokenizationValue}>
                  {(
                    (property.totalTokens || 0) - (property.tokensSold || 0)
                  ).toLocaleString()}
                </Text>
              </View>
              {property.tokenPrice && (
                <View style={styles.tokenizationRow}>
                  <Text style={styles.tokenizationLabel}>Price per Token:</Text>
                  <Text style={styles.tokenizationPrice}>
                    ${property.tokenPrice.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.tokenizationBadge}>
                <IconSymbol
                  name="info.circle"
                  size={16}
                  color={realEstateColors.primary[600]}
                />
                <Text style={styles.tokenizationBadgeText}>
                  Invest in this property with fractional ownership starting
                  from a lower entry point
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {property.isTokenized ? (
            <View style={styles.tokenizedButtonContainer}>
              <CustomButton
                title="Enquire"
                onPress={handleEnquirePress}
                variant="outline"
                style={styles.enquireButtonFull}
              />
              <GradientButton
                title="Purchase Fractional Ownership"
                onPress={handleBuyTokensPress}
                style={styles.fractionalButton}
              />
            </View>
          ) : (
            <View style={styles.regularButtonContainer}>
              <CustomButton
                title="Enquire"
                onPress={handleEnquirePress}
                variant="outline"
                style={styles.enquireButton}
              />
              <GradientButton
                title="Buy Now"
                onPress={handleBuyPress}
                style={styles.buyButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Token Purchase Modal */}
      <Modal
        visible={showTokenModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTokenModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowTokenModal(false)}
        >
          <Pressable
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <IconSymbol
                    name="creditcard.fill"
                    size={32}
                    color={realEstateColors.primary[600]}
                  />
                </View>
                <Text style={styles.modalTitle}>
                  Purchase Fractional Ownership
                </Text>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setShowTokenModal(false)}
                >
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={24}
                    color={realEstateColors.gray[400]}
                  />
                </Pressable>
              </View>

              <Text style={styles.modalDescription}>
                This property is available for fractional ownership. Invest in
                real estate with a lower entry point by purchasing tokens.
              </Text>

              <View style={styles.modalInfoCard}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Price per Token</Text>
                  <Text style={styles.modalInfoValue}>
                    ${property.tokenPrice?.toFixed(2) || "0.00"}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Tokens Available</Text>
                  <Text style={styles.modalInfoValue}>
                    {(
                      (property.totalTokens || 0) - (property.tokensSold || 0)
                    ).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>
                    Total Property Value
                  </Text>
                  <Text style={styles.modalInfoValue}>{property.price}</Text>
                </View>
              </View>

              <View style={styles.modalButtonContainer}>
                <CustomButton
                  title="Cancel"
                  onPress={() => setShowTokenModal(false)}
                  variant="outline"
                  style={styles.modalCancelButton}
                />
                <GradientButton
                  title="Continue to Purchase"
                  onPress={() => {
                    setShowTokenModal(false);
                    const priceNumber = parseFloat(
                      property.price.replace(/[$,]/g, "")
                    );
                    router.push({
                      pathname: "/token-purchase",
                      params: {
                        id: propertyId,
                        title: property.title,
                        location: property.location,
                        tokenPrice: property.tokenPrice?.toString() || "0",
                        totalTokens: property.totalTokens?.toString() || "0",
                        tokensSold: property.tokensSold?.toString() || "0",
                        totalPrice: priceNumber.toString(),
                      },
                    });
                  }}
                  style={styles.modalContinueButton}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.white,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  headerButton: {
    padding: spacing.sm,
  },
  imageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: width,
    height: 300,
  },
  imageOverlay: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.lg,
    backgroundColor: realEstateColors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.white,
  },
  propertyInfo: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  propertyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  propertyTitleContainer: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyType: {
    fontSize: 16,
    color: realEstateColors.primary[600],
    fontWeight: "600",
  },
  propertyLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  propertyLocation: {
    fontSize: 16,
    color: realEstateColors.gray[700],
    marginLeft: spacing.xs,
  },
  propertyDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: realEstateColors.gray[50],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  detailItem: {
    alignItems: "center",
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginTop: spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    color: realEstateColors.gray[600],
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: realEstateColors.gray[700],
    lineHeight: 24,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: realEstateColors.gray[700],
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: realEstateColors.white,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
    marginTop: spacing.md,
  },
  regularButtonContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  tokenizedButtonContainer: {
    gap: spacing.md,
  },
  enquireButton: {
    flex: 1,
  },
  enquireButtonFull: {
    width: "100%",
  },
  buyButton: {
    flex: 1,
  },
  fractionalButton: {
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: realEstateColors.gray[600],
  },
  tokenizationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tokenizationInfo: {
    marginTop: spacing.sm,
  },
  tokenizationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[100],
  },
  tokenizationLabel: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  tokenizationValue: {
    fontSize: 16,
    color: realEstateColors.gray[900],
    fontWeight: "600",
  },
  tokenizationPrice: {
    fontSize: 18,
    color: realEstateColors.primary[600],
    fontWeight: "700",
  },
  tokenizationBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: realEstateColors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  tokenizationBadgeText: {
    flex: 1,
    fontSize: 14,
    color: realEstateColors.primary[700],
    lineHeight: 20,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: realEstateColors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
    position: "relative",
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  modalCloseButton: {
    position: "absolute",
    top: -spacing.sm,
    right: -spacing.sm,
    padding: spacing.xs,
  },
  modalDescription: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    lineHeight: 24,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  modalInfoCard: {
    backgroundColor: realEstateColors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  modalInfoLabel: {
    fontSize: 15,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  modalInfoValue: {
    fontSize: 16,
    color: realEstateColors.gray[900],
    fontWeight: "700",
  },
  modalButtonContainer: {
    gap: spacing.md,
  },
  modalCancelButton: {
    width: "100%",
  },
  modalContinueButton: {
    width: "100%",
  },
});
