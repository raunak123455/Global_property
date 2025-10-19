import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/Input";
import { GradientButton } from "@/components/ui/GradientButton";
import { IconSymbol } from "@/components/IconSymbol";
import { realEstateColors, spacing } from "@/constants/RealEstateColors";
import { authAPI } from "@/utils/api";
import { useUser } from "@/contexts/UserContext";

export default function SignupScreen() {
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer", // Added role field with default value
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false); // For dropdown visibility

  const handleSignup = async () => {
    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!agreeToTerms) {
      Alert.alert(
        "Error",
        "Please agree to the Terms of Service and Privacy Policy"
      );
      return;
    }

    setLoading(true);

    try {
      // First register the user
      const registerResponse = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      console.log("Registration successful:", registerResponse);

      // Show success message
      Alert.alert(
        "Success",
        "Account created successfully! Please login with your credentials.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "An unexpected error occurred";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Role options
  const roleOptions = [
    { label: "Buyer", value: "buyer" },
    { label: "Agent", value: "agent" },
    { label: "Seller", value: "seller" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("@/assets/images/estate.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      {/* Enhanced dark overlay with 50% opacity */}
      <View style={styles.darkOverlay} />
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join us and find your dream home
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData("firstName", value)}
                  placeholder="First name"
                  containerStyle={styles.nameInput}
                  inputStyle={styles.input}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData("lastName", value)}
                  placeholder="Last name"
                  containerStyle={styles.nameInput}
                  inputStyle={styles.input}
                />
              </View>

              {/* Role Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Role</Text>
                <Pressable
                  style={styles.roleSelector}
                  onPress={() => setIsRoleSelectorOpen(!isRoleSelectorOpen)}
                >
                  <Text style={styles.roleText}>
                    {
                      roleOptions.find(
                        (option) => option.value === formData.role
                      )?.label
                    }
                  </Text>
                  <IconSymbol
                    name={isRoleSelectorOpen ? "chevron.up" : "chevron.down"}
                    size={20}
                    color={realEstateColors.gray[300]}
                  />
                </Pressable>

                {isRoleSelectorOpen && (
                  <View style={styles.roleOptions}>
                    {roleOptions.map((option) => (
                      <Pressable
                        key={option.value}
                        style={styles.roleOption}
                        onPress={() => {
                          updateFormData("role", option.value);
                          setIsRoleSelectorOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.roleOptionText,
                            formData.role === option.value &&
                              styles.selectedRoleOptionText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <Input
                label="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <IconSymbol
                    name="envelope"
                    size={20}
                    color={realEstateColors.gray[300]}
                  />
                }
                inputStyle={styles.input}
              />

              <Input
                label="Password"
                value={formData.password}
                onChangeText={(value) => updateFormData("password", value)}
                placeholder="Create a password"
                secureTextEntry={!showPassword}
                leftIcon={
                  <IconSymbol
                    name="lock"
                    size={20}
                    color={realEstateColors.gray[300]}
                  />
                }
                rightIcon={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <IconSymbol
                      name={showPassword ? "eye.slash" : "eye"}
                      size={20}
                      color={realEstateColors.gray[300]}
                    />
                  </Pressable>
                }
                inputStyle={styles.input}
              />

              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) =>
                  updateFormData("confirmPassword", value)
                }
                placeholder="Confirm your password"
                secureTextEntry={!showConfirmPassword}
                leftIcon={
                  <IconSymbol
                    name="lock"
                    size={20}
                    color={realEstateColors.gray[300]}
                  />
                }
                rightIcon={
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <IconSymbol
                      name={showConfirmPassword ? "eye.slash" : "eye"}
                      size={20}
                      color={realEstateColors.gray[300]}
                    />
                  </Pressable>
                }
                inputStyle={styles.input}
              />

              <Pressable
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                style={styles.termsContainer}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeToTerms && (
                    <IconSymbol
                      name="checkmark"
                      size={16}
                      color={realEstateColors.white}
                    />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Pressable>

              <GradientButton
                title="Create Account"
                onPress={handleSignup}
                loading={loading}
                style={styles.signupButton}
              />

              {/* Sign in option */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{" "}
                  <Pressable onPress={() => router.push("/(auth)/login")}>
                    <Text style={styles.footerLink}>Sign In</Text>
                  </Pressable>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.white,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    height: "100%",
  },
  // Enhanced dark overlay with 50% opacity
  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    paddingVertical: spacing.xl, // Added more vertical padding
  },
  header: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg, // Reduced margin
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: realEstateColors.gray[300], // Lighter subtitle color
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    color: realEstateColors.white,
  },
  // Role selection styles
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleText: {
    fontSize: 16,
    color: realEstateColors.white,
  },
  roleOptions: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  roleOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  roleOptionText: {
    fontSize: 16,
    color: realEstateColors.gray[300],
  },
  selectedRoleOptionText: {
    color: realEstateColors.white,
    fontWeight: "600",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: realEstateColors.gray[300],
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: realEstateColors.primary[600],
    borderColor: realEstateColors.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: realEstateColors.gray[300], // Lighter terms text
    lineHeight: 20,
  },
  termsLink: {
    color: realEstateColors.white, // White links
    fontWeight: "500",
  },
  signupButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 14,
    color: realEstateColors.gray[300], // Lighter footer text
  },
  footerLink: {
    color: realEstateColors.white,
    fontWeight: "600",
  },
});
