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
          <IconSymbol
            name="chevron.left"
            size={24}
            color={realEstateColors.gray[900]}
          />
        </Pressable>
        <Text style={styles.title}>Edit Property</Text>
        <Pressable style={styles.deleteButton} onPress={handleDeleteProperty}>
          <IconSymbol
            name="trash"
            size={24}
            color={realEstateColors.red[600]}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Input
              label="Property Title"
              value={formData.title}
              onChangeText={(value) => updateFormData("title", value)}
              placeholder="e.g., Beautiful 3BR House"
              inputStyle={styles.input}
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              placeholder="Describe your property..."
              multiline
              numberOfLines={4}
              inputStyle={[styles.input, styles.textArea]}
            />

            <Input
              label="Price ($)"
              value={formData.price}
              onChangeText={(value) => updateFormData("price", value)}
              placeholder="500000"
              keyboardType="numeric"
              inputStyle={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>

            <Input
              label="Address"
              value={formData.address}
              onChangeText={(value) => updateFormData("address", value)}
              placeholder="123 Main Street"
              inputStyle={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="City"
                  value={formData.city}
                  onChangeText={(value) => updateFormData("city", value)}
                  placeholder="New York"
                  inputStyle={styles.input}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="State"
                  value={formData.state}
                  onChangeText={(value) => updateFormData("state", value)}
                  placeholder="NY"
                  inputStyle={styles.input}
                />
              </View>
            </View>

            <Input
              label="ZIP Code"
              value={formData.zipCode}
              onChangeText={(value) => updateFormData("zipCode", value)}
              placeholder="10001"
              keyboardType="numeric"
              inputStyle={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Bedrooms"
                  value={formData.bedrooms}
                  onChangeText={(value) => updateFormData("bedrooms", value)}
                  placeholder="3"
                  keyboardType="numeric"
                  inputStyle={styles.input}
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Bathrooms"
                  value={formData.bathrooms}
                  onChangeText={(value) => updateFormData("bathrooms", value)}
                  placeholder="2"
                  keyboardType="numeric"
                  inputStyle={styles.input}
                />
              </View>
            </View>

            <Input
              label="Area (sq ft)"
              value={formData.area}
              onChangeText={(value) => updateFormData("area", value)}
              placeholder="1500"
              keyboardType="numeric"
              inputStyle={styles.input}
            />

            <Input
              label="Year Built"
              value={formData.yearBuilt}
              onChangeText={(value) => updateFormData("yearBuilt", value)}
              placeholder="2020"
              keyboardType="numeric"
              inputStyle={styles.input}
            />

            <Input
              label="Features (comma separated)"
              value={formData.features}
              onChangeText={(value) => updateFormData("features", value)}
              placeholder="Pool, Garage, Garden"
              inputStyle={styles.input}
            />
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
    backgroundColor: realEstateColors.gray[50],
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
    padding: spacing.lg,
    backgroundColor: realEstateColors.white,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
  },
  deleteButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
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
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  updateButton: {
    marginBottom: spacing.sm,
  },
});
