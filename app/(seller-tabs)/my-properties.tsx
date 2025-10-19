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
  Image,
} from "react-native";
import { router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { realEstateColors, spacing } from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { propertyAPI } from "@/utils/api";

export default function MyProperties() {
  const { user } = useUser();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = async () => {
    if (!user?.token) {
      console.error("No user token available");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log("Fetching properties with token:", user.token);
      const response = await propertyAPI.getMyProperties(user.token);
      console.log("Properties response:", response);

      // Handle case where response might be undefined
      if (response && Array.isArray(response)) {
        setProperties(response);
      } else {
        console.log("No properties found or invalid response");
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      Alert.alert("Error", "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const handleDeleteProperty = (propertyId: string) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await propertyAPI.deleteProperty(propertyId, user?.token);
              fetchProperties(); // Refresh the list
              Alert.alert("Success", "Property deleted successfully");
            } catch (error) {
              console.error("Error deleting property:", error);
              Alert.alert("Error", "Failed to delete property");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return realEstateColors.green[600];
      case "sold":
        return realEstateColors.blue[600];
      case "pending":
        return realEstateColors.orange[600];
      case "draft":
        return realEstateColors.gray[600];
      default:
        return realEstateColors.gray[600];
    }
  };

  const PropertyCard = ({ property }: { property: any }) => (
    <Card style={styles.propertyCard}>
      <View style={styles.propertyImageContainer}>
        {property.images && property.images.length > 0 ? (
          <Image
            source={{ uri: property.images[0] }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <IconSymbol
              name="photo"
              size={32}
              color={realEstateColors.gray[400]}
            />
          </View>
        )}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(property.status) },
          ]}
        >
          <Text style={styles.statusText}>{property.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.propertyContent}>
        <Text style={styles.propertyTitle} numberOfLines={2}>
          {property.title}
        </Text>
        <Text style={styles.propertyLocation} numberOfLines={1}>
          {property.location.city}, {property.location.state}
        </Text>
        <Text style={styles.propertyPrice}>
          ${property.price.toLocaleString()}
        </Text>
        <View style={styles.propertyDetails}>
          <View style={styles.detailItem}>
            <IconSymbol
              name="bed.double"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{property.bedrooms}</Text>
          </View>
          <View style={styles.detailItem}>
            <IconSymbol
              name="bathtub"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{property.bathrooms}</Text>
          </View>
          <View style={styles.detailItem}>
            <IconSymbol
              name="square.grid.3x3"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{property.area} sq ft</Text>
          </View>
        </View>
      </View>

      <View style={styles.propertyActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push(`/(seller-tabs)/edit-property?id=${property._id}`)
          }
        >
          <IconSymbol
            name="pencil"
            size={16}
            color={realEstateColors.primary[600]}
          />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProperty(property._id)}
        >
          <IconSymbol
            name="trash"
            size={16}
            color={realEstateColors.red[600]}
          />
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Properties</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(seller-tabs)/add-property")}
        >
          <IconSymbol name="plus" size={20} color={realEstateColors.white} />
          <Text style={styles.addButtonText}>Add Property</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {properties.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="building.2"
              size={64}
              color={realEstateColors.gray[400]}
            />
            <Text style={styles.emptyTitle}>No Properties Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by adding your first property listing
            </Text>
            <GradientButton
              title="Add Your First Property"
              onPress={() => router.push("/(seller-tabs)/add-property")}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.propertiesList}>
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: realEstateColors.white,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: realEstateColors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  addButtonText: {
    color: realEstateColors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  propertiesList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  propertyImageContainer: {
    position: "relative",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: realEstateColors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    color: realEstateColors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  propertyContent: {
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: realEstateColors.primary[600],
    marginBottom: spacing.sm,
  },
  propertyDetails: {
    flexDirection: "row",
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  propertyActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: realEstateColors.primary[600],
    gap: spacing.xs,
  },
  deleteButton: {
    borderColor: realEstateColors.red[600],
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: realEstateColors.primary[600],
  },
  deleteText: {
    color: realEstateColors.red[600],
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
  },
});
