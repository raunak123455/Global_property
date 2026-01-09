import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { realEstateColors, spacing } from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { KycWarningBanner } from "@/components/KycWarningBanner";

export default function NotaryProfile() {
  const { user, logout, isLoading } = useUser();
  const [showKycBanner, setShowKycBanner] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    licenseNumber: "",
    commissionExpiry: "",
    bondNumber: "",
    jurisdictions: "",
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, user]);

  const updateProfileData = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implement profile update API
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const ProfileSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({
    label,
    value,
    onPress,
    icon,
  }: {
    label: string;
    value: string;
    onPress?: () => void;
    icon?: string;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.profileItem,
        pressed && styles.profileItemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.profileItemContent}>
        <View style={styles.profileItemLeft}>
          {icon && (
            <ExpoLinearGradient
              colors={[
                realEstateColors.primary[50],
                realEstateColors.primary[100],
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileItemIcon}
            >
              <IconSymbol
                name={icon}
                size={22}
                color={realEstateColors.primary[600]}
              />
            </ExpoLinearGradient>
          )}
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemLabel}>{label}</Text>
            <Text style={styles.profileItemValue}>{value}</Text>
          </View>
        </View>
        <View style={styles.arrowContainer}>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={realEstateColors.gray[400]}
          />
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* KYC Warning Banner */}
      {showKycBanner && (
        <KycWarningBanner onDismiss={() => setShowKycBanner(false)} />
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with Gradient Background */}
        <ExpoLinearGradient
          colors={[
            realEstateColors.primary[600],
            realEstateColors.primary[700],
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <Text style={styles.headerTitle}>Notary Profile</Text>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <IconSymbol
                  name="checkmark.seal.fill"
                  size={40}
                  color={realEstateColors.white}
                />
              </View>
              <View style={styles.avatarBorder} />
              <Pressable style={styles.editAvatarButton}>
                <IconSymbol
                  name="camera.fill"
                  size={16}
                  color={realEstateColors.white}
                />
              </Pressable>
            </View>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <IconSymbol
                name="checkmark.seal"
                size={12}
                color={realEstateColors.primary[600]}
              />
              <Text style={styles.roleText}>Certified Notary</Text>
            </View>
          </View>
        </ExpoLinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <IconSymbol
              name="doc.text.fill"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Docs</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol
              name="calendar"
              size={24}
              color={realEstateColors.blue[600]}
            />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Meetings</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={24}
              color={realEstateColors.success}
            />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>

        <ProfileSection title="Account Information">
          <Card style={styles.sectionCard}>
            <ProfileItem
              label="First Name"
              value={profileData.firstName}
              icon="person.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Last Name"
              value={profileData.lastName}
              icon="person.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Email"
              value={profileData.email}
              icon="envelope.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Phone"
              value={profileData.phone || "Not provided"}
              icon="phone.fill"
            />
          </Card>
        </ProfileSection>

        <ProfileSection title="Professional Information">
          <Card style={styles.sectionCard}>
            <ProfileItem
              label="License Number"
              value={profileData.licenseNumber || "Not provided"}
              icon="doc.text.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Commission Expiry"
              value={profileData.commissionExpiry || "Not provided"}
              icon="clock.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Bond Number"
              value={profileData.bondNumber || "Not provided"}
              icon="star.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Jurisdictions"
              value={profileData.jurisdictions || "Not provided"}
              icon="location.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Bio"
              value={profileData.bio || "Not provided"}
              icon="square.and.pencil"
            />
          </Card>
        </ProfileSection>

        <ProfileSection title="Settings">
          <Card style={styles.sectionCard}>
            <ProfileItem
              label="Notifications"
              value="Manage notification preferences"
              icon="bell.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Availability"
              value="Set your working hours"
              icon="clock.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Privacy"
              value="Manage privacy settings"
              icon="lock.fill"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Help & Support"
              value="Get help and contact support"
              icon="questionmark.circle.fill"
            />
          </Card>
        </ProfileSection>

        <View style={styles.actionsSection}>
          <GradientButton
            title="Edit Profile"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Profile editing will be available soon"
              )
            }
            style={styles.actionButton}
          />

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={handleLogout}
          >
            <IconSymbol
              name="rectangle.portrait.and.arrow.right"
              size={20}
              color={realEstateColors.red[600]}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
        <Text style={styles.versionText}>GlobalO6 • Version 1.0.0</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  gradientHeader: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: realEstateColors.white,
    marginBottom: spacing.lg,
  },
  profileHeaderContent: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: realEstateColors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: realEstateColors.white,
  },
  avatarBorder: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    top: -4,
    left: -4,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: realEstateColors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: realEstateColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: spacing.md,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: realEstateColors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.primary[700],
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    marginTop: -spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: realEstateColors.white,
    padding: spacing.md,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: realEstateColors.gray[600],
    marginTop: 2,
    textAlign: "center",
    fontWeight: "500",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionCard: {
    marginHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileItem: {
    paddingVertical: spacing.md,
  },
  profileItemPressed: {
    opacity: 0.7,
  },
  profileItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: realEstateColors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  profileItemText: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 16,
    color: realEstateColors.gray[900],
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: realEstateColors.gray[200],
    marginLeft: 48,
  },
  actionsSection: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: realEstateColors.error,
    backgroundColor: realEstateColors.white,
    gap: spacing.sm,
    shadowColor: realEstateColors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonPressed: {
    backgroundColor: realEstateColors.red[50],
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.red[600],
  },
  versionText: {
    fontSize: 13,
    color: realEstateColors.gray[400],
    textAlign: "center",
    fontWeight: "500",
    marginVertical: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
