
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { CustomButton } from '@/components/ui/CustomButton';
import { Header } from '@/components/ui/Header';
import { IconSymbol } from '@/components/IconSymbol';
import { realEstateColors, spacing } from '@/constants/RealEstateColors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    console.log('Reset password for:', email);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  const handleBackToLogin = () => {
    router.push('/(auth)/login');
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Check Your Email"
          showBackButton
        />
        
        <View style={styles.successContainer}>
          <View style={styles.iconContainer}>
            <IconSymbol
              name="envelope.badge"
              size={64}
              color={realEstateColors.primary[600]}
            />
          </View>
          
          <Text style={styles.successTitle}>Email Sent!</Text>
          <Text style={styles.successMessage}>
            We&apos;ve sent a password reset link to {email}. 
            Please check your email and follow the instructions to reset your password.
          </Text>
          
          <CustomButton
            title="Back to Login"
            onPress={handleBackToLogin}
            style={styles.backButton}
          />
          
          <CustomButton
            title="Resend Email"
            onPress={handleResetPassword}
            variant="outline"
            loading={loading}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Forgot Password"
        showBackButton
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconSymbol
                name="lock.rotation"
                size={48}
                color={realEstateColors.primary[600]}
              />
            </View>
            
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <IconSymbol
                  name="envelope"
                  size={20}
                  color={realEstateColors.gray[400]}
                />
              }
            />

            <CustomButton
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              disabled={!email.trim()}
              style={styles.resetButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Remember your password?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => router.push('/(auth)/login')}
              >
                Sign In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: realEstateColors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  resetButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  footerLink: {
    color: realEstateColors.primary[600],
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: realEstateColors.gray[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
    width: '100%',
  },
});
