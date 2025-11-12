import React from "react";
import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { realEstateColors } from "@/constants/RealEstateColors";

export default function NotaryTabLayout() {
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
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
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
    </Tabs>
  );
}
