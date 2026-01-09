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

interface Appointment {
  id: string;
  title: string;
  clientName: string;
  date: string;
  time: string;
  location: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
}

export default function Appointments() {
  const { user, isLoading: userLoading } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [userLoading, user]);

  const fetchAppointments = async () => {
    try {
      // TODO: Implement API call to fetch appointments
      // For now, using mock data
      const mockAppointments: Appointment[] = [
        {
          id: "1",
          title: "Property Sale Signing",
          clientName: "John Doe",
          date: "2024-01-20",
          time: "10:00 AM",
          location: "123 Main St, City, State",
          type: "Property Sale",
          status: "upcoming",
          notes: "Bring all required documents",
        },
        {
          id: "2",
          title: "Lease Agreement",
          clientName: "Jane Smith",
          date: "2024-01-18",
          time: "2:00 PM",
          location: "456 Oak Ave, City, State",
          type: "Lease",
          status: "completed",
        },
        {
          id: "3",
          title: "Power of Attorney",
          clientName: "Bob Johnson",
          date: "2024-01-22",
          time: "11:30 AM",
          location: "Office - 789 Business Blvd",
          type: "POA",
          status: "upcoming",
        },
        {
          id: "4",
          title: "Mortgage Documents",
          clientName: "Alice Brown",
          date: "2024-01-15",
          time: "3:00 PM",
          location: "789 Elm St, City, State",
          type: "Mortgage",
          status: "completed",
        },
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Alert.alert("Error", "Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    Alert.alert("Complete Appointment", "Mark this appointment as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: () => {
          setAppointments(
            appointments.map((apt) =>
              apt.id === appointmentId
                ? { ...apt, status: "completed" as const }
                : apt
            )
          );
          Alert.alert("Success", "Appointment marked as completed");
        },
      },
    ]);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            setAppointments(
              appointments.map((apt) =>
                apt.id === appointmentId
                  ? { ...apt, status: "cancelled" as const }
                  : apt
              )
            );
            Alert.alert("Success", "Appointment cancelled");
          },
        },
      ]
    );
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return realEstateColors.blue[600];
      case "completed":
        return realEstateColors.green[600];
      case "cancelled":
        return realEstateColors.red[600];
      default:
        return realEstateColors.gray[600];
    }
  };

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return "time";
      case "completed":
        return "checkmark-circle";
      case "cancelled":
        return "close-circle";
      default:
        return "calendar";
    }
  };

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((apt) => apt.status === filter);

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

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card style={[styles.appointmentCard, shadows.md]}>
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentIconContainer}>
          <LinearGradient
            colors={[
              realEstateColors.blue[600] + "20",
              realEstateColors.blue[600] + "10",
            ]}
            style={styles.appointmentIcon}
          >
            <Ionicons
              name="calendar"
              size={24}
              color={realEstateColors.blue[600]}
            />
          </LinearGradient>
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentTitle}>{appointment.title}</Text>
          <Text style={styles.appointmentType}>{appointment.type}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(appointment.status) + "20" },
          ]}
        >
          <Ionicons
            name={getStatusIcon(appointment.status)}
            size={16}
            color={getStatusColor(appointment.status)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(appointment.status) },
            ]}
          >
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons
            name="person"
            size={16}
            color={realEstateColors.gray[600]}
          />
          <Text style={styles.detailText}>{appointment.clientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={realEstateColors.gray[600]}
          />
          <Text style={styles.detailText}>
            {appointment.date} at {appointment.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons
            name="location"
            size={16}
            color={realEstateColors.gray[600]}
          />
          <Text style={styles.detailText}>{appointment.location}</Text>
        </View>
        {appointment.notes && (
          <View style={styles.detailRow}>
            <Ionicons
              name="document-text"
              size={16}
              color={realEstateColors.gray[600]}
            />
            <Text style={styles.detailText}>{appointment.notes}</Text>
          </View>
        )}
      </View>

      {appointment.status === "upcoming" && (
        <View style={styles.appointmentActions}>
          <Pressable
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelAppointment(appointment.id)}
          >
            <Ionicons
              name="close"
              size={20}
              color={realEstateColors.red[600]}
            />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteAppointment(appointment.id)}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={realEstateColors.white}
            />
            <Text style={styles.completeButtonText}>Complete</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={[realEstateColors.blue[600], realEstateColors.blue[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Appointments</Text>
              <Text style={styles.subtitle}>
                Manage your schedule and meetings
              </Text>
            </View>
            <View style={styles.headerIconContainer}>
              <Ionicons
                name="calendar"
                size={28}
                color={realEstateColors.white}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Summary */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[styles.statValue, { color: realEstateColors.blue[600] }]}
            >
              {appointments.filter((a) => a.status === "upcoming").length}
            </Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[styles.statValue, { color: realEstateColors.green[600] }]}
            >
              {appointments.filter((a) => a.status === "completed").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text
              style={[styles.statValue, { color: realEstateColors.red[600] }]}
            >
              {appointments.filter((a) => a.status === "cancelled").length}
            </Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        {/* Filters Section */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Filter Appointments</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <FilterButton label="All" value="all" count={appointments.length} />
            <FilterButton
              label="Upcoming"
              value="upcoming"
              count={appointments.filter((a) => a.status === "upcoming").length}
            />
            <FilterButton
              label="Completed"
              value="completed"
              count={
                appointments.filter((a) => a.status === "completed").length
              }
            />
            <FilterButton
              label="Cancelled"
              value="cancelled"
              count={
                appointments.filter((a) => a.status === "cancelled").length
              }
            />
          </ScrollView>
        </View>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={realEstateColors.gray[400]}
            />
            <Text style={styles.emptyStateTitle}>No Appointments Found</Text>
            <Text style={styles.emptyStateText}>
              There are no {filter !== "all" ? filter : ""} appointments at the
              moment
            </Text>
          </View>
        ) : (
          <View style={styles.appointmentsContainer}>
            {filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.fab}>
        <GradientButton
          title="Schedule Appointment"
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Appointment scheduling will be available soon"
            )
          }
          leftIcon={
            <Ionicons name="add" size={20} color={realEstateColors.white} />
          }
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
  // Enhanced Header Styles
  headerGradient: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "500",
  },
  // Stats Bar
  statsBar: {
    flexDirection: "row",
    backgroundColor: realEstateColors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "space-around",
    ...shadows.md,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[100],
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: realEstateColors.gray[600],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: realEstateColors.gray[200],
  },
  // Filter Section
  filterContainer: {
    backgroundColor: realEstateColors.white,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: realEstateColors.gray[200],
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: 24,
    backgroundColor: realEstateColors.gray[100],
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 85,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: realEstateColors.blue[600],
    borderColor: realEstateColors.blue[700],
    ...shadows.sm,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: realEstateColors.gray[700],
    letterSpacing: 0.3,
  },
  filterButtonTextActive: {
    color: realEstateColors.white,
  },
  scrollView: {
    flex: 1,
  },
  appointmentsContainer: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100, // Space for FAB
  },
  appointmentCard: {
    padding: spacing.lg,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  appointmentIconContainer: {
    marginRight: spacing.md,
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  appointmentType: {
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
  appointmentDetails: {
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
  appointmentActions: {
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
  cancelButton: {
    backgroundColor: realEstateColors.red[50],
    borderWidth: 1,
    borderColor: realEstateColors.red[200],
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.red[600],
  },
  completeButton: {
    backgroundColor: realEstateColors.green[600],
  },
  completeButtonText: {
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
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
});
