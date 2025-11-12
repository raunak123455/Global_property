import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
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
import { LinearGradient } from "expo-linear-gradient";

interface PartnerBank {
  id: string;
  name: string;
  logo: string;
  rating: number;
  interestRate: number;
  apr: number;
  loanTerm: number;
  processingFee: number;
  closingCost: number;
  minimumDownPayment: number;
  maxLoanAmount: number;
  estimatedMonthlyPayment: number;
  specialOffer?: string;
  features: string[];
  processingTime: string;
  customerSupport: string;
  recommended?: boolean;
}

export default function PartnerBanksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mortgage details from previous screen
  const loanAmount = parseFloat(params.loanAmount as string) || 680000;
  const creditScore = (params.creditScore as string) || "700-739";
  const downPayment = parseFloat(params.downPayment as string) || 170000;
  const propertyPrice = parseFloat(params.propertyPrice as string) || 850000;

  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // Partner banks data
  const partnerBanks: PartnerBank[] = [
    {
      id: "1",
      name: "Wells Fargo Home Mortgage",
      logo: "🏦",
      rating: 4.5,
      interestRate: 6.25,
      apr: 6.35,
      loanTerm: 30,
      processingFee: 495,
      closingCost: 3500,
      minimumDownPayment: 10,
      maxLoanAmount: 2000000,
      estimatedMonthlyPayment: 4185,
      specialOffer: "0.25% rate discount for existing customers",
      features: [
        "No prepayment penalty",
        "Online application",
        "Rate lock for 60 days",
        "Free home valuation",
      ],
      processingTime: "21-30 days",
      customerSupport: "24/7 Phone & Chat",
      recommended: true,
    },
    {
      id: "2",
      name: "Bank of America",
      logo: "🏛️",
      rating: 4.7,
      interestRate: 6.15,
      apr: 6.28,
      loanTerm: 30,
      processingFee: 450,
      closingCost: 3200,
      minimumDownPayment: 15,
      maxLoanAmount: 2500000,
      estimatedMonthlyPayment: 4145,
      specialOffer: "Up to $7,500 in lender credits",
      features: [
        "Preferred Rewards discount",
        "Fast track processing",
        "Digital document upload",
        "Dedicated loan officer",
      ],
      processingTime: "18-25 days",
      customerSupport: "24/7 Phone, Chat & Email",
      recommended: true,
    },
    {
      id: "3",
      name: "Chase Home Lending",
      logo: "💼",
      rating: 4.6,
      interestRate: 6.35,
      apr: 6.45,
      loanTerm: 30,
      processingFee: 500,
      closingCost: 3400,
      minimumDownPayment: 10,
      maxLoanAmount: 3000000,
      estimatedMonthlyPayment: 4225,
      features: [
        "DreaMaker℠ down payment assistance",
        "HomeGrant℠ program",
        "Chase MyHome℠ app",
        "Rate lock for 90 days",
      ],
      processingTime: "25-35 days",
      customerSupport: "Mon-Sat 8AM-8PM",
    },
    {
      id: "4",
      name: "Quicken Loans (Rocket Mortgage)",
      logo: "🚀",
      rating: 4.8,
      interestRate: 6.1,
      apr: 6.22,
      loanTerm: 30,
      processingFee: 395,
      closingCost: 2950,
      minimumDownPayment: 5,
      maxLoanAmount: 2000000,
      estimatedMonthlyPayment: 4125,
      specialOffer: "100% online process - Close in 15 days",
      features: [
        "Fully digital experience",
        "Verified Approval in minutes",
        "One-touch upload",
        "RateShield℠ Approval",
      ],
      processingTime: "14-20 days",
      customerSupport: "24/7 Phone, Chat & App",
      recommended: true,
    },
    {
      id: "5",
      name: "US Bank Home Mortgage",
      logo: "🏢",
      rating: 4.4,
      interestRate: 6.4,
      apr: 6.52,
      loanTerm: 30,
      processingFee: 475,
      closingCost: 3300,
      minimumDownPayment: 20,
      maxLoanAmount: 1500000,
      estimatedMonthlyPayment: 4255,
      features: [
        "Relationship discount",
        "Free appraisal for qualified buyers",
        "Flexible underwriting",
        "Mobile mortgage app",
      ],
      processingTime: "22-28 days",
      customerSupport: "Mon-Fri 8AM-6PM",
    },
    {
      id: "6",
      name: "CitiBank Mortgage",
      logo: "🏪",
      rating: 4.3,
      interestRate: 6.3,
      apr: 6.42,
      loanTerm: 30,
      processingFee: 525,
      closingCost: 3600,
      minimumDownPayment: 15,
      maxLoanAmount: 2500000,
      estimatedMonthlyPayment: 4205,
      specialOffer: "Relationship pricing up to 0.375% discount",
      features: [
        "Citi Priority clients benefits",
        "Jumbo loan expertise",
        "Global reach",
        "Concierge service",
      ],
      processingTime: "20-30 days",
      customerSupport: "24/7 Priority Line",
    },
  ];

  // Sort banks by recommended first, then by interest rate
  const sortedBanks = [...partnerBanks].sort((a, b) => {
    if (a.recommended && !b.recommended) return -1;
    if (!a.recommended && b.recommended) return 1;
    return a.interestRate - b.interestRate;
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const handleSelectBank = (bankId: string) => {
    setSelectedBank(bankId);
  };

  const handleApplyNow = (bank: PartnerBank) => {
    // Implement application logic
    console.log("Applying to:", bank.name);
    // In a real app, this would navigate to the bank's application or open their website
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={`full-${i}`} style={styles.star}>
          ⭐
        </Text>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={styles.star}>
          ⭐
        </Text>
      );
    }
    return stars;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Header title="Partner Banks" showBackButton={true} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Summary Card */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <IconSymbol
                name="building.columns"
                size={24}
                color={realEstateColors.primary[600]}
              />
              <Text style={styles.summaryTitle}>
                Best Mortgage Offers For You
              </Text>
            </View>
            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Loan Amount</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(loanAmount)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Credit Score</Text>
                <Text style={styles.summaryValue}>{creditScore}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Down Payment</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(downPayment)}
                </Text>
              </View>
            </View>
            <Text style={styles.summaryNote}>
              📊 {sortedBanks.length} partner banks matched your criteria
            </Text>
          </Card>

          {/* Filter/Sort Options */}
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Sorted by: Best Match</Text>
          </View>

          {/* Partner Banks List */}
          {sortedBanks.map((bank) => (
            <Card
              key={bank.id}
              style={[
                styles.bankCard,
                selectedBank === bank.id && styles.bankCardSelected,
                bank.recommended && styles.bankCardRecommended,
              ]}
            >
              {bank.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>⭐ Recommended</Text>
                </View>
              )}

              <Pressable onPress={() => handleSelectBank(bank.id)}>
                {/* Bank Header */}
                <View style={styles.bankHeader}>
                  <View style={styles.bankLogo}>
                    <Text style={styles.bankLogoEmoji}>{bank.logo}</Text>
                  </View>
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>{bank.name}</Text>
                    <View style={styles.ratingContainer}>
                      {renderStars(bank.rating)}
                      <Text style={styles.ratingText}>{bank.rating}/5</Text>
                    </View>
                  </View>
                </View>

                {/* Special Offer */}
                {bank.specialOffer && (
                  <View style={styles.specialOfferContainer}>
                    <IconSymbol
                      name="gift"
                      size={16}
                      color={realEstateColors.orange[600]}
                    />
                    <Text style={styles.specialOfferText}>
                      {bank.specialOffer}
                    </Text>
                  </View>
                )}

                {/* Key Metrics */}
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Interest Rate</Text>
                    <Text style={styles.metricValue}>{bank.interestRate}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>APR</Text>
                    <Text style={styles.metricValue}>{bank.apr}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Est. Monthly</Text>
                    <Text style={styles.metricValue}>
                      {formatCurrency(bank.estimatedMonthlyPayment)}
                    </Text>
                  </View>
                </View>

                {/* Additional Details */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <IconSymbol
                      name="dollarsign.circle"
                      size={16}
                      color={realEstateColors.gray[600]}
                    />
                    <Text style={styles.detailText}>
                      Processing Fee: {formatCurrency(bank.processingFee)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol
                      name="banknote"
                      size={16}
                      color={realEstateColors.gray[600]}
                    />
                    <Text style={styles.detailText}>
                      Closing Cost: {formatCurrency(bank.closingCost)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <IconSymbol
                      name="clock"
                      size={16}
                      color={realEstateColors.gray[600]}
                    />
                    <Text style={styles.detailText}>
                      Processing: {bank.processingTime}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <IconSymbol
                      name="phone"
                      size={16}
                      color={realEstateColors.gray[600]}
                    />
                    <Text style={styles.detailText}>
                      {bank.customerSupport}
                    </Text>
                  </View>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  <Text style={styles.featuresTitle}>Key Features:</Text>
                  <View style={styles.featuresList}>
                    {bank.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureBullet}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <GradientButton
                    title="Apply Now"
                    onPress={() => handleApplyNow(bank)}
                    style={styles.applyButton}
                  />
                  <CustomButton
                    title="Details"
                    variant="outline"
                    onPress={() => console.log("View details:", bank.name)}
                    style={styles.detailsButton}
                  />
                </View>
              </Pressable>
            </Card>
          ))}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <IconSymbol
              name="info.circle"
              size={16}
              color={realEstateColors.gray[500]}
            />
            <Text style={styles.disclaimerText}>
              These are estimated offers based on your profile. Actual rates and
              terms may vary. GLOBALO is not a lender and does not guarantee
              loan approval. Partner banks are independent institutions.
            </Text>
          </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginLeft: spacing.sm,
  },
  summaryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  summaryNote: {
    fontSize: 13,
    color: realEstateColors.primary[600],
    fontWeight: "600",
    textAlign: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: realEstateColors.gray[200],
  },
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.gray[700],
  },
  bankCard: {
    marginBottom: spacing.md,
    position: "relative",
  },
  bankCardSelected: {
    borderWidth: 2,
    borderColor: realEstateColors.primary[600],
  },
  bankCardRecommended: {
    borderWidth: 1,
    borderColor: realEstateColors.green[300],
  },
  recommendedBadge: {
    position: "absolute",
    top: -1,
    right: -1,
    backgroundColor: realEstateColors.green[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderTopRightRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.md,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 12,
    fontWeight: "700",
    color: realEstateColors.white,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  bankLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: realEstateColors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  bankLogoEmoji: {
    fontSize: 32,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
    color: realEstateColors.gray[700],
    marginLeft: spacing.xs,
  },
  specialOfferContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: realEstateColors.orange[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  specialOfferText: {
    fontSize: 13,
    fontWeight: "600",
    color: realEstateColors.orange[700],
    marginLeft: spacing.sm,
    flex: 1,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: realEstateColors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 11,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: realEstateColors.primary[700],
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: realEstateColors.gray[700],
    marginLeft: spacing.xs,
  },
  featuresContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
  },
  featuresList: {
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureBullet: {
    fontSize: 14,
    color: realEstateColors.green[600],
    fontWeight: "700",
    marginRight: spacing.xs,
  },
  featureText: {
    fontSize: 13,
    color: realEstateColors.gray[700],
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  applyButton: {
    flex: 1.5,
  },
  detailsButton: {
    flex: 1,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    backgroundColor: realEstateColors.gray[100],
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: realEstateColors.gray[600],
    lineHeight: 16,
  },
});
