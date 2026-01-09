import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  Image,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  realEstateColors,
  spacing,
  shadows,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";

export default function AddProperty() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    propertyType: "house",
    yearBuilt: "",
    features: "",
    isTokenized: false,
    totalTokens: "",
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProperty = async () => {
    // Basic validation with better error messages
    const requiredFields = {
      title: "Property Title",
      description: "Description",
      price: "Price",
      address: "Address",
      city: "City",
      state: "State",
      zipCode: "ZIP Code",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area",
    };

    // Check for empty required fields
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!(formData as any)[field] || (formData as any)[field].trim() === "") {
        Alert.alert(
          "Missing Information",
          `Please fill in the ${label} field.`,
          [{ text: "OK" }]
        );
        return;
      }
    }

    // Validate numeric fields
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid price greater than 0."
      );
      return;
    }

    const bedrooms = parseInt(formData.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of bedrooms.");
      return;
    }

    const bathrooms = parseInt(formData.bathrooms);
    if (isNaN(bathrooms) || bathrooms < 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of bathrooms.");
      return;
    }

    const area = parseInt(formData.area);
    if (isNaN(area) || area <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid area greater than 0.");
      return;
    }

    // Validate tokenization
    if (formData.isTokenized) {
      const totalTokens = parseInt(formData.totalTokens);
      if (!formData.totalTokens || isNaN(totalTokens) || totalTokens < 1) {
        Alert.alert(
          "Invalid Input",
          "Please enter a valid number of tokens (must be at least 1)."
        );
        return;
      }
    }

    // Check user authentication
    if (!user?.token) {
      Alert.alert(
        "Authentication Required",
        "Please log in to add a property.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);

    try {
      // Prepare property data for API
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: price,
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
        },
        images:
          selectedImages.length > 0
            ? selectedImages
            : ["https://via.placeholder.com/400x300"],
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        area: area,
        propertyType: formData.propertyType,
        yearBuilt: formData.yearBuilt
          ? parseInt(formData.yearBuilt)
          : undefined,
        features: formData.features
          ? formData.features
              .split(",")
              .map((f) => f.trim())
              .filter((f) => f.length > 0)
          : [],
        status: "active", // Default status for new properties
        isTokenized: formData.isTokenized,
        totalTokens: formData.isTokenized && formData.totalTokens
          ? parseInt(formData.totalTokens)
          : undefined,
      };

      console.log("Creating property with data:", propertyData);

      // Make API call to create property
      const response = await propertyAPI.createProperty(
        propertyData,
        user.token
      );

      console.log("Property created successfully:", response);

      // Show success message
      Alert.alert(
        "Success!",
        "Your property has been added successfully and is now live.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to properties list
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error adding property:", error);

      // Better error handling with specific messages
      let errorMessage = "Failed to add property. Please try again.";

      if (error.message) {
        if (
          error.message.includes("network") ||
          error.message.includes("connect")
        ) {
          errorMessage =
            "Cannot connect to server. Please check your internet connection and ensure the backend server is running.";
        } else if (
          error.message.includes("401") ||
          error.message.includes("authorized")
        ) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (
          error.message.includes("403") ||
          error.message.includes("forbidden")
        ) {
          errorMessage =
            "You don't have permission to add properties. Please ensure your account is set as a seller.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = [
    { label: "House", value: "house" },
    { label: "Apartment", value: "apartment" },
    { label: "Condo", value: "condo" },
    { label: "Townhouse", value: "townhouse" },
    { label: "Land", value: "land" },
    { label: "Commercial", value: "commercial" },
  ];

  const PropertyTypeCard = ({
    type,
    label,
    icon,
  }: {
    type: string;
    label: string;
    icon: string;
  }) => (
    <Pressable
      style={[
        styles.propertyTypeCard,
        formData.propertyType === type && styles.propertyTypeCardActive,
      ]}
      onPress={() => updateFormData("propertyType", type)}
    >
      <FontAwesome5
        name={icon}
        size={24}
        color={
          formData.propertyType === type
            ? realEstateColors.primary[600]
            : realEstateColors.gray[500]
        }
      />
      <Text
        style={[
          styles.propertyTypeLabel,
          formData.propertyType === type && styles.propertyTypeLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={[realEstateColors.primary[600], realEstateColors.primary[700]]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={realEstateColors.white}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Add New Property</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Property Images Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="images"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.sectionTitle}>Property Images</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Add up to 5 images of your property
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            <Pressable style={styles.addImageButton} onPress={pickImage}>
              <LinearGradient
                colors={[
                  realEstateColors.primary[100],
                  realEstateColors.primary[50],
                ]}
                style={styles.addImageGradient}
              >
                <Ionicons
                  name="camera"
                  size={32}
                  color={realEstateColors.primary[600]}
                />
                <Text style={styles.addImageText}>Add Photos</Text>
              </LinearGradient>
            </Pressable>

            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri }} style={styles.previewImage} />
                <Pressable
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={realEstateColors.red[600]}
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="document-text"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <Input
            label="Property Title"
            value={formData.title}
            onChangeText={(value) => updateFormData("title", value)}
            placeholder="e.g., Beautiful 3BR House with Garden"
            required
            variant="light"
            leftIcon={
              <FontAwesome5
                name="home"
                size={18}
                color={realEstateColors.gray[500]}
              />
            }
          />

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(value) => updateFormData("description", value)}
            placeholder="Describe your property in detail..."
            required
            multiline
            numberOfLines={4}
            variant="light"
            inputStyle={styles.textArea}
            leftIcon={
              <Ionicons
                name="create"
                size={18}
                color={realEstateColors.gray[500]}
              />
            }
          />

          <Input
            label="Price"
            value={formData.price}
            onChangeText={(value) => updateFormData("price", value)}
            placeholder="500,000"
            keyboardType="numeric"
            required
            variant="light"
            leftIcon={
              <FontAwesome5
                name="dollar-sign"
                size={18}
                color={realEstateColors.green[600]}
              />
            }
          />
        </View>

        {/* Property Type Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5
              name="building"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.sectionTitle}>Property Type</Text>
          </View>
          <View style={styles.propertyTypeGrid}>
            <PropertyTypeCard type="house" label="House" icon="home" />
            <PropertyTypeCard
              type="apartment"
              label="Apartment"
              icon="building"
            />
            <PropertyTypeCard type="condo" label="Condo" icon="city" />
            <PropertyTypeCard type="townhouse" label="Townhouse" icon="hotel" />
            <PropertyTypeCard type="land" label="Land" icon="mountain" />
            <PropertyTypeCard
              type="commercial"
              label="Commercial"
              icon="store"
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="location"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(value) => updateFormData("address", value)}
            placeholder="123 Main Street"
            required
            variant="light"
            leftIcon={
              <Ionicons
                name="navigate"
                size={18}
                color={realEstateColors.gray[500]}
              />
            }
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="City"
                value={formData.city}
                onChangeText={(value) => updateFormData("city", value)}
                placeholder="New York"
                required
                variant="light"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="State"
                value={formData.state}
                onChangeText={(value) => updateFormData("state", value)}
                placeholder="NY"
                required
                variant="light"
              />
            </View>
          </View>

          <Input
            label="ZIP Code"
            value={formData.zipCode}
            onChangeText={(value) => updateFormData("zipCode", value)}
            placeholder="10001"
            keyboardType="numeric"
            required
            variant="light"
            leftIcon={
              <MaterialIcons
                name="pin-drop"
                size={18}
                color={realEstateColors.gray[500]}
              />
            }
          />
        </View>

        {/* Property Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="info"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.sectionTitle}>Property Details</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Bedrooms"
                value={formData.bedrooms}
                onChangeText={(value) => updateFormData("bedrooms", value)}
                placeholder="3"
                keyboardType="numeric"
                required
                variant="light"
                leftIcon={
                  <Ionicons
                    name="bed"
                    size={18}
                    color={realEstateColors.gray[500]}
                  />
                }
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Bathrooms"
                value={formData.bathrooms}
                onChangeText={(value) => updateFormData("bathrooms", value)}
                placeholder="2"
                keyboardType="numeric"
                required
                variant="light"
                leftIcon={
                  <FontAwesome5
                    name="bath"
                    size={18}
                    color={realEstateColors.gray[500]}
                  />
                }
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Area (sq ft)"
                value={formData.area}
                onChangeText={(value) => updateFormData("area", value)}
                placeholder="1500"
                keyboardType="numeric"
                required
                variant="light"
                leftIcon={
                  <MaterialIcons
                    name="square-foot"
                    size={18}
                    color={realEstateColors.gray[500]}
                  />
                }
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Year Built"
                value={formData.yearBuilt}
                onChangeText={(value) => updateFormData("yearBuilt", value)}
                placeholder="2020"
                keyboardType="numeric"
                variant="light"
                leftIcon={
                  <MaterialIcons
                    name="calendar-today"
                    size={18}
                    color={realEstateColors.gray[500]}
                  />
                }
              />
            </View>
          </View>

          <Input
            label="Features"
            value={formData.features}
            onChangeText={(value) => updateFormData("features", value)}
            placeholder="Pool, Garage, Garden, etc. (comma separated)"
            variant="light"
            leftIcon={
              <MaterialIcons
                name="stars"
                size={18}
                color={realEstateColors.gray[500]}
              />
            }
          />
        </View>

        {/* Tokenization Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.sectionTitle}>Tokenization</Text>
          </View>

          <View style={styles.tokenizationRow}>
            <View style={styles.tokenizationLabelContainer}>
              <Text style={styles.tokenizationLabel}>
                Tokenize this property
              </Text>
              <Text style={styles.tokenizationSubtext}>
                Divide property into tokens for fractional ownership
              </Text>
            </View>
            <Switch
              value={formData.isTokenized}
              onValueChange={(value) => updateFormData("isTokenized", value)}
              trackColor={{
                false: realEstateColors.gray[300],
                true: realEstateColors.primary[200],
              }}
              thumbColor={
                formData.isTokenized
                  ? realEstateColors.primary[600]
                  : realEstateColors.gray[400]
              }
            />
          </View>

          {formData.isTokenized && (
            <View style={styles.tokenInputContainer}>
              <Input
                label="Total Tokens"
                value={formData.totalTokens}
                onChangeText={(value) => updateFormData("totalTokens", value)}
                placeholder="e.g., 1000"
                keyboardType="numeric"
                variant="light"
                required
                leftIcon={
                  <MaterialIcons
                    name="token"
                    size={18}
                    color={realEstateColors.gray[500]}
                  />
                }
              />
              {formData.price && formData.totalTokens && !isNaN(parseFloat(formData.price)) && !isNaN(parseInt(formData.totalTokens)) && (
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenInfoText}>
                    Price per token: ${(
                      parseFloat(formData.price) / parseInt(formData.totalTokens)
                    ).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Add Property Button */}
        <GradientButton
          title={loading ? "Adding Property..." : "Add Property"}
          onPress={handleAddProperty}
          loading={loading}
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  // Header Styles
  headerGradient: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.white,
  },
  placeholder: {
    width: 40,
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Section Styles
  section: {
    marginBottom: spacing.xl,
    backgroundColor: realEstateColors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  sectionSubtitle: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.md,
  },
  // Image Upload Styles
  imageScroll: {
    marginTop: spacing.md,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    overflow: "hidden",
  },
  addImageGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: realEstateColors.primary[200],
    borderStyle: "dashed",
    borderRadius: borderRadius.lg,
  },
  addImageText: {
    marginTop: spacing.xs,
    fontSize: 13,
    fontWeight: "600",
    color: realEstateColors.primary[600],
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    position: "relative",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.lg,
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: realEstateColors.white,
    borderRadius: 12,
  },
  // Property Type Styles
  propertyTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  propertyTypeCard: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: realEstateColors.gray[200],
    backgroundColor: realEstateColors.gray[50],
  },
  propertyTypeCardActive: {
    borderColor: realEstateColors.primary[600],
    backgroundColor: realEstateColors.primary[50],
  },
  propertyTypeLabel: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: "600",
    color: realEstateColors.gray[700],
  },
  propertyTypeLabelActive: {
    color: realEstateColors.primary[700],
  },
  // Input Styles
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  // Button Styles
  addButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  // Tokenization Styles
  tokenizationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  tokenizationLabelContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  tokenizationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  tokenizationSubtext: {
    fontSize: 13,
    color: realEstateColors.gray[600],
  },
  tokenInputContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  tokenInfo: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: realEstateColors.primary[50],
    borderRadius: borderRadius.md,
  },
  tokenInfoText: {
    fontSize: 14,
    color: realEstateColors.primary[700],
    fontWeight: "600",
  },
});
