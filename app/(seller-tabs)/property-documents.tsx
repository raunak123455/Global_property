import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  realEstateColors,
  spacing,
  shadows,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  required: boolean;
  category: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  // Ownership & Title Proof
  {
    id: "title-deed",
    name: "Title Deed / Sale Deed",
    description: "Proof of ownership",
    icon: "file-document",
    required: true,
    category: "Ownership & Title",
  },
  {
    id: "land-registry",
    name: "Land Registry Extract",
    description: "Ownership, boundaries, and encumbrances",
    icon: "file-document-outline",
    required: true,
    category: "Ownership & Title",
  },
  {
    id: "cadastral-plan",
    name: "Cadastral Plan",
    description: "Official site and boundary plan",
    icon: "map-outline",
    required: false,
    category: "Ownership & Title",
  },

  // Legal & Encumbrance
  {
    id: "mortgage-statement",
    name: "Mortgage Statement",
    description: "Shows existing loans or debt-free status",
    icon: "cash-outline",
    required: false,
    category: "Legal & Encumbrance",
  },
  {
    id: "bank-clearance",
    name: "Bank Clearance Certificate",
    description: "Confirms mortgage is fully paid",
    icon: "checkmark-circle",
    required: false,
    category: "Legal & Encumbrance",
  },
  {
    id: "no-litigation",
    name: "No Litigation Certificate",
    description: "Declares no court disputes",
    icon: "shield-checkmark",
    required: false,
    category: "Legal & Encumbrance",
  },

  // Building & Compliance
  {
    id: "building-permit",
    name: "Building Permit",
    description: "Authorization for construction",
    icon: "document-text",
    required: true,
    category: "Building & Compliance",
  },
  {
    id: "occupancy-certificate",
    name: "Occupancy Certificate",
    description: "Property is fit for living",
    icon: "home",
    required: true,
    category: "Building & Compliance",
  },
  {
    id: "energy-certificate",
    name: "Energy Performance Certificate",
    description: "EU mandatory energy rating",
    icon: "flash",
    required: true,
    category: "Building & Compliance",
  },

  // Financial & Tax
  {
    id: "property-tax",
    name: "Property Tax Receipts",
    description: "Proof of no unpaid taxes",
    icon: "cash",
    required: false,
    category: "Financial & Tax",
  },
  {
    id: "utility-bills",
    name: "Utility Bills",
    description: "Recent 3-6 months",
    icon: "receipt",
    required: false,
    category: "Financial & Tax",
  },

  // Personal & Legal Identity
  {
    id: "id-proof",
    name: "ID Document",
    description: "Passport or National ID",
    icon: "person",
    required: true,
    category: "Personal & Identity",
  },
  {
    id: "tin",
    name: "Tax Identification Number",
    description: "For tax purposes",
    icon: "card",
    required: false,
    category: "Personal & Identity",
  },

  // Additional Documents
  {
    id: "structural-guarantee",
    name: "Structural Guarantee",
    description: "Ten-year building warranty",
    icon: "shield",
    required: false,
    category: "Additional",
  },
  {
    id: "sale-agreement",
    name: "Draft Sale Agreement",
    description: "Preliminary contract",
    icon: "document",
    required: false,
    category: "Additional",
  },
];

export default function PropertyDocuments() {
  const { propertyId } = useLocalSearchParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [documentsSubmitted, setDocumentsSubmitted] = useState(false);
  const [documents, setDocuments] = useState<
    Record<string, { uri: string; name: string; base64?: string }[]>
  >({});

  // Check if documents have been submitted
  useEffect(() => {
    const checkDocumentsStatus = async () => {
      if (!user?.token || !propertyId) return;

      try {
        const actualPropertyId = Array.isArray(propertyId)
          ? propertyId[0]
          : propertyId;

        if (!actualPropertyId) return;

        const response = await propertyAPI.getLegalDocuments(
          actualPropertyId as string,
          user.token
        );

        if (response.submitted) {
          setDocumentsSubmitted(true);
        }
      } catch (error) {
        // If error, assume documents haven't been submitted
        console.log("Error checking documents status:", error);
      }
    };

    checkDocumentsStatus();
  }, [propertyId, user?.token]);

  const pickDocuments = async (documentId: string, documentName: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true, // Request base64 encoding directly from ImagePicker
    });

    if (!result.canceled && result.assets) {
      const newFiles = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || documentName,
        base64: asset.base64 || undefined, // ImagePicker can provide base64 directly, convert null to undefined
      }));

      setDocuments((prev) => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), ...newFiles],
      }));
    }
  };

  const removeDocument = (documentId: string, index: number) => {
    setDocuments((prev) => ({
      ...prev,
      [documentId]: prev[documentId].filter((_, i) => i !== index),
    }));
  };

  // Convert file to base64 - use ImagePicker's base64 if available, otherwise use URI
  const convertToBase64 = async (file: {
    uri: string;
    base64?: string;
  }): Promise<string> => {
    try {
      // If ImagePicker already provided base64, use it
      if (file.base64) {
        const extension = file.uri.split(".").pop()?.toLowerCase() || "jpeg";
        const mimeType =
          extension === "png"
            ? "image/png"
            : extension === "pdf"
            ? "application/pdf"
            : "image/jpeg";
        return `data:${mimeType};base64,${file.base64}`;
      }

      // Fallback: if base64 not available, send URI
      // In production, you'd upload to cloud storage first
      console.warn("Base64 not available, sending URI:", file.uri);
      return file.uri;
    } catch (error: any) {
      console.error("Error processing file:", error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  };

  const handleSubmitDocuments = async () => {
    // Check required documents
    const requiredDocs = DOCUMENT_TYPES.filter((doc) => doc.required);
    const missingDocs = requiredDocs.filter(
      (doc) => !documents[doc.id] || documents[doc.id].length === 0
    );

    if (missingDocs.length > 0) {
      Alert.alert(
        "Missing Required Documents",
        `Please upload the following required documents:\n\n${missingDocs
          .map((doc) => `• ${doc.name}`)
          .join("\n")}`,
        [{ text: "OK" }]
      );
      return;
    }

    if (!user?.token) {
      Alert.alert("Error", "Please log in to submit documents");
      return;
    }

    if (!propertyId) {
      Alert.alert("Error", "Property ID is missing");
      return;
    }

    // Handle case where propertyId might be an array (common with useLocalSearchParams)
    const actualPropertyId = Array.isArray(propertyId)
      ? propertyId[0]
      : propertyId;

    if (!actualPropertyId) {
      Alert.alert("Error", "Invalid property ID");
      return;
    }

    setLoading(true);

    try {
      // Convert all documents to base64 and format for API
      const documentsArray = [];

      for (const docType of DOCUMENT_TYPES) {
        const docFiles = documents[docType.id];
        if (docFiles && docFiles.length > 0) {
          // Convert all files for this document type to base64
          const base64Files = await Promise.all(
            docFiles.map((file) => convertToBase64(file))
          );

          documentsArray.push({
            documentType: docType.name, // or docType.id if you prefer
            files: base64Files,
          });
        }
      }

      if (documentsArray.length === 0) {
        Alert.alert("Error", "No documents to submit");
        setLoading(false);
        return;
      }

      console.log("Submitting documents:", {
        propertyId: actualPropertyId,
        propertyIdType: typeof actualPropertyId,
        documentsCount: documentsArray.length,
      });

      // Call API to submit documents
      const response = await propertyAPI.submitLegalDocuments(
        actualPropertyId as string,
        documentsArray,
        user.token
      );

      console.log("Documents submitted successfully:", response);

      setDocumentsSubmitted(true);

      Alert.alert(
        "Success!",
        "Documents have been submitted for notary verification. You will be notified once verification is complete.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error submitting documents:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit documents. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const DocumentCard = ({ document }: { document: DocumentType }) => {
    const uploadedFiles = documents[document.id] || [];
    const getIconName = (icon: string) => {
      const iconMap: Record<string, any> = {
        "file-document": "document-text",
        "file-document-outline": "document-outline",
        "map-outline": "map-outline",
        "cash-outline": "cash-outline",
        "checkmark-circle": "checkmark-circle",
        "shield-checkmark": "shield-checkmark",
        "document-text": "document-text",
        home: "home",
        flash: "flash",
        cash: "cash",
        receipt: "receipt",
        person: "person",
        card: "card",
        shield: "shield",
        document: "document",
      };
      return iconMap[icon] || "document";
    };

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons
              name={getIconName(document.icon)}
              size={24}
              color={realEstateColors.primary[600]}
            />
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitleRow}>
              <Text style={styles.documentName}>{document.name}</Text>
              {document.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.documentDescription}>
              {document.description}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.uploadButton}
          onPress={() => pickDocuments(document.id, document.name)}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={20}
            color={realEstateColors.primary[600]}
          />
          <Text style={styles.uploadText}>Upload Document</Text>
        </Pressable>

        {uploadedFiles.length > 0 && (
          <View style={styles.uploadedFilesContainer}>
            {uploadedFiles.map((file, index) => (
              <View key={index} style={styles.uploadedFile}>
                <Ionicons
                  name="document"
                  size={18}
                  color={realEstateColors.gray[600]}
                />
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name || `Document ${index + 1}`}
                </Text>
                <Pressable onPress={() => removeDocument(document.id, index)}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={realEstateColors.red[600]}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const categorizedDocuments = DOCUMENT_TYPES.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocumentType[]>);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
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
          <Text style={styles.headerTitle}>Legal Documents</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={[realEstateColors.blue[50], realEstateColors.blue[100]]}
            style={styles.infoBannerGradient}
          >
            <View style={styles.infoBannerContent}>
              <Ionicons
                name="information-circle"
                size={24}
                color={realEstateColors.blue[600]}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>
                  {documentsSubmitted
                    ? "Pending"
                    : "Notary Verification Required"}
                </Text>
                <Text style={styles.infoText}>
                  {documentsSubmitted
                    ? "Legal documents have been submitted and are pending notary verification. You will be notified once verification is complete."
                    : "Upload all required legal documents for notary verification. This ensures secure and verified property transactions."}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {Object.entries(categorizedDocuments).map(([category, docs]) => (
          <View key={category} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="folder"
                size={20}
                color={realEstateColors.primary[600]}
              />
              <Text style={styles.sectionTitle}>{category}</Text>
            </View>

            {docs.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </View>
        ))}

        <GradientButton
          title={loading ? "Submitting..." : "Submit for Verification"}
          onPress={handleSubmitDocuments}
          loading={loading}
          style={styles.submitButton}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  infoBanner: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  infoBannerGradient: {
    padding: spacing.md,
  },
  infoBannerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.blue[900],
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: realEstateColors.blue[700],
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  documentCard: {
    backgroundColor: realEstateColors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  documentName: {
    fontSize: 15,
    fontWeight: "600",
    color: realEstateColors.gray[900],
  },
  requiredBadge: {
    backgroundColor: realEstateColors.orange[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "700",
    color: realEstateColors.orange[700],
    textTransform: "uppercase",
  },
  documentDescription: {
    fontSize: 13,
    color: realEstateColors.gray[600],
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: realEstateColors.primary[300],
    borderStyle: "dashed",
    backgroundColor: realEstateColors.primary[50],
    gap: spacing.xs,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.primary[600],
  },
  uploadedFilesContainer: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  uploadedFile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: realEstateColors.gray[50],
    borderRadius: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: realEstateColors.gray[700],
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});
