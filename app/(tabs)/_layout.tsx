import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { realEstateColors } from "@/constants/RealEstateColors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: realEstateColors.primary[600],
        tabBarInactiveTintColor: realEstateColors.gray[400],
        tabBarStyle: {
          backgroundColor: realEstateColors.white,
          borderTopWidth: 1,
          borderTopColor: realEstateColors.gray[200],
          paddingBottom: Math.max(insets.bottom, 4),
          paddingTop: 2,
          height: 48 + Math.max(insets.bottom, 4),
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: Platform.OS === "android" ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="magnifyingglass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="property-details"
        options={{
          href: null, // This hides the screen from the tab bar
        }}
      />
      <Tabs.Screen
        name="kyc-verification"
        options={{
          href: null, // This hides the screen from the tab bar
        }}
      />
    </Tabs>
  );
}
