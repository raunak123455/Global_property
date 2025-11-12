import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import {
  realEstateColors,
  spacing,
  shadows,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";
import { useLocalSearchParams } from "expo-router";
import { Image } from "react-native";

interface PropertyDocument {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number;
  propertyType: string;
  propertyImages: string[];
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
    documents: any[];
    notes?: string;
    verifiedAt?: string;
  };
  createdAt: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: "pending" | "verified" | "rejected";
  submittedBy: string;
  submittedDate: string;
  propertyAddress?: string;
}

export default function DocumentVerification() {
  const { user, isLoading: userLoading } = useUser();
  const { propertyId } = useLocalSearchParams();
  const [properties, setProperties] = useState<PropertyDocument[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [userLoading, user]);

  const fetchDocuments = async () => {
    try {
      if (!user?.token) return;

      // Fetch properties with submitted legal documents
      const response = await propertyAPI.getPropertiesWithLegalDocuments(
        user.token
      );

      if (response && response.properties) {
        setProperties(response.properties);

        // Convert properties to documents format for backward compatibility
        const docs: Document[] = response.properties.map(
          (prop: PropertyDocument) => ({
            id: prop.propertyId,
            title: prop.propertyTitle,
            type: prop.propertyType,
            status:
              prop.legalDocuments.notaryStatus === "verified"
                ? "verified"
                : prop.legalDocuments.notaryStatus === "rejected"
                ? "rejected"
                : "pending",
            submittedBy: prop.seller?.name || "Unknown",
            submittedDate: prop.legalDocuments.submittedAt
              ? new Date(prop.legalDocuments.submittedAt).toLocaleDateString()
              : new Date(prop.createdAt).toLocaleDateString(),
            propertyAddress: prop.propertyAddress,
          })
        );
        setDocuments(docs);
      } else {
        setProperties([]);
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      Alert.alert("Error", "Failed to load documents");
      setProperties([]);
      setDocuments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDocuments();
    }
  }, [user?.token, propertyId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const handleVerifyDocument = async (propertyId: string) => {
    Alert.alert(
      "Verify Document",
      "Are you sure you want to verify this document?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Verify",
          onPress: async () => {
            try {
              if (!user?.token) {
                Alert.alert("Error", "Authentication required");
                return;
              }

              await propertyAPI.updateNotaryStatus(
                propertyId,
                "verified",
                "Document verified successfully",
                user.token
              );

              // Refresh the list
              await fetchDocuments();
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

  const handleRejectDocument = async (propertyId: string) => {
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
              if (!user?.token) {
                Alert.alert("Error", "Authentication required");
                return;
              }

              await propertyAPI.updateNotaryStatus(
                propertyId,
                "rejected",
                "Document rejected by notary",
                user.token
              );

              // Refresh the list
              await fetchDocuments();
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

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "pending":
        return realEstateColors.orange[600];
      case "verified":
        return realEstateColors.green[600];
      case "rejected":
        return realEstateColors.red[600];
      default:
        return realEstateColors.gray[600];
    }
  };

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "verified":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      default:
        return "document-text";
    }
  };

  // Filter properties based on selected filter
  const filteredProperties =
    filter === "all"
      ? properties
      : properties.filter((prop) => {
          const status = prop.legalDocuments.notaryStatus;
          if (filter === "pending") {
            return status === "pending" || status === "under-review";
          }
          return status === filter;
        });

  const filteredDocuments =
    filter === "all"
      ? documents
      : documents.filter((doc) => doc.status === filter);

  const FilterButton = ({
    label,
    value,
    count,
  }: {
    label: string;
    value: typeof filter;
    count: number;
  }) => {
    const isActive = filter === value;
    return (
      <Pressable
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(value)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label} ({count})
        </Text>
      </Pressable>
    );
  };

  const PropertyDocumentCard = ({
    property,
  }: {
    property: PropertyDocument;
  }) => {
    const status = property.legalDocuments.notaryStatus;
    const statusColor =
      status === "pending" || status === "under-review"
        ? realEstateColors.orange[600]
        : status === "verified"
        ? realEstateColors.green[600]
        : realEstateColors.red[600];

    return (
      <Pressable
        onPress={() =>
          router.push(
            `/(notary-tabs)/property-document-details?propertyId=${property.propertyId}`
          )
        }
      >
        <Card style={[styles.documentCard, shadows.md]}>
          {/* Property Image and Title */}
          <View style={styles.propertyHeader}>
            {property.propertyImages && property.propertyImages.length > 0 ? (
              <Image
                source={{ uri: property.propertyImages[0] }}
                style={styles.propertyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.propertyImagePlaceholder}>
                <Ionicons
                  name="home"
                  size={32}
                  color={realEstateColors.gray[400]}
                />
              </View>
            )}
            <View style={styles.propertyInfo}>
              <Text style={styles.documentTitle}>{property.propertyTitle}</Text>
              <Text style={styles.propertyType}>
                {property.propertyType.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Ionicons
                name={getStatusIcon(
                  status === "pending" || status === "under-review"
                    ? "pending"
                    : (status as any)
                )}
                size={16}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Property and Seller Details */}
          <View style={styles.documentDetails}>
            <View style={styles.detailRow}>
              <Ionicons
                name="location"
                size={16}
                color={realEstateColors.gray[600]}
              />
              <Text style={styles.detailText}>{property.propertyAddress}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons
                name="cash"
                size={16}
                color={realEstateColors.gray[600]}
              />
              <Text style={styles.detailText}>
                ${property.propertyPrice.toLocaleString()}
              </Text>
            </View>
            {property.seller && (
              <>
                <View style={styles.sellerSection}>
                  <Text style={styles.sellerSectionTitle}>
                    Seller Information
                  </Text>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={realEstateColors.gray[600]}
                    />
                    <Text style={styles.detailText}>
                      {property.seller.name}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="mail"
                      size={16}
                      color={realEstateColors.gray[600]}
                    />
                    <Text style={styles.detailText}>
                      {property.seller.email}
                    </Text>
                  </View>
                  {property.seller.phone && (
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="call"
                        size={16}
                        color={realEstateColors.gray[600]}
                      />
                      <Text style={styles.detailText}>
                        {property.seller.phone}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar"
                size={16}
                color={realEstateColors.gray[600]}
              />
              <Text style={styles.detailText}>
                Submitted:{" "}
                {property.legalDocuments.submittedAt
                  ? new Date(
                      property.legalDocuments.submittedAt
                    ).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
            {property.legalDocuments.documents &&
              property.legalDocuments.documents.length > 0 && (
                <View style={styles.documentTypesContainer}>
                  <Text style={styles.documentTypesLabel}>
                    Document Types Submitted:
                  </Text>
                  {property.legalDocuments.documents.map(
                    (doc: any, index: number) => (
                      <Text key={index} style={styles.documentTypeItem}>
                        • {doc.documentType || `Document ${index + 1}`}
                      </Text>
                    )
                  )}
                </View>
              )}
          </View>

          {(status === "pending" || status === "under-review") && (
            <View style={styles.documentActions}>
              <Pressable
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectDocument(property.propertyId)}
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
                onPress={() => handleVerifyDocument(property.propertyId)}
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
        </Card>
      </Pressable>
    );
  };

  const DocumentCard = ({ document }: { document: Document }) => (
    <Card style={[styles.documentCard, shadows.md]}>
      <View style={styles.documentHeader}>
        <View style={styles.documentIconContainer}>
          <LinearGradient
            colors={[
              realEstateColors.primary[600] + "20",
              realEstateColors.primary[600] + "10",
            ]}
            style={styles.documentIcon}
          >
            <Ionicons
              name="document-text"
              size={24}
              color={realEstateColors.primary[600]}
            />
          </LinearGradient>
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <Text style={styles.documentType}>{document.type}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(document.status) + "20" },
          ]}
        >
          <Ionicons
            name={getStatusIcon(document.status)}
            size={16}
            color={getStatusColor(document.status)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(document.status) },
            ]}
          >
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.documentDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="person"
            size={16}
            color={realEstateColors.gray[600]}
          />
          <Text style={styles.detailText}>{document.submittedBy}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar"
            size={16}
            color={realEstateColors.gray[600]}
          />
          <Text style={styles.detailText}>{document.submittedDate}</Text>
        </View>
        {document.propertyAddress && (
          <View style={styles.detailRow}>
            <Ionicons
              name="location"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{document.propertyAddress}</Text>
          </View>
        )}
      </View>

      {document.status === "pending" && (
        <View style={styles.documentActions}>
          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectDocument(document.id)}
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
            onPress={() => handleVerifyDocument(document.id)}
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
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Verification</Text>
        <Text style={styles.subtitle}>Review and verify documents</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterButton label="All" value="all" count={properties.length} />
          <FilterButton
            label="Pending"
            value="pending"
            count={
              properties.filter(
                (p) =>
                  p.legalDocuments.notaryStatus === "pending" ||
                  p.legalDocuments.notaryStatus === "under-review"
              ).length
            }
          />
          <FilterButton
            label="Verified"
            value="verified"
            count={
              properties.filter(
                (p) => p.legalDocuments.notaryStatus === "verified"
              ).length
            }
          />
          <FilterButton
            label="Rejected"
            value="rejected"
            count={
              properties.filter(
                (p) => p.legalDocuments.notaryStatus === "rejected"
              ).length
            }
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={realEstateColors.primary[500]}
          />
        }
      >
        {filteredProperties.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={realEstateColors.gray[400]}
            />
            <Text style={styles.emptyStateTitle}>No Documents Found</Text>
            <Text style={styles.emptyStateText}>
              There are no {filter !== "all" ? filter : ""} properties with
              submitted documents at the moment
            </Text>
          </View>
        ) : (
          <View style={styles.documentsContainer}>
            {filteredProperties.map((property) => (
              <PropertyDocumentCard
                key={property.propertyId}
                property={property}
              />
            ))}
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
  header: {
    padding: spacing.lg,
    backgroundColor: realEstateColors.white,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  filterContainer: {
    backgroundColor: realEstateColors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: realEstateColors.gray[100],
  },
  filterButtonActive: {
    backgroundColor: realEstateColors.primary[600],
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.gray[700],
  },
  filterButtonTextActive: {
    color: realEstateColors.white,
  },
  scrollView: {
    flex: 1,
  },
  documentsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  documentCard: {
    padding: spacing.lg,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  documentIconContainer: {
    marginRight: spacing.md,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  documentType: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  documentDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    flex: 1,
  },
  documentActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  rejectButton: {
    backgroundColor: realEstateColors.red[50],
    borderWidth: 1,
    borderColor: realEstateColors.red[200],
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.red[600],
  },
  verifyButton: {
    backgroundColor: realEstateColors.green[600],
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.white,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    textAlign: "center",
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: spacing.md,
    backgroundColor: realEstateColors.gray[100],
  },
  propertyImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: spacing.md,
    backgroundColor: realEstateColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  propertyInfo: {
    flex: 1,
  },
  propertyType: {
    fontSize: 12,
    color: realEstateColors.gray[500],
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  sellerSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  sellerSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  documentTypesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  documentTypesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  documentTypeItem: {
    fontSize: 13,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
});
