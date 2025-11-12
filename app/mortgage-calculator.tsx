import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
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

const { width } = Dimensions.get("window");

interface MortgageCalculation {
  monthlyPayment: number;
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  hoaFees: number;
  totalLoanAmount: number;
  totalInterest: number;
  totalCost: number;
  downPaymentAmount: number;
}

export default function MortgageCalculatorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Property details from params
  const propertyPrice = parseFloat(params.price as string) || 850000;
  const propertyTitle = (params.title as string) || "Property";
  const propertyLocation = (params.location as string) || "";

  // Mortgage inputs
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState("6.5");
  const [creditScore, setCreditScore] = useState("740-799");
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [propertyTaxRegion, setPropertyTaxRegion] = useState("CA");
  const [homeInsurance, setHomeInsurance] = useState("150");
  const [hoaFees, setHoaFees] = useState("0");

  // Predefined options
  const downPaymentOptions = [5, 10, 15, 20, 25, 30];
  const creditScoreRanges = [
    { range: "760-850", rate: "6.0", label: "Excellent (760-850)" },
    { range: "740-759", rate: "6.2", label: "Very Good (740-759)" },
    { range: "700-739", rate: "6.5", label: "Good (700-739)" },
    { range: "660-699", rate: "7.0", label: "Fair (660-699)" },
    { range: "620-659", rate: "7.5", label: "Poor (620-659)" },
  ];
  const propertyTaxRates = [
    { state: "CA", rate: "1.2", label: "California" },
    { state: "TX", rate: "1.8", label: "Texas" },
    { state: "FL", rate: "0.9", label: "Florida" },
    { state: "NY", rate: "1.7", label: "New York" },
    { state: "IL", rate: "2.1", label: "Illinois" },
    { state: "Other", rate: "1.2", label: "Other" },
  ];

  const [calculation, setCalculation] = useState<MortgageCalculation | null>(
    null
  );

  // Handle credit score selection
  const handleCreditScoreChange = (range: string, rate: string) => {
    setCreditScore(range);
    setInterestRate(rate);
  };

  // Handle property tax region change
  const handlePropertyTaxRegionChange = (state: string, rate: string) => {
    setPropertyTaxRegion(state);
    setPropertyTaxRate(rate);
  };

  // Calculate mortgage
  useEffect(() => {
    calculateMortgage();
  }, [
    downPaymentPercent,
    loanTerm,
    interestRate,
    propertyTaxRate,
    homeInsurance,
    hoaFees,
  ]);

  const calculateMortgage = () => {
    const price = propertyPrice;
    const downPercent = parseFloat(downPaymentPercent) || 20;
    const rate = parseFloat(interestRate) || 6.5;
    const years = loanTerm;
    const taxRate = parseFloat(propertyTaxRate) || 1.2;
    const insurance = parseFloat(homeInsurance) || 150;
    const hoa = parseFloat(hoaFees) || 0;

    // Calculate down payment
    const downPaymentAmount = (price * downPercent) / 100;
    const loanAmount = price - downPaymentAmount;

    // Calculate monthly interest rate
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = years * 12;

    // Calculate monthly principal and interest using mortgage formula
    const principalAndInterest =
      monthlyRate === 0
        ? loanAmount / numberOfPayments
        : (loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    // Calculate monthly property tax
    const monthlyPropertyTax = (price * (taxRate / 100)) / 12;

    // Total monthly payment
    const monthlyPayment =
      principalAndInterest + monthlyPropertyTax + insurance + hoa;

    // Calculate total interest
    const totalPaid = principalAndInterest * numberOfPayments;
    const totalInterest = totalPaid - loanAmount;

    // Calculate total cost
    const totalCost = totalPaid + downPaymentAmount;

    setCalculation({
      monthlyPayment,
      principalAndInterest,
      propertyTax: monthlyPropertyTax,
      homeInsurance: insurance,
      hoaFees: hoa,
      totalLoanAmount: loanAmount,
      totalInterest,
      totalCost,
      downPaymentAmount,
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatCurrencyDetailed = (amount: number) => {
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const loanTerms = [15, 20, 30];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={["top"]} style={styles.container}>
        <Header title="Mortgage Calculator" showBackButton={true} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Property Info Card */}
          <Card style={styles.propertyCard}>
            <View style={styles.propertyHeader}>
              <View style={styles.propertyIconContainer}>
                <IconSymbol
                  name="house.fill"
                  size={24}
                  color={realEstateColors.primary[600]}
                />
              </View>
              <View style={styles.propertyInfo}>
                <Text style={styles.propertyTitle}>{propertyTitle}</Text>
                {propertyLocation ? (
                  <Text style={styles.propertyLocation}>
                    {propertyLocation}
                  </Text>
                ) : null}
                <Text style={styles.propertyPrice}>
                  {formatCurrency(propertyPrice)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Monthly Payment Summary */}
          {calculation && (
            <LinearGradient
              colors={[
                realEstateColors.primary[600],
                realEstateColors.primary[700],
              ]}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryLabel}>Estimated Monthly Payment</Text>
              <Text style={styles.summaryAmount}>
                {formatCurrencyDetailed(calculation.monthlyPayment)}
              </Text>
              <Text style={styles.summarySubtext}>
                Principal & Interest, Taxes, Insurance, HOA
              </Text>
            </LinearGradient>
          )}

          {/* Input Section */}
          <Card style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Loan Details</Text>

            {/* Down Payment */}
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.inputLabel}>Down Payment</Text>
                {calculation && (
                  <Text style={styles.inputValue}>
                    {formatCurrency(calculation.downPaymentAmount)}
                  </Text>
                )}
              </View>
              <View style={styles.optionsGrid}>
                {downPaymentOptions.map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.optionButton,
                      downPaymentPercent === option.toString() &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => setDownPaymentPercent(option.toString())}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        downPaymentPercent === option.toString() &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option}%
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.customInputRow}>
                <Text style={styles.customInputLabel}>Custom:</Text>
                <TextInput
                  style={styles.customInput}
                  value={downPaymentPercent}
                  onChangeText={setDownPaymentPercent}
                  keyboardType="numeric"
                  placeholder="20"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
            </View>

            {/* Loan Term */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loan Term</Text>
              <View style={styles.loanTermContainer}>
                {loanTerms.map((term) => (
                  <Pressable
                    key={term}
                    style={[
                      styles.loanTermButton,
                      loanTerm === term && styles.loanTermButtonActive,
                    ]}
                    onPress={() => setLoanTerm(term)}
                  >
                    <Text
                      style={[
                        styles.loanTermText,
                        loanTerm === term && styles.loanTermTextActive,
                      ]}
                    >
                      {term} years
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Credit Score & Interest Rate */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Credit Score (Interest Rate: {interestRate}%)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollOptions}
              >
                {creditScoreRanges.map((score) => (
                  <Pressable
                    key={score.range}
                    style={[
                      styles.creditScoreButton,
                      creditScore === score.range &&
                        styles.creditScoreButtonActive,
                    ]}
                    onPress={() =>
                      handleCreditScoreChange(score.range, score.rate)
                    }
                  >
                    <Text
                      style={[
                        styles.creditScoreLabel,
                        creditScore === score.range &&
                          styles.creditScoreLabelActive,
                      ]}
                    >
                      {score.label}
                    </Text>
                    <Text
                      style={[
                        styles.creditScoreRate,
                        creditScore === score.range &&
                          styles.creditScoreRateActive,
                      ]}
                    >
                      {score.rate}% APR
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.customInputRow}>
                <Text style={styles.customInputLabel}>Custom Rate:</Text>
                <TextInput
                  style={styles.customInput}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="numeric"
                  placeholder="6.5"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
            </View>

            {/* Property Tax Rate */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Property Tax (Annual: {propertyTaxRate}%)
              </Text>
              <View style={styles.optionsGrid}>
                {propertyTaxRates.map((region) => (
                  <Pressable
                    key={region.state}
                    style={[
                      styles.regionButton,
                      propertyTaxRegion === region.state &&
                        styles.regionButtonActive,
                    ]}
                    onPress={() =>
                      handlePropertyTaxRegionChange(region.state, region.rate)
                    }
                  >
                    <Text
                      style={[
                        styles.regionLabel,
                        propertyTaxRegion === region.state &&
                          styles.regionLabelActive,
                      ]}
                    >
                      {region.label}
                    </Text>
                    <Text
                      style={[
                        styles.regionRate,
                        propertyTaxRegion === region.state &&
                          styles.regionRateActive,
                      ]}
                    >
                      {region.rate}%
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.customInputRow}>
                <Text style={styles.customInputLabel}>Custom:</Text>
                <TextInput
                  style={styles.customInput}
                  value={propertyTaxRate}
                  onChangeText={setPropertyTaxRate}
                  keyboardType="numeric"
                  placeholder="1.2"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
            </View>

            {/* Home Insurance */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Home Insurance (Monthly)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputUnit}>$</Text>
                <TextInput
                  style={[styles.input, styles.inputWithPrefix]}
                  value={homeInsurance}
                  onChangeText={setHomeInsurance}
                  keyboardType="numeric"
                  placeholder="150"
                />
              </View>
            </View>

            {/* HOA Fees */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>HOA Fees (Monthly)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.inputUnit}>$</Text>
                <TextInput
                  style={[styles.input, styles.inputWithPrefix]}
                  value={hoaFees}
                  onChangeText={setHoaFees}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          </Card>

          {/* Payment Breakdown */}
          {calculation && (
            <Card style={styles.breakdownCard}>
              <Text style={styles.sectionTitle}>Monthly Payment Breakdown</Text>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <IconSymbol
                    name="house"
                    size={20}
                    color={realEstateColors.primary[600]}
                  />
                  <Text style={styles.breakdownLabel}>
                    Principal & Interest
                  </Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {formatCurrencyDetailed(calculation.principalAndInterest)}
                </Text>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <IconSymbol
                    name="doc.text"
                    size={20}
                    color={realEstateColors.orange[600]}
                  />
                  <Text style={styles.breakdownLabel}>Property Tax</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {formatCurrencyDetailed(calculation.propertyTax)}
                </Text>
              </View>

              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <IconSymbol
                    name="shield.checkered"
                    size={20}
                    color={realEstateColors.green[600]}
                  />
                  <Text style={styles.breakdownLabel}>Home Insurance</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {formatCurrencyDetailed(calculation.homeInsurance)}
                </Text>
              </View>

              {calculation.hoaFees > 0 && (
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <IconSymbol
                      name="building.2"
                      size={20}
                      color={realEstateColors.blue[600]}
                    />
                    <Text style={styles.breakdownLabel}>HOA Fees</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {formatCurrencyDetailed(calculation.hoaFees)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownTotalLabel}>Total Monthly</Text>
                <Text style={styles.breakdownTotalValue}>
                  {formatCurrencyDetailed(calculation.monthlyPayment)}
                </Text>
              </View>
            </Card>
          )}

          {/* Loan Summary */}
          {calculation && (
            <Card style={styles.summaryDetailsCard}>
              <Text style={styles.sectionTitle}>Loan Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Total Loan Amount</Text>
                <Text style={styles.summaryRowValue}>
                  {formatCurrency(calculation.totalLoanAmount)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>Down Payment</Text>
                <Text style={styles.summaryRowValue}>
                  {formatCurrency(calculation.downPaymentAmount)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabel}>
                  Total Interest ({loanTerm} years)
                </Text>
                <Text style={styles.summaryRowValue}>
                  {formatCurrency(calculation.totalInterest)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryRowLabelBold}>
                  Total Cost of Home
                </Text>
                <Text style={styles.summaryRowValueBold}>
                  {formatCurrency(calculation.totalCost)}
                </Text>
              </View>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GradientButton
              title="Find Best Bank Offers"
              onPress={() => {
                if (calculation) {
                  router.push({
                    pathname: "/partner-banks",
                    params: {
                      loanAmount: calculation.totalLoanAmount.toString(),
                      downPayment: calculation.downPaymentAmount.toString(),
                      propertyPrice: propertyPrice.toString(),
                      creditScore: creditScore,
                      monthlyPayment: calculation.monthlyPayment.toString(),
                      interestRate: interestRate,
                      loanTerm: loanTerm.toString(),
                    },
                  });
                }
              }}
              style={styles.proceedButton}
            />
            <CustomButton
              title="Save Calculation"
              variant="outline"
              onPress={() => {
                console.log("Saving calculation...");
              }}
              style={styles.saveButton}
            />
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <IconSymbol
              name="info.circle"
              size={16}
              color={realEstateColors.gray[500]}
            />
            <Text style={styles.disclaimerText}>
              This is an estimate. Actual rates and payments may vary based on
              your credit score, lender, and market conditions.
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
  propertyCard: {
    marginBottom: spacing.md,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: realEstateColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.xs,
  },
  propertyPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: realEstateColors.primary[600],
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: realEstateColors.white,
    opacity: 0.9,
    marginBottom: spacing.xs,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  summarySubtext: {
    fontSize: 12,
    color: realEstateColors.white,
    opacity: 0.8,
    textAlign: "center",
  },
  inputCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.gray[700],
    marginBottom: spacing.sm,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.primary[600],
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: realEstateColors.gray[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: realEstateColors.gray[200],
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: realEstateColors.gray[900],
  },
  inputWithPrefix: {
    paddingLeft: spacing.xs,
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[500],
    marginLeft: spacing.xs,
  },
  loanTermContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  loanTermButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
    alignItems: "center",
  },
  loanTermButtonActive: {
    borderColor: realEstateColors.primary[600],
    backgroundColor: realEstateColors.primary[50],
  },
  loanTermText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.gray[700],
  },
  loanTermTextActive: {
    color: realEstateColors.primary[700],
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
    minWidth: 70,
    alignItems: "center",
  },
  optionButtonActive: {
    borderColor: realEstateColors.primary[600],
    backgroundColor: realEstateColors.primary[50],
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: realEstateColors.gray[700],
  },
  optionTextActive: {
    color: realEstateColors.primary[700],
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: realEstateColors.gray[600],
  },
  customInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: realEstateColors.gray[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: realEstateColors.gray[200],
    fontSize: 14,
    color: realEstateColors.gray[900],
  },
  scrollOptions: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  creditScoreButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
    minWidth: 150,
  },
  creditScoreButtonActive: {
    borderColor: realEstateColors.green[600],
    backgroundColor: realEstateColors.green[50],
  },
  creditScoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: realEstateColors.gray[700],
    marginBottom: spacing.xs,
  },
  creditScoreLabelActive: {
    color: realEstateColors.green[700],
  },
  creditScoreRate: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  creditScoreRateActive: {
    color: realEstateColors.green[600],
  },
  regionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
    minWidth: 90,
    alignItems: "center",
  },
  regionButtonActive: {
    borderColor: realEstateColors.blue[600],
    backgroundColor: realEstateColors.blue[50],
  },
  regionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: realEstateColors.gray[700],
    marginBottom: spacing.xs,
  },
  regionLabelActive: {
    color: realEstateColors.blue[700],
  },
  regionRate: {
    fontSize: 13,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  regionRateActive: {
    color: realEstateColors.blue[600],
  },
  breakdownCard: {
    marginBottom: spacing.md,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 14,
    color: realEstateColors.gray[700],
    marginLeft: spacing.sm,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  breakdownTotalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: realEstateColors.primary[600],
  },
  divider: {
    height: 1,
    backgroundColor: realEstateColors.gray[200],
    marginVertical: spacing.sm,
  },
  summaryDetailsCard: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  summaryRowLabel: {
    fontSize: 14,
    color: realEstateColors.gray[700],
  },
  summaryRowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.gray[900],
  },
  summaryRowLabelBold: {
    fontSize: 16,
    fontWeight: "700",
    color: realEstateColors.gray[900],
  },
  summaryRowValueBold: {
    fontSize: 18,
    fontWeight: "800",
    color: realEstateColors.primary[600],
  },
  actionButtons: {
    marginBottom: spacing.md,
  },
  proceedButton: {
    marginBottom: spacing.sm,
  },
  saveButton: {},
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    backgroundColor: realEstateColors.gray[100],
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: realEstateColors.gray[600],
    lineHeight: 18,
  },
});
