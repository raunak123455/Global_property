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
import { router } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { realEstateColors, spacing } from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";

export default function SellerProfile() {
  const { user, logout } = useUser();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    company: "",
    licenseNumber: "",
  });

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
    <Pressable style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemContent}>
        <View style={styles.profileItemLeft}>
          {icon && (
            <View style={styles.profileItemIcon}>
              <IconSymbol
                name={icon}
                size={20}
                color={realEstateColors.primary[600]}
              />
            </View>
          )}
          <View style={styles.profileItemText}>
            <Text style={styles.profileItemLabel}>{label}</Text>
            <Text style={styles.profileItemValue}>{value}</Text>
          </View>
        </View>
        <IconSymbol
          name="chevron.right"
          size={16}
          color={realEstateColors.gray[400]}
        />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <IconSymbol
                name="person.fill"
                size={32}
                color={realEstateColors.white}
              />
            </View>
            <Pressable style={styles.editAvatarButton}>
              <IconSymbol
                name="camera"
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
            <Text style={styles.roleText}>Seller</Text>
          </View>
        </View>

        <ProfileSection title="Account Information">
          <Card style={styles.sectionCard}>
            <ProfileItem
              label="First Name"
              value={profileData.firstName}
              icon="person"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Last Name"
              value={profileData.lastName}
              icon="person"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Email"
              value={profileData.email}
              icon="envelope"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Phone"
              value={profileData.phone || "Not provided"}
              icon="phone"
            />
          </Card>
        </ProfileSection>

        <ProfileSection title="Professional Information">
          <Card style={styles.sectionCard}>
            <ProfileItem
              label="Company"
              value={profileData.company || "Not provided"}
              icon="building"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="License Number"
              value={profileData.licenseNumber || "Not provided"}
              icon="doc.text"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Bio"
              value={profileData.bio || "Not provided"}
              icon="text.alignleft"
            />
          </Card>
        </ProfileSection>

        <ProfileSection title="Settings">
          <Card style={styles.sectionCard}>
            <ProfileItem
              label="Notifications"
              value="Manage notification preferences"
              icon="bell"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Privacy"
              value="Manage privacy settings"
              icon="lock"
            />
            <View style={styles.divider} />
            <ProfileItem
              label="Help & Support"
              value="Get help and contact support"
              icon="questionmark.circle"
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

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <IconSymbol
              name="arrow.right.square"
              size={20}
              color={realEstateColors.red[600]}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
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
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: realEstateColors.white,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: realEstateColors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: realEstateColors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: realEstateColors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: realEstateColors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.primary[700],
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
  },
  profileItem: {
    paddingVertical: spacing.md,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: realEstateColors.red[200],
    backgroundColor: realEstateColors.red[50],
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.red[600],
  },
});
