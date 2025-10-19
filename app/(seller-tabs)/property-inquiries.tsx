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
import { router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { realEstateColors, spacing } from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";

export default function PropertyInquiries() {
  const { user } = useUser();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInquiries = async () => {
    try {
      // TODO: Implement inquiry API
      // For now, using mock data
      const mockInquiries = [
        {
          id: "1",
          propertyTitle: "Modern Downtown Apartment",
          buyerName: "John Smith",
          buyerEmail: "john@example.com",
          message:
            "I'm interested in viewing this property. When is it available?",
          date: "2024-01-15",
          status: "new",
        },
        {
          id: "2",
          propertyTitle: "Family House with Garden",
          buyerName: "Sarah Johnson",
          buyerEmail: "sarah@example.com",
          message: "Could you provide more details about the neighborhood?",
          date: "2024-01-14",
          status: "responded",
        },
      ];
      setInquiries(mockInquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      Alert.alert("Error", "Failed to load inquiries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return realEstateColors.blue[600];
      case "responded":
        return realEstateColors.green[600];
      case "closed":
        return realEstateColors.gray[600];
      default:
        return realEstateColors.gray[600];
    }
  };

  const InquiryCard = ({ inquiry }: { inquiry: any }) => (
    <Card style={styles.inquiryCard}>
      <View style={styles.inquiryHeader}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {inquiry.propertyTitle}
          </Text>
          <Text style={styles.inquiryDate}>{inquiry.date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(inquiry.status) },
          ]}
        >
          <Text style={styles.statusText}>{inquiry.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.buyerInfo}>
        <View style={styles.buyerAvatar}>
          <IconSymbol
            name="person.fill"
            size={20}
            color={realEstateColors.white}
          />
        </View>
        <View style={styles.buyerDetails}>
          <Text style={styles.buyerName}>{inquiry.buyerName}</Text>
          <Text style={styles.buyerEmail}>{inquiry.buyerEmail}</Text>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{inquiry.message}</Text>
      </View>

      <View style={styles.inquiryActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Reply functionality will be available soon"
            )
          }
        >
          <IconSymbol
            name="arrowshape.turn.up.left"
            size={16}
            color={realEstateColors.primary[600]}
          />
          <Text style={styles.actionText}>Reply</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.viewButton]}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Property details will be available soon"
            )
          }
        >
          <IconSymbol name="eye" size={16} color={realEstateColors.gray[600]} />
          <Text style={[styles.actionText, styles.viewText]}>
            View Property
          </Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Property Inquiries</Text>
        <Text style={styles.subtitle}>
          Manage buyer inquiries for your properties
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {inquiries.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="message"
              size={64}
              color={realEstateColors.gray[400]}
            />
            <Text style={styles.emptyTitle}>No Inquiries Yet</Text>
            <Text style={styles.emptySubtitle}>
              When buyers show interest in your properties, their inquiries will
              appear here
            </Text>
            <GradientButton
              title="View My Properties"
              onPress={() => router.push("/(seller-tabs)/my-properties")}
              style={styles.emptyButton}
            />
          </View>
        ) : (
          <View style={styles.inquiriesList}>
            {inquiries.map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
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
    fontSize: 16,
    color: realEstateColors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  inquiriesList: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  inquiryCard: {
    marginBottom: spacing.md,
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  inquiryDate: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  statusText: {
    color: realEstateColors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  buyerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  buyerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: realEstateColors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  buyerDetails: {
    flex: 1,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: 2,
  },
  buyerEmail: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  messageContainer: {
    backgroundColor: realEstateColors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  messageText: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    lineHeight: 20,
  },
  inquiryActions: {
    flexDirection: "row",
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
  viewButton: {
    borderColor: realEstateColors.gray[300],
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: realEstateColors.primary[600],
  },
  viewText: {
    color: realEstateColors.gray[600],
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
    lineHeight: 24,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
  },
});
