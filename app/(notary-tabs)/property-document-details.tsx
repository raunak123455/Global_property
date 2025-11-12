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
  Dimensions,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  realEstateColors,
  spacing,
  shadows,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";

const { width } = Dimensions.get("window");

interface PropertyDocument {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  propertyType: string;
  propertyImages: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  description?: string;
  features?: string[];
  yearBuilt?: number;
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  legalDocuments: {
    submitted: boolean;
    submittedAt: string;
    notaryStatus: "pending" | "under-review" | "verified" | "rejected";
    documents: Array<{
      documentType: string;
      files: string[];
      uploadedAt?: string;
    }>;
    notes?: string;
    verifiedAt?: string;
  };
  createdAt: string;
}

export default function PropertyDocumentDetails() {
  const { propertyId } = useLocalSearchParams();
  const { user } = useUser();
  const [property, setProperty] = useState<PropertyDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (user?.token && propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId, user?.token]);

  const fetchPropertyDetails = async () => {
    try {
      if (!user?.token || !propertyId) return;

      const actualPropertyId = Array.isArray(propertyId)
        ? propertyId[0]
        : propertyId;

      // Get the list of properties with documents
      const response = await propertyAPI.getPropertiesWithLegalDocuments(
        user.token
      );

      if (response && response.properties) {
        const foundProperty = response.properties.find(
          (p: PropertyDocument) =>
            p.propertyId === actualPropertyId ||
            p.propertyId?.toString() === actualPropertyId
        );

        if (foundProperty) {
          // Use the property data we already have from getPropertiesWithLegalDocuments
          // This endpoint already includes all necessary information
          setProperty(foundProperty);
        } else {
          console.error("Property not found in list:", actualPropertyId);
          Alert.alert("Error", "Property not found");
          router.back();
        }
      } else {
        console.error("No properties returned from API");
        Alert.alert("Error", "No properties found");
        router.back();
      }
    } catch (error: any) {
      console.error("Error fetching property details:", error);
      Alert.alert("Error", error.message || "Failed to load property details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (
    documentType: string,
    fileUrl: string,
    index: number
  ) => {
    try {
      console.log("=== DOWNLOAD DOCUMENT START ===");
      console.log("Property ID:", property?.propertyId);
      console.log("Property Title:", property?.propertyTitle);
      console.log("Document Type (original):", documentType);
      console.log("File Index:", index);
      console.log("File URL length:", fileUrl?.length || 0);
      console.log(
        "File URL starts with data:",
        fileUrl?.startsWith("data:") || false
      );

      // Ensure documentType is not undefined
      if (!documentType || typeof documentType !== "string") {
        console.log("Warning: documentType was undefined/null, using fallback");
        documentType = `Document_${index + 1}`;
      }
      console.log("Document Type (final):", documentType);

      setDownloadingDoc(`${documentType}-${index}`);

      // Check if file is base64 data URL (from expo-image-picker)
      if (fileUrl && fileUrl.startsWith("data:")) {
        // Extract base64 data and mime type
        const matches = fileUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches || !matches[1] || !matches[2]) {
          Alert.alert("Error", "Invalid file format");
          setDownloadingDoc(null);
          return;
        }

        const mimeType = matches[1];
        const base64String = matches[2]; // This is the raw base64 string

        // Determine file extension from mime type
        let extension = "jpg"; // Default to jpg since we're using image picker
        if (mimeType.includes("image/png")) extension = "png";
        else if (
          mimeType.includes("image/jpeg") ||
          mimeType.includes("image/jpg")
        )
          extension = "jpg";
        else if (mimeType.includes("application/pdf")) extension = "pdf";

        // Create file name - sanitize documentType properly
        // Replace all non-alphanumeric characters (except spaces) with underscore
        // Then replace spaces with underscore, remove multiple underscores
        const sanitizedDocType =
          documentType
            .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special chars first
            .trim()
            .replace(/\s+/g, "_") // Replace spaces with underscore
            .replace(/_+/g, "_") // Replace multiple underscores with single
            .substring(0, 30) || // Limit length to avoid path issues
          `Document_${index + 1}`;

        const fileName = `${sanitizedDocType}_${index + 1}.${extension}`;
        console.log("=== FILE CREATION ===");
        console.log("Sanitized Document Type:", sanitizedDocType);
        console.log("File Name:", fileName);
        console.log("File Extension:", extension);
        console.log("MIME Type:", mimeType);

        // Get cache directory - use legacy API which is more reliable
        let cacheDir: string | null = null;

        try {
          // Import legacy API
          const legacyFileSystem = require("expo-file-system/legacy");
          // Try cache directory first, then document directory
          cacheDir =
            legacyFileSystem.cacheDirectory ||
            legacyFileSystem.documentDirectory;

          if (!cacheDir) {
            // If still null, try accessing the new API properties
            const newApi = FileSystem as any;
            cacheDir = newApi.cacheDirectory || newApi.documentDirectory;
          }
        } catch (e) {
          console.error("Error accessing file system directories:", e);
          // Try one more time with direct access
          try {
            const fs = require("expo-file-system/legacy");
            cacheDir = fs.cacheDirectory || fs.documentDirectory;
          } catch (e2) {
            console.error("Second attempt to get directory failed:", e2);
          }
        }

        if (!cacheDir) {
          Alert.alert(
            "Error",
            "Unable to access file system. The app may need storage permissions."
          );
          setDownloadingDoc(null);
          return;
        }

        // Ensure path has proper separator
        const fileUri =
          cacheDir.endsWith("/") || cacheDir.endsWith("\\")
            ? `${cacheDir}${fileName}`
            : `${cacheDir}/${fileName}`;

        console.log("=== FILE PATH ===");
        console.log("Cache Directory:", cacheDir);
        console.log("File URI:", fileUri);
        console.log("Base64 String Length:", base64String.length);
        console.log(
          "First 100 chars of base64:",
          base64String.substring(0, 100)
        );

        // downloadAsync doesn't support data URLs (only http/https)
        // For base64 images, we need to decode and write as binary
        try {
          // Decode base64 to binary bytes
          // React Native doesn't have atob or Buffer by default
          // So we'll manually decode base64
          const base64Chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
          const base64StringClean = base64String.replace(/\s/g, ""); // Remove whitespace
          const len = base64StringClean.length;
          const padding = base64StringClean.endsWith("==")
            ? 2
            : base64StringClean.endsWith("=")
            ? 1
            : 0;
          const byteLength = (len * 3) / 4 - padding;
          const bytes = new Uint8Array(byteLength);

          let i = 0;
          let j = 0;

          while (i < len) {
            const enc1 = base64Chars.indexOf(base64StringClean.charAt(i++));
            const enc2 = base64Chars.indexOf(base64StringClean.charAt(i++));
            const enc3 = base64Chars.indexOf(base64StringClean.charAt(i++));
            const enc4 = base64Chars.indexOf(base64StringClean.charAt(i++));

            if (enc1 === -1 || enc2 === -1) break;

            const chr1 = (enc1 << 2) | (enc2 >> 4);
            bytes[j++] = chr1;

            if (enc3 !== -1 && enc3 !== 64) {
              const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
              bytes[j++] = chr2;

              if (enc4 !== -1 && enc4 !== 64) {
                const chr3 = ((enc3 & 3) << 6) | enc4;
                bytes[j++] = chr3;
              }
            }
          }

          // Write binary data using fetch API (works better for binary data on React Native)
          const legacyFileSystem = require("expo-file-system/legacy");

          console.log("=== FILE WRITE ATTEMPT ===");
          console.log("Decoded bytes length:", bytes.length);
          console.log("Actual bytes to write:", j);

          try {
            // Try writing with Base64 encoding (if supported by legacy API)
            // The legacy API should decode the base64 string when EncodingType.Base64 is used
            console.log("Attempting to write file with Base64 encoding...");

            let fileWritten = false;

            // Method 1: Try with EncodingType.Base64 (properly decodes base64 to binary)
            if (
              legacyFileSystem.EncodingType &&
              legacyFileSystem.EncodingType.Base64
            ) {
              try {
                console.log(
                  "Trying Method 1: Writing with EncodingType.Base64..."
                );
                await legacyFileSystem.writeAsStringAsync(
                  fileUri,
                  base64String,
                  { encoding: legacyFileSystem.EncodingType.Base64 }
                );

                // Verify file was created
                const fileInfo = await legacyFileSystem.getInfoAsync(fileUri);
                if (fileInfo.exists && fileInfo.size > 0) {
                  console.log(
                    "✅ File written successfully with Base64 encoding"
                  );
                  console.log("File size:", fileInfo.size, "bytes");
                  fileWritten = true;
                } else {
                  throw new Error("File was created but has no size");
                }
              } catch (encodingError: any) {
                console.log(
                  "Base64 encoding method failed:",
                  encodingError.message
                );
              }
            }

            // Method 2: Fallback - write base64 string directly (may create text file, but sharing might still work)
            if (!fileWritten) {
              console.log("Trying Method 2: Writing base64 string directly...");
              try {
                await legacyFileSystem.writeAsStringAsync(
                  fileUri,
                  base64String
                );

                // Verify the file was created
                const fileInfo = await legacyFileSystem.getInfoAsync(fileUri);
                if (fileInfo.exists) {
                  console.log("✅ File written (as base64 string)");
                  console.log("File size:", fileInfo.size, "bytes");
                  fileWritten = true;
                } else {
                  throw new Error("File was not created");
                }
              } catch (writeError: any) {
                console.error("Binary write failed:", writeError.message);
                throw writeError;
              }
            }

            if (!fileWritten) {
              throw new Error("Failed to write file using any method");
            }

            console.log("=== SAVING FILE ===");
            console.log("File URI to save:", fileUri);
            console.log("MIME Type:", mimeType);

            // Verify file exists before saving
            const fileInfo = await legacyFileSystem.getInfoAsync(fileUri);
            console.log("File exists:", fileInfo.exists);
            console.log("File size:", fileInfo.size);

            // Check if it's an image - save to gallery
            const isImage = mimeType.startsWith("image/");

            if (isImage) {
              console.log("File is an image, attempting to save to gallery...");
              try {
                // Request media library permissions
                const { status } = await MediaLibrary.requestPermissionsAsync();
                console.log("Media library permission status:", status);

                if (status === "granted") {
                  // Save image to gallery
                  const asset = await MediaLibrary.createAssetAsync(fileUri);
                  console.log("✅ Image saved to gallery successfully");
                  console.log("Asset ID:", asset.id);
                  console.log("Asset URI:", asset.uri);

                  // Also show share dialog
                  if (await Sharing.isAvailableAsync()) {
                    console.log("Showing share dialog as well...");
                    try {
                      await Sharing.shareAsync(fileUri, {
                        mimeType: mimeType,
                        dialogTitle: `Share ${sanitizedDocType}`,
                      });
                      Alert.alert(
                        "Success",
                        "Image saved to gallery and ready to share!"
                      );
                    } catch (shareError: any) {
                      console.log(
                        "Share dialog failed, but image is saved:",
                        shareError.message
                      );
                      Alert.alert(
                        "Success",
                        "Image saved to gallery successfully!"
                      );
                    }
                  } else {
                    Alert.alert(
                      "Success",
                      "Image saved to gallery successfully!"
                    );
                  }
                } else {
                  console.log(
                    "Media library permission denied, falling back to share only"
                  );
                  // Permission denied - just share the file
                  if (await Sharing.isAvailableAsync()) {
                    try {
                      await Sharing.shareAsync(fileUri, {
                        mimeType: mimeType,
                        dialogTitle: `Share ${sanitizedDocType}`,
                      });
                      Alert.alert(
                        "Success",
                        "Document shared. To save to gallery, please grant media library permissions."
                      );
                    } catch (shareError: any) {
                      Alert.alert(
                        "Error",
                        "Unable to save or share image. Please check permissions."
                      );
                    }
                  } else {
                    Alert.alert(
                      "Info",
                      "Please grant media library permissions to save images to gallery."
                    );
                  }
                }
              } catch (mediaError: any) {
                console.error("Error saving to gallery:", mediaError.message);
                console.error("Media error stack:", mediaError.stack);

                // Fallback to sharing if gallery save fails
                console.log("Falling back to share dialog...");
                if (await Sharing.isAvailableAsync()) {
                  try {
                    await Sharing.shareAsync(fileUri, {
                      mimeType: mimeType,
                      dialogTitle: `Share ${sanitizedDocType}`,
                    });
                    Alert.alert("Success", "Document shared successfully");
                  } catch (shareError: any) {
                    Alert.alert("Error", "Unable to save or share document");
                  }
                } else {
                  Alert.alert("Error", "Unable to save image to gallery");
                }
              }
            } else {
              // Not an image - just share (PDFs, etc.)
              console.log("File is not an image, using share dialog only...");
              if (await Sharing.isAvailableAsync()) {
                try {
                  await Sharing.shareAsync(fileUri, {
                    mimeType: mimeType,
                    dialogTitle: `Share ${sanitizedDocType}`,
                  });
                  console.log("✅ Document shared successfully");
                  Alert.alert("Success", "Document shared successfully");
                } catch (shareError: any) {
                  console.error("Sharing failed:", shareError.message);
                  // If sharing fails, try opening the data URL directly
                  console.log("Attempting to open data URL as fallback...");
                  try {
                    const canOpen = await Linking.canOpenURL(fileUrl);
                    if (canOpen) {
                      await Linking.openURL(fileUrl);
                      console.log("✅ Document opened in viewer");
                      Alert.alert("Success", "Document opened in viewer");
                    } else {
                      Alert.alert(
                        "Error",
                        "Unable to share document. File saved to cache."
                      );
                    }
                  } catch (openError) {
                    Alert.alert(
                      "Info",
                      `File saved but unable to share. Location: ${fileUri}`
                    );
                  }
                }
              } else {
                console.log("Sharing not available, trying to open data URL");
                const canOpen = await Linking.canOpenURL(fileUrl);
                if (canOpen) {
                  await Linking.openURL(fileUrl);
                  console.log("✅ Document opened in viewer");
                  Alert.alert("Success", "Document opened in viewer");
                } else {
                  console.log("Cannot open data URL, showing file location");
                  Alert.alert("Info", `File saved to: ${fileUri}`);
                }
              }
            }
          } catch (fileError: any) {
            console.error("=== FILE WRITE ERROR ===");
            console.error("Error details:", fileError.message);
            console.error("Error stack:", fileError.stack);

            // Last resort: try sharing the data URL directly (some versions of expo-sharing support this)
            try {
              console.log(
                "Attempting to share data URL directly as last resort..."
              );
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUrl);
                Alert.alert("Success", "Document shared successfully");
              } else {
                throw new Error("Sharing not available");
              }
            } catch (finalError: any) {
              console.error("Final fallback failed:", finalError);
              Alert.alert(
                "Error",
                `Unable to save document: ${fileError.message}`
              );
            }
          }
        } catch (error: any) {
          console.error("=== DOWNLOAD ERROR ===");
          console.error("Property ID:", property?.propertyId);
          console.error("Property Title:", property?.propertyTitle);
          console.error("Document Type:", documentType);
          console.error("File Index:", index);
          console.error("Error Message:", error.message);
          console.error("Error Stack:", error.stack);
          console.error("Full Error:", JSON.stringify(error, null, 2));

          // Last resort: try opening the data URL
          try {
            console.log("Attempting to open data URL as fallback...");
            const canOpen = await Linking.canOpenURL(fileUrl);
            if (canOpen) {
              await Linking.openURL(fileUrl);
              console.log("✅ Document opened in viewer");
              Alert.alert("Success", "Document opened in viewer");
            } else {
              console.log("❌ Cannot open data URL");
              Alert.alert(
                "Error",
                error.message || "Unable to save or open document"
              );
            }
          } catch (openError) {
            console.error("Even fallback failed:", openError);
            Alert.alert(
              "Error",
              "Unable to process document. Please try again."
            );
          }
        } finally {
          console.log("=== DOWNLOAD DOCUMENT END ===");
          setDownloadingDoc(null);
        }
      } else {
        // Regular URL - try to download and share
        console.log("=== REGULAR URL DOWNLOAD ===");
        console.log("Property ID:", property?.propertyId);
        console.log("Property Title:", property?.propertyTitle);
        console.log("Document Type:", documentType);
        console.log("File Index:", index);
        console.log("File URL (first 200 chars):", fileUrl?.substring(0, 200));
        console.log("File URL is regular URL (not data:)");

        const safeDocType = documentType || "Document";
        const sanitizedDocType = safeDocType
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 50);
        const fileName = `${sanitizedDocType}_${index + 1}`;
        console.log("File Name for regular URL:", fileName);

        // Get cache directory using legacy API
        const legacyFileSystem2 = require("expo-file-system/legacy");
        const cacheDir =
          legacyFileSystem2.cacheDirectory ||
          legacyFileSystem2.documentDirectory;

        console.log("Cache Directory (regular URL):", cacheDir);

        if (!cacheDir) {
          console.error("❌ Cache directory not available for regular URL");
          Alert.alert("Error", "Unable to access file system");
          setDownloadingDoc(null);
          return;
        }

        const fileUri =
          cacheDir.endsWith("/") || cacheDir.endsWith("\\")
            ? `${cacheDir}${fileName}`
            : `${cacheDir}/${fileName}`;

        console.log("File URI (regular URL):", fileUri);

        try {
          // Use legacy API for download as well
          console.log("Attempting to download regular URL...");
          const legacyFileSystem = require("expo-file-system/legacy");
          const downloadResult = await legacyFileSystem.downloadAsync(
            fileUrl,
            fileUri
          );
          console.log("✅ Regular URL downloaded successfully");
          console.log("Downloaded file URI:", downloadResult.uri);

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadResult.uri);
            Alert.alert("Success", "Document shared successfully");
          } else {
            // Fallback: open in browser
            const supported = await Linking.canOpenURL(fileUrl);
            if (supported) {
              await Linking.openURL(fileUrl);
            } else {
              Alert.alert("Error", "Cannot open this file type");
            }
          }
        } catch (downloadError) {
          // If download fails, try opening URL directly
          const supported = await Linking.canOpenURL(fileUrl);
          if (supported) {
            await Linking.openURL(fileUrl);
          } else {
            throw downloadError;
          }
        }
      }
    } catch (error: any) {
      console.error("=== FINAL ERROR HANDLER ===");
      console.error("Property ID:", property?.propertyId);
      console.error("Document Type:", documentType);
      console.error("File Index:", index);
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      Alert.alert("Error", error.message || "Failed to download document");
    } finally {
      console.log("=== DOWNLOAD FUNCTION COMPLETE ===");
      setDownloadingDoc(null);
    }
  };

  const handleVerifyDocument = async () => {
    if (!property || !user?.token) return;

    Alert.alert(
      "Verify Document",
      "Are you sure you want to verify this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: async () => {
            try {
              await propertyAPI.updateNotaryStatus(
                property.propertyId,
                "verified",
                "Document verified successfully",
                user.token
              );

              await fetchPropertyDetails();
              Alert.alert("Success", "Document verified successfully");
            } catch (error: any) {
              console.error("Error verifying document:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to verify document"
              );
            }
          },
        },
      ]
    );
  };

  const handleRejectDocument = async () => {
    if (!property || !user?.token) return;

    Alert.alert(
      "Reject Document",
      "Are you sure you want to reject this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              await propertyAPI.updateNotaryStatus(
                property.propertyId,
                "rejected",
                "Document rejected by notary",
                user.token
              );

              await fetchPropertyDetails();
              Alert.alert("Success", "Document rejected");
            } catch (error: any) {
              console.error("Error rejecting document:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to reject document"
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading property details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Property not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = property.legalDocuments.notaryStatus;
  const statusColor =
    status === "pending" || status === "under-review"
      ? realEstateColors.orange[600]
      : status === "verified"
      ? realEstateColors.green[600]
      : realEstateColors.red[600];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>Property Documents</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Image */}
        <View style={styles.imageContainer}>
          {property.propertyImages && property.propertyImages.length > 0 ? (
            <Image
              source={{ uri: property.propertyImages[0] }}
              style={styles.propertyImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="home"
                size={64}
                color={realEstateColors.gray[400]}
              />
            </View>
          )}
          <View style={styles.imageOverlay}>
            <Text style={styles.propertyPrice}>
              ${property.propertyPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Property Basic Info */}
        <Card style={styles.card}>
          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Ionicons
                name={
                  status === "pending" || status === "under-review"
                    ? "time-outline"
                    : status === "verified"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={16}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.propertyTitle}>{property.propertyTitle}</Text>
          <Text style={styles.propertyType}>
            {property.propertyType.toUpperCase()}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.locationText}>{property.propertyAddress}</Text>
          </View>

          {property.bedrooms && (
            <View style={styles.propertyDetails}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="bed-outline"
                  size={20}
                  color={realEstateColors.gray[700]}
                />
                <Text style={styles.detailText}>
                  {property.bedrooms} Bedrooms
                </Text>
              </View>
              {property.bathrooms && (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="water-outline"
                    size={20}
                    color={realEstateColors.gray[700]}
                  />
                  <Text style={styles.detailText}>
                    {property.bathrooms} Bathrooms
                  </Text>
                </View>
              )}
              {property.area && (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="resize-outline"
                    size={20}
                    color={realEstateColors.gray[700]}
                  />
                  <Text style={styles.detailText}>{property.area} sq ft</Text>
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Property Description */}
        {property.description && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </Card>
        )}

        {/* Seller Information */}
        {property.seller && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerRow}>
                <Ionicons
                  name="person"
                  size={18}
                  color={realEstateColors.primary[600]}
                />
                <Text style={styles.sellerText}>{property.seller.name}</Text>
              </View>
              <View style={styles.sellerRow}>
                <Ionicons
                  name="mail"
                  size={18}
                  color={realEstateColors.primary[600]}
                />
                <Text style={styles.sellerText}>{property.seller.email}</Text>
              </View>
              {property.seller.phone && (
                <View style={styles.sellerRow}>
                  <Ionicons
                    name="call"
                    size={18}
                    color={realEstateColors.primary[600]}
                  />
                  <Text style={styles.sellerText}>{property.seller.phone}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Legal Documents Section */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Legal Documents</Text>
          <Text style={styles.subsectionText}>
            Submitted on:{" "}
            {property.legalDocuments.submittedAt
              ? new Date(
                  property.legalDocuments.submittedAt
                ).toLocaleDateString()
              : "N/A"}
          </Text>

          {property.legalDocuments.documents &&
          property.legalDocuments.documents.length > 0 ? (
            <View style={styles.documentsList}>
              {property.legalDocuments.documents.map((doc, docIndex) => {
                const docType = doc.documentType || `Document_${docIndex + 1}`;
                return (
                  <View key={docIndex} style={styles.documentItem}>
                    <View style={styles.documentItemHeader}>
                      <View style={styles.documentIconContainer}>
                        <Ionicons
                          name="document-text"
                          size={24}
                          color={realEstateColors.primary[600]}
                        />
                      </View>
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentType}>{docType}</Text>
                        <Text style={styles.documentCount}>
                          {doc.files.length} file
                          {doc.files.length > 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.filesList}>
                      {doc.files.map((file, fileIndex) => (
                        <Pressable
                          key={fileIndex}
                          style={styles.fileItem}
                          onPress={() =>
                            downloadDocument(docType, file, fileIndex)
                          }
                          disabled={
                            downloadingDoc === `${docType}-${fileIndex}`
                          }
                        >
                          <Ionicons
                            name="download-outline"
                            size={20}
                            color={realEstateColors.primary[600]}
                          />
                          <Text style={styles.fileText} numberOfLines={1}>
                            {docType} - File {fileIndex + 1}
                            {downloadingDoc === `${docType}-${fileIndex}` &&
                              " (Downloading...)"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noDocumentsText}>No documents available</Text>
          )}
        </Card>

        {/* Action Buttons (only for pending/under-review) */}
        {(status === "pending" || status === "under-review") && (
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectDocument}
            >
              <Ionicons
                name="close"
                size={20}
                color={realEstateColors.red[600]}
              />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.verifyButton]}
              onPress={handleVerifyDocument}
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={realEstateColors.white}
              />
              <Text style={styles.verifyButtonText}>Verify</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
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
  headerGradient: {
    paddingTop: spacing.lg,
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
  imageContainer: {
    position: "relative",
    height: 300,
  },
  propertyImage: {
    width: width,
    height: 300,
  },
  imagePlaceholder: {
    width: width,
    height: 300,
    backgroundColor: realEstateColors.gray[200],
    alignItems: "center",
    justifyContent: "center",
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
  card: {
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    ...shadows.md,
  },
  statusBadgeContainer: {
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyType: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    flex: 1,
  },
  propertyDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
  },
  subsectionText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    lineHeight: 22,
  },
  sellerInfo: {
    gap: spacing.md,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sellerText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    flex: 1,
  },
  documentsList: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  documentItem: {
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  documentItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  documentCount: {
    fontSize: 12,
    color: realEstateColors.gray[600],
  },
  filesList: {
    gap: spacing.sm,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    backgroundColor: realEstateColors.gray[50],
    borderRadius: 8,
    gap: spacing.sm,
  },
  fileText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    flex: 1,
  },
  noDocumentsText: {
    fontSize: 14,
    color: realEstateColors.gray[500],
    fontStyle: "italic",
    textAlign: "center",
    padding: spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  rejectButton: {
    backgroundColor: realEstateColors.red[50],
    borderWidth: 1,
    borderColor: realEstateColors.red[200],
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.red[600],
  },
  verifyButton: {
    backgroundColor: realEstateColors.green[600],
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.white,
  },
});
