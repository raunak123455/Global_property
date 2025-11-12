import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Alert,
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
}

const mockProperty: Property = {
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
};

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.id as string;
  const { user } = useUser();
  const [showKycBanner, setShowKycBanner] = useState(false);

  // In a real app, you would fetch the property data based on the ID
  // For now, we'll use the mock data
  const property = mockProperty;

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
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
    flexDirection: "row",
    padding: spacing.lg,
    gap: spacing.md,
  },
  enquireButton: {
    flex: 1,
  },
  buyButton: {
    flex: 1,
  },
});
