import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, Stack } from "expo-router";
import { CustomButton } from "@/components/ui/CustomButton";
import { realEstateColors, spacing, borderRadius } from '@/constants/RealEstateColors';

export default function KycModal() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "KYC Verification Required",
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
      <Pressable style={styles.backdrop} onPress={() => router.back()}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>KYC Verification Required</Text>
            </View>
            <Text style={styles.description}>
              Please complete your KYC verification before purchasing properties.
            </Text>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Complete Verification"
                onPress={() => {
                  // Navigate to KYC verification screen
                  router.replace("/(tabs)/kyc-verification");
                }}
                style={styles.button}
              />
              <CustomButton
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
                style={styles.button}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  container: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: realEstateColors.gray[900],
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.lg,
    color: realEstateColors.gray[700],
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});