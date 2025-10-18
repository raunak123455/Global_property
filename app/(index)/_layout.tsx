import React from "react";
import { useNetworkState } from "expo-network";
import { Redirect, router, Stack } from "expo-router";
import { Alert } from "react-native";
import { Button } from "@/components/button";
import { WidgetProvider } from "@/contexts/WidgetContext";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function AppIndexLayout() {
  const networkState = useNetworkState();

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

//   if (!user) {
//     return <Redirect href="/(auth)" />;
//   }

  return (
        <WidgetProvider>
            <Stack
              screenOptions={{
                headerShown: false, // Hide the header
                ...(process.env.EXPO_OS !== "ios"
                  ? {}
                  : {
                      headerLargeTitle: true,
                      headerTransparent: true,
                      headerBlurEffect: "systemChromeMaterial",
                      headerLargeTitleShadowVisible: false,
                      headerShadowVisible: true,
                      headerLargeStyle: {
                        // NEW: Make the large title transparent to match the background.
                        backgroundColor: "transparent",
                      },
                    }),
              }}
            >
              {/* Modal Demo Screens - These are configured in their individual screen files */}
            </Stack>
        </WidgetProvider>
  );
}