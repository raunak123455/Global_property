import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { realEstateColors, spacing } from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";

export default function EditProperty() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  });

  const fetchProperty = async () => {
    if (!user?.token) {
      console.error("No user token available");
      setInitialLoading(false);
      return;
    }

    try {
      const response = await propertyAPI.getProperty(id, user.token);
      setFormData({
        title: response.title || "",
        description: response.description || "",
        price: response.price?.toString() || "",
        address: response.location?.address || "",
        city: response.location?.city || "",
        state: response.location?.state || "",
        zipCode: response.location?.zipCode || "",
        bedrooms: response.bedrooms?.toString() || "",
        bathrooms: response.bathrooms?.toString() || "",
        area: response.area?.toString() || "",
        propertyType: response.propertyType || "house",
        yearBuilt: response.yearBuilt?.toString() || "",
        features: response.features?.join(", ") || "",
      });
    } catch (error) {
      console.error("Error fetching property:", error);
      Alert.alert("Error", "Failed to load property details");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id, user?.token]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProperty = async () => {
    // Basic validation
    const requiredFields = [
      "title",
      "description",
      "price",
      "address",
      "city",
      "state",
      "zipCode",
      "bedrooms",
      "bathrooms",
      "area",
    ];

    for (const field of requiredFields) {
      if (!(formData as any)[field]) {
        Alert.alert("Error", `Please fill in ${field}`);
        return;
      }
    }

    if (!user?.token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setLoading(true);

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        propertyType: formData.propertyType,
        yearBuilt: formData.yearBuilt
          ? parseInt(formData.yearBuilt)
          : undefined,
        features: formData.features
          ? formData.features.split(",").map((f) => f.trim())
          : [],
      };

      await propertyAPI.updateProperty(id, propertyData, user.token);
      Alert.alert("Success", "Property updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating property:", error);
      Alert.alert("Error", "Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = () => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await propertyAPI.deleteProperty(id, user?.token);
              Alert.alert("Success", "Property deleted successfully!");
              router.replace("/(seller-tabs)/my-properties");
            } catch (error) {
              console.error("Error deleting property:", error);
              Alert.alert("Error", "Failed to delete property");
            }
          },
        },
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <View style={styles.iconButton}>
            <IconSymbol
              name="chevron.left"
              size={20}
              color={realEstateColors.gray[700]}
            />
          </View>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Edit Property</Text>
          <Text style={styles.subtitle}>Update your listing details</Text>
        </View>
        <Pressable style={styles.deleteButton} onPress={handleDeleteProperty}>
          <View style={[styles.iconButton, styles.deleteIconButton]}>
            <IconSymbol
              name="trash"
              size={20}
              color={realEstateColors.red[600]}
            />
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          {/* Basic Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <IconSymbol
                  name="doc.text"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
              </View>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.cardContent}>
              <Input
                label="Property Title"
                value={formData.title}
                onChangeText={(value) => updateFormData("title", value)}
                placeholder="e.g., Beautiful 3BR House"
                containerStyle={styles.inputContainer}
                variant="light"
              />

              <Input
                label="Description"
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                placeholder="Describe your property..."
                multiline
                numberOfLines={4}
                inputStyle={styles.textArea}
                containerStyle={styles.inputContainer}
                variant="light"
              />

              <Input
                label="Price ($)"
                value={formData.price}
                onChangeText={(value) => updateFormData("price", value)}
                placeholder="500000"
                keyboardType="numeric"
                containerStyle={styles.inputContainer}
                variant="light"
              />
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <IconSymbol
                  name="location"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
              </View>
              <Text style={styles.sectionTitle}>Location</Text>
            </View>

            <View style={styles.cardContent}>
              <Input
                label="Address"
                value={formData.address}
                onChangeText={(value) => updateFormData("address", value)}
                placeholder="123 Main Street"
                containerStyle={styles.inputContainer}
                variant="light"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="City"
                    value={formData.city}
                    onChangeText={(value) => updateFormData("city", value)}
                    placeholder="New York"
                    containerStyle={styles.inputContainer}
                    variant="light"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="State"
                    value={formData.state}
                    onChangeText={(value) => updateFormData("state", value)}
                    placeholder="NY"
                    containerStyle={styles.inputContainer}
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
                containerStyle={styles.inputContainer}
                variant="light"
              />
            </View>
          </View>

          {/* Property Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <IconSymbol
                  name="house.fill"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
              </View>
              <Text style={styles.sectionTitle}>Property Details</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="Bedrooms"
                    value={formData.bedrooms}
                    onChangeText={(value) => updateFormData("bedrooms", value)}
                    placeholder="3"
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                    variant="light"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Bathrooms"
                    value={formData.bathrooms}
                    onChangeText={(value) => updateFormData("bathrooms", value)}
                    placeholder="2"
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                    variant="light"
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
                    containerStyle={styles.inputContainer}
                    variant="light"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Year Built"
                    value={formData.yearBuilt}
                    onChangeText={(value) => updateFormData("yearBuilt", value)}
                    placeholder="2020"
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                    variant="light"
                  />
                </View>
              </View>

              <Input
                label="Features (comma separated)"
                value={formData.features}
                onChangeText={(value) => updateFormData("features", value)}
                placeholder="Pool, Garage, Garden, Fireplace"
                containerStyle={styles.inputContainer}
                variant="light"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GradientButton
          title="Update Property"
          onPress={handleUpdateProperty}
          loading={loading}
          style={styles.updateButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[100],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: realEstateColors.gray[600],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: realEstateColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: spacing.md,
  },
  backButton: {
    width: 40,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: realEstateColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 40,
  },
  deleteIconButton: {
    backgroundColor: realEstateColors.red[50],
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: realEstateColors.gray[500],
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  form: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: realEstateColors.white,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: realEstateColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  updateButton: {
    marginBottom: 0,
  },
});
