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
      icon: "person.circle",
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
      icon: "lock.shield",
      onPress: handlePrivacy,
      showArrow: true,
    },
  ];

  const renderProfileOption = (option: ProfileOption) => (
    <Pressable key={option.id} onPress={option.onPress}>
      <Card style={styles.optionCard}>
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIcon}>
              <IconSymbol
                name={option.icon}
                size={20}
                color={realEstateColors.primary[600]}
              />
            </View>
            <Text style={styles.optionTitle}>{option.title}</Text>
          </View>
          {option.showArrow && (
            <IconSymbol
              name="chevron.right"
              size={16}
              color={realEstateColors.gray[400]}
            />
          )}
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Header title="Profile" />

      {/* Temporary Test: KYC Warning Banner - Positioned on top */}
      {showKycBanner && (
        <KycWarningBanner onDismiss={() => setShowKycBanner(false)} />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: displayUser.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{displayUser.name}</Text>
              <Text style={styles.userEmail}>{displayUser.email}</Text>
              <Text style={styles.userPhone}>{displayUser.phone}</Text>
              {user && (
                <Text style={styles.userRole}>
                  Role:{" "}
                  {displayUser.role.charAt(0).toUpperCase() +
                    displayUser.role.slice(1)}
                </Text>
              )}
              <Text style={styles.memberSince}>
                Member since {displayUser.memberSince}
              </Text>
            </View>
          </View>
          <CustomButton
            title="Edit Profile"
            variant="outline"
            size="sm"
            onPress={handleEditProfile}
            style={styles.editButton}
          />
        </Card>

        {/* Temporary Test Button for KYC Banner */}
        <CustomButton
          title={showKycBanner ? "Hide KYC Banner" : "Show KYC Banner (Test)"}
          onPress={() => setShowKycBanner(!showKycBanner)}
          variant="outline"
          style={styles.testButton}
        />

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map(renderProfileOption)}
        </View>

        {/* Logout Button */}
        <CustomButton
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
          textStyle={styles.logoutText}
        />

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  userRole: {
    fontSize: 14,
    color: realEstateColors.primary[600],
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: 12,
    color: realEstateColors.gray[500],
  },
  editButton: {
    alignSelf: "flex-start",
  },
  testButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    marginBottom: spacing.lg,
  },
  optionCard: {
    marginBottom: spacing.sm,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: realEstateColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: realEstateColors.gray[900],
  },
  logoutButton: {
    borderColor: realEstateColors.error,
    marginBottom: spacing.lg,
  },
  logoutText: {
    color: realEstateColors.error,
  },
  versionText: {
    fontSize: 12,
    color: realEstateColors.gray[400],
    textAlign: "center",
  },
});
