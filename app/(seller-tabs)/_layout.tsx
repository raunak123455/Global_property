import React from "react";
import { Tabs } from "expo-router";
import { IconSymbol } from "@/components/IconSymbol";
import { realEstateColors } from "@/constants/RealEstateColors";

export default function SellerTabLayout() {
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
        name="seller-dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-properties"
        options={{
          title: "My Properties",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="building.2" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-property"
        options={{
          title: "Add Property",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="plus" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="property-inquiries"
        options={{
          title: "Inquiries",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="message" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="seller-profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-property"
        options={{
          href: null, // This hides the screen from the tab bar
        }}
      />
    </Tabs>
  );
}
