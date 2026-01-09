import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { GradientButton } from "@/components/ui/GradientButton";
import { CustomButton } from "@/components/ui/CustomButton";
import { IconSymbol } from "@/components/IconSymbol";
import {
  realEstateColors,
  spacing,
  borderRadius,
} from "@/constants/RealEstateColors";

export default function TokenPurchaseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const propertyId = params.id as string;
  const propertyTitle = (params.title as string) || "Property";
  const propertyLocation = (params.location as string) || "";
  const tokenPrice = parseFloat(params.tokenPrice as string) || 0;
  const totalTokens = parseInt(params.totalTokens as string) || 0;
  const tokensSold = parseInt(params.tokensSold as string) || 0;
  const totalPropertyPrice = parseFloat(params.totalPrice as string) || 0;

  const tokensAvailable = totalTokens - tokensSold;
  const [selectedTokens, setSelectedTokens] = useState("");
  const [customTokens, setCustomTokens] = useState("");

  // Quick select options (percentages of available tokens)
  const quickSelectOptions = [
    { label: "10%", value: Math.max(1, Math.floor(tokensAvailable * 0.1)) },
    { label: "25%", value: Math.max(1, Math.floor(tokensAvailable * 0.25)) },
    { label: "50%", value: Math.max(1, Math.floor(tokensAvailable * 0.5)) },
    { label: "100%", value: tokensAvailable },
  ].filter((option) => option.value > 0 && option.value <= tokensAvailable);

  const handleQuickSelect = (tokens: number) => {
    setSelectedTokens(tokens.toString());
    setCustomTokens(tokens.toString());
  };

  const handleCustomInput = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    setCustomTokens(numericValue);
    
    if (numericValue) {
      const num = parseInt(numericValue);
      if (num > 0 && num <= tokensAvailable) {
        setSelectedTokens(numericValue);
      } else {
        setSelectedTokens("");
      }
    } else {
      setSelectedTokens("");
    }
  };

  const tokensNum = selectedTokens ? parseInt(selectedTokens) : 0;
  const totalPrice = tokensNum * tokenPrice;
  const ownershipPercentage = totalTokens > 0 ? (tokensNum / totalTokens) * 100 : 0;

  const handleContinue = () => {
    if (!selectedTokens || tokensNum <= 0) {
      Alert.alert("Invalid Selection", "Please select a valid number of tokens.");
      return;
    }

    if (tokensNum > tokensAvailable) {
      Alert.alert(
        "Insufficient Tokens",
        `Only ${tokensAvailable.toLocaleString()} tokens are available.`
      );
      return;
    }

    // Navigate to mortgage calculator with calculated price
    router.push({
      pathname: "/mortgage-calculator",
      params: {
        price: totalPrice.toString(),
        title: propertyTitle,
        location: propertyLocation,
        id: propertyId,
        tokenPurchase: "true",
        tokens: selectedTokens,
        tokenPrice: tokenPrice.toString(),
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Purchase Tokens",
          headerShown: false,
        }}
      />
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Header title="Purchase Fractional Ownership" showBackButton={true} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Info Card */}
          <Card style={styles.propertyCard}>
            <Text style={styles.propertyTitle}>{propertyTitle}</Text>
            <View style={styles.propertyLocationRow}>
              <IconSymbol
                name="location"
                size={16}
                color={realEstateColors.gray[500]}
              />
              <Text style={styles.propertyLocation}>{propertyLocation}</Text>
            </View>
            <View style={styles.propertyPriceRow}>
              <Text style={styles.propertyPriceLabel}>Total Property Value:</Text>
              <Text style={styles.propertyPriceValue}>
                ${totalPropertyPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          </Card>

          {/* Token Information */}
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price per Token</Text>
              <Text style={styles.infoValue}>
                ${tokenPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tokens Available</Text>
              <Text style={styles.infoValue}>
                {tokensAvailable.toLocaleString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Tokens</Text>
              <Text style={styles.infoValue}>
                {totalTokens.toLocaleString()}
              </Text>
            </View>
          </Card>

          {/* Token Selection */}
          <Card style={styles.selectionCard}>
            <Text style={styles.sectionTitle}>Select Number of Tokens</Text>
            <Text style={styles.sectionDescription}>
              Choose how many tokens you want to purchase
            </Text>

            {/* Quick Select Buttons */}
            {quickSelectOptions.length > 0 && (
              <View style={styles.quickSelectContainer}>
                <Text style={styles.quickSelectLabel}>Quick Select:</Text>
                <View style={styles.quickSelectGrid}>
                  {quickSelectOptions.map((option, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.quickSelectButton,
                        selectedTokens === option.value.toString() &&
                          styles.quickSelectButtonActive,
                      ]}
                      onPress={() => handleQuickSelect(option.value)}
                    >
                      <Text
                        style={[
                          styles.quickSelectText,
                          selectedTokens === option.value.toString() &&
                            styles.quickSelectTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.quickSelectSubtext,
                          selectedTokens === option.value.toString() &&
                            styles.quickSelectSubtextActive,
                        ]}
                      >
                        {option.value.toLocaleString()} tokens
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Custom Input */}
            <View style={styles.customInputContainer}>
              <Text style={styles.customInputLabel}>Or enter custom amount:</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.customInput,
                    selectedTokens && tokensNum > 0 && tokensNum <= tokensAvailable
                      ? styles.customInputValid
                      : customTokens && (tokensNum <= 0 || tokensNum > tokensAvailable)
                      ? styles.customInputInvalid
                      : null,
                  ]}
                  value={customTokens}
                  onChangeText={handleCustomInput}
                  placeholder="Enter number of tokens"
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={styles.inputHint}>
                  Max: {tokensAvailable.toLocaleString()} tokens
                </Text>
              </View>
            </View>
          </Card>

          {/* Action Button */}
          <GradientButton
            title={
              selectedTokens && tokensNum > 0
                ? `Continue with ${tokensNum.toLocaleString()} Token${tokensNum > 1 ? "s" : ""}`
                : "Select Tokens to Continue"
            }
            onPress={handleContinue}
            style={styles.continueButton}
          />

          {/* Purchase Summary */}
          {selectedTokens && tokensNum > 0 && tokensNum <= tokensAvailable && (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Purchase Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tokens Selected:</Text>
                <Text style={styles.summaryValue}>
                  {tokensNum.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price per Token:</Text>
                <Text style={styles.summaryValue}>
                  ${tokenPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ownership Percentage:</Text>
                <Text style={styles.summaryValue}>
                  {ownershipPercentage.toFixed(2)}%
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTotalRow}>
                <Text style={styles.summaryTotalLabel}>Total Investment:</Text>
                <Text style={styles.summaryTotalValue}>
                  ${totalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  propertyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  propertyPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  propertyPriceLabel: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  propertyPriceValue: {
    fontSize: 18,
    color: realEstateColors.primary[600],
    fontWeight: "700",
  },
  infoCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: realEstateColors.gray[900],
    fontWeight: "700",
  },
  selectionCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.lg,
  },
  quickSelectContainer: {
    marginBottom: spacing.lg,
  },
  quickSelectLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: realEstateColors.gray[700],
    marginBottom: spacing.sm,
  },
  quickSelectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickSelectButton: {
    flex: 1,
    minWidth: "48%",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
    alignItems: "center",
  },
  quickSelectButtonActive: {
    borderColor: realEstateColors.primary[600],
    backgroundColor: realEstateColors.primary[50],
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.gray[700],
    marginBottom: spacing.xs,
  },
  quickSelectTextActive: {
    color: realEstateColors.primary[600],
  },
  quickSelectSubtext: {
    fontSize: 12,
    color: realEstateColors.gray[500],
  },
  quickSelectSubtextActive: {
    color: realEstateColors.primary[600],
  },
  customInputContainer: {
    marginTop: spacing.md,
  },
  customInputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: realEstateColors.gray[700],
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    gap: spacing.xs,
  },
  customInput: {
    borderWidth: 2,
    borderColor: realEstateColors.gray[300],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    backgroundColor: realEstateColors.white,
    color: realEstateColors.gray[900],
  },
  customInputValid: {
    borderColor: realEstateColors.primary[600],
    backgroundColor: realEstateColors.primary[50],
  },
  customInputInvalid: {
    borderColor: realEstateColors.error,
    backgroundColor: realEstateColors.error + "10",
  },
  inputHint: {
    fontSize: 12,
    color: realEstateColors.gray[500],
    marginLeft: spacing.xs,
  },
  summaryCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: realEstateColors.primary[50],
    borderWidth: 2,
    borderColor: realEstateColors.primary[200],
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: 15,
    color: realEstateColors.gray[600],
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 16,
    color: realEstateColors.gray[900],
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: realEstateColors.primary[200],
    marginVertical: spacing.md,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: 18,
    color: realEstateColors.gray[900],
    fontWeight: "700",
  },
  summaryTotalValue: {
    fontSize: 24,
    color: realEstateColors.primary[600],
    fontWeight: "700",
  },
  continueButton: {
    width: "100%",
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});

