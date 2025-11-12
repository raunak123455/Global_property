import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { CustomButton } from "@/components/ui/CustomButton";
import { Input } from "@/components/ui/Input";
import { Header } from "@/components/ui/Header";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { kycAPI } from "@/utils/api";

interface KycFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  idNumber: string;
  phoneNumber: string;
}

export default function KycVerificationScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState<KycFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    idNumber: "",
    phoneNumber: "",
  });
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [addressDocument, setAddressDocument] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with existing user data if available
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        // Other fields would be populated from user data in a real app
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof KycFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!"
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (documentType: "id" | "address") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        if (documentType === "id") {
          setIdDocument(uri);
        } else {
          setAddressDocument(uri);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dateOfBirth ||
      !formData.address ||
      !formData.idNumber
    ) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    if (!idDocument) {
      Alert.alert("Validation Error", "Please upload your ID document.");
      return;
    }

    if (!user?.token) {
      Alert.alert("Error", "You must be logged in to submit KYC verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit KYC data to backend
      console.log("Submitting KYC data:", {
        ...formData,
        idDocument,
        addressDocument,
      });

      const response = await kycAPI.submitKyc(
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          idNumber: formData.idNumber,
          phoneNumber: formData.phoneNumber,
          // In production, you would upload the documents to cloud storage
          // and send the URLs here
        },
        user.token
      );

      console.log("KYC submission response:", response);

      // Show success message
      Alert.alert(
        "Verification Submitted",
        response.message ||
          "Your KYC verification has been submitted successfully. We will review your documents and notify you of the status.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("KYC submission error:", error);
      const errorMessage =
        error.message || "Failed to submit KYC verification. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Header title="KYC Verification" showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Identity Verification</Text>
        <Text style={styles.pageDescription}>
          Please provide your personal information and upload required documents
          for verification.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange("firstName", value)}
                placeholder="Enter your first name"
                required
                variant="light"
              />
            </View>
            <View style={styles.nameInput}>
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange("lastName", value)}
                placeholder="Enter your last name"
                required
                variant="light"
              />
            </View>
          </View>

          <Input
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(value) => handleInputChange("dateOfBirth", value)}
            placeholder="MM/DD/YYYY"
            required
            variant="light"
          />

          <Input
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(value) => handleInputChange("phoneNumber", value)}
            placeholder="(123) 456-7890"
            keyboardType="phone-pad"
            variant="light"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Address Information</Text>

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(value) => handleInputChange("address", value)}
            placeholder="Street address"
            required
            variant="light"
          />

          <View style={styles.addressRow}>
            <View style={styles.addressInput}>
              <Input
                label="City"
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
                placeholder="City"
                variant="light"
              />
            </View>
            <View style={styles.addressInput}>
              <Input
                label="State"
                value={formData.state}
                onChangeText={(value) => handleInputChange("state", value)}
                placeholder="State"
                variant="light"
              />
            </View>
            <View style={styles.zipInput}>
              <Input
                label="ZIP Code"
                value={formData.zipCode}
                onChangeText={(value) => handleInputChange("zipCode", value)}
                placeholder="12345"
                keyboardType="numeric"
                variant="light"
                inputStyle={styles.zipInputField}
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Identification</Text>

          <Input
            label="ID Number"
            value={formData.idNumber}
            onChangeText={(value) => handleInputChange("idNumber", value)}
            placeholder="Enter your ID number"
            required
            variant="light"
          />

          <View style={styles.documentUpload}>
            <Text style={styles.documentLabel}>ID Document *</Text>
            <CustomButton
              title={idDocument ? "Change ID Document" : "Upload ID Document"}
              onPress={() => pickImage("id")}
              variant="outline"
              style={styles.uploadButton}
            />
            {idDocument && (
              <Text style={styles.uploadedText}>✓ Document uploaded</Text>
            )}
          </View>

          <View style={styles.documentUpload}>
            <Text style={styles.documentLabel}>Address Proof (Optional)</Text>
            <CustomButton
              title={addressDocument ? "Change Document" : "Upload Document"}
              onPress={() => pickImage("address")}
              variant="outline"
              style={styles.uploadButton}
            />
            {addressDocument && (
              <Text style={styles.uploadedText}>✓ Document uploaded</Text>
            )}
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>Note:</Text>
          <Text style={styles.noteText}>
            • Government-issued ID (passport, driver's license, etc.) is
            required
          </Text>
          <Text style={styles.noteText}>
            • Document must be clear and unobstructed
          </Text>
          <Text style={styles.noteText}>
            • Address proof can be utility bill, bank statement, etc.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Submit for Verification"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
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
    padding: spacing.lg,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  pageDescription: {
    fontSize: 16,
    color: realEstateColors.gray[700],
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  addressRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  addressInput: {
    flex: 2,
  },
  zipInput: {
    flex: 1,
    minWidth: 80,
  },
  documentUpload: {
    marginBottom: spacing.lg,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  uploadButton: {
    width: "100%",
  },
  uploadedText: {
    color: realEstateColors.success,
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  noteContainer: {
    backgroundColor: realEstateColors.gray[50],
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  noteText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  submitButton: {
    width: "100%",
  },
  zipInputField: {
    minWidth: 80,
  },
});
