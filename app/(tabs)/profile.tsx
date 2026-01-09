import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { CustomButton } from "@/components/ui/CustomButton";
import { IconSymbol } from "@/components/IconSymbol";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";
import { useUser } from "@/contexts/UserContext";
import { KycWarningBanner } from "@/components/KycWarningBanner";

interface ProfileOption {
  id: string;
  title: string;
  icon: any; // Changed to any to avoid SFSymbols type issues
  onPress: () => void;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const { user, logout, isLoading } = useUser();
  const [showKycBanner, setShowKycBanner] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, user]);

  // Default user data if not logged in
  const defaultUser = {
    name: "Guest User",
    email: "guest@example.com",
    phone: "Not available",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    memberSince: "Not a member",
    role: "guest",
  };

  // Use actual user data if available, otherwise use default
  const displayUser = user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: "+1 (555) 123-4567", // In a real app, this would come from the user object
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        memberSince: "October 2025", // In a real app, this would come from the user's creation date
        role: user.role,
      }
    : defaultUser;

  const handleEditProfile = () => {
    console.log("Edit profile pressed");
    Alert.alert("Edit Profile", "Profile editing feature coming soon!");
  };

  const handleSettings = () => {
    console.log("Settings pressed");
    Alert.alert("Settings", "Settings feature coming soon!");
  };

  const handleSavedSearches = () => {
    console.log("Saved searches pressed");
    Alert.alert("Saved Searches", "Saved searches feature coming soon!");
  };

  const handleHelp = () => {
    console.log("Help pressed");
    Alert.alert("Help & Support", "Help feature coming soon!");
  };

  const handlePrivacy = () => {
    console.log("Privacy pressed");
    Alert.alert("Privacy Policy", "Privacy policy feature coming soon!");
  };

  const handleLogout = () => {
    console.log("Logout pressed");
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

  const profileOptions: ProfileOption[] = [
    {
      id: "1",
      title: "Edit Profile",
      icon: "pencil",
      onPress: handleEditProfile,
      showArrow: true,
    },
    {
      id: "2",
      title: "Saved Searches",
      icon: "bookmark",
      onPress: handleSavedSearches,
      showArrow: true,
    },
    {
      id: "3",
      title: "Settings",
      icon: "gear",
      onPress: handleSettings,
      showArrow: true,
    },
    {
      id: "4",
      title: "Help & Support",
      icon: "questionmark.circle",
      onPress: handleHelp,
      showArrow: true,
    },
    {
      id: "5",
      title: "Privacy Policy",
      icon: "lock.fill",
      onPress: handlePrivacy,
      showArrow: true,
    },
  ];

  const renderProfileOption = (option: ProfileOption) => (
    <Pressable
      key={option.id}
      onPress={option.onPress}
      style={({ pressed }) => [
        styles.optionCard,
        pressed && styles.optionCardPressed,
      ]}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionLeft}>
          <ExpoLinearGradient
            colors={[
              realEstateColors.primary[50],
              realEstateColors.primary[100],
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optionIcon}
          >
            <IconSymbol
              name={option.icon}
              size={22}
              color={realEstateColors.primary[600]}
            />
          </ExpoLinearGradient>
          <Text style={styles.optionTitle}>{option.title}</Text>
        </View>
        {option.showArrow && (
          <View style={styles.arrowContainer}>
            <IconSymbol
              name="chevron.right"
              size={18}
              color={realEstateColors.gray[400]}
            />
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Temporary Test: KYC Warning Banner - Positioned on top */}
      {showKycBanner && (
        <KycWarningBanner onDismiss={() => setShowKycBanner(false)} />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
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
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: displayUser.avatar }}
                style={styles.avatar}
              />
              <View style={styles.avatarBorder} />
              <Pressable
                style={styles.editAvatarButton}
                onPress={handleEditProfile}
              >
                <IconSymbol
                  name="camera.fill"
                  size={16}
                  color={realEstateColors.white}
                />
              </Pressable>
            </View>
            <Text style={styles.userName}>{displayUser.name}</Text>
            <Text style={styles.userEmail}>{displayUser.email}</Text>
            <View style={styles.roleBadge}>
              <IconSymbol
                name="star.fill"
                size={12}
                color={realEstateColors.primary[600]}
                style={styles.roleIcon}
              />
              <Text style={styles.roleText}>
                {displayUser.role.charAt(0).toUpperCase() +
                  displayUser.role.slice(1)}
              </Text>
            </View>
          </View>
        </ExpoLinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.statCardPressed,
            ]}
            onPress={() => router.push("/(tabs)/favorites")}
          >
            <IconSymbol
              name="heart.fill"
              size={24}
              color={realEstateColors.error}
            />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.statCardPressed,
            ]}
            onPress={() => router.push("/(tabs)/search")}
          >
            <IconSymbol
              name="bookmark.fill"
              size={24}
              color={realEstateColors.primary[600]}
            />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.statCard,
              pressed && styles.statCardPressed,
            ]}
            onPress={() => router.push("/(tabs)/notifications")}
          >
            <IconSymbol
              name="bell.fill"
              size={24}
              color={realEstateColors.warning}
            />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </Pressable>
        </View>

        {/* User Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <IconSymbol
              name="phone.fill"
              size={20}
              color={realEstateColors.primary[600]}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{displayUser.phone}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <IconSymbol
              name="calendar"
              size={20}
              color={realEstateColors.primary[600]}
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{displayUser.memberSince}</Text>
            </View>
          </View>
        </Card>

        {/* Profile Options */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settings & Preferences</Text>
        </View>
        <View style={styles.optionsContainer}>
          {profileOptions.map(renderProfileOption)}
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <IconSymbol
            name="rectangle.portrait.and.arrow.right"
            size={20}
            color={realEstateColors.error}
          />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* App Version */}
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
  scrollContainer: {
    paddingBottom: spacing.xl,
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
  roleIcon: {
    marginRight: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.primary[700],
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
  statCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
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
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: realEstateColors.gray[600],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
  },
  infoDivider: {
    height: 1,
    backgroundColor: realEstateColors.gray[200],
    marginVertical: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  optionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  optionCard: {
    backgroundColor: realEstateColors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardPressed: {
    backgroundColor: realEstateColors.gray[50],
    transform: [{ scale: 0.98 }],
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: realEstateColors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: realEstateColors.error,
    backgroundColor: realEstateColors.white,
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
    color: realEstateColors.error,
  },
  versionText: {
    fontSize: 13,
    color: realEstateColors.gray[400],
    textAlign: "center",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
