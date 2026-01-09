import React from "react";
import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { realEstateColors } from "@/constants/RealEstateColors";

export default function NotaryTabLayout() {
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
          paddingTop: 4,
          height: 56 + Math.max(insets.bottom, 4),
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
        name="notary-dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="document-verification"
        options={{
          title: "Documents",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="doc.text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Appointments",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notary-profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="property-document-details"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
