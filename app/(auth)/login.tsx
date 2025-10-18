import React, { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { GradientButton } from '@/components/ui/GradientButton';
import { SocialButton } from '@/components/ui/SocialButton';
import { IconSymbol } from '@/components/IconSymbol';
import { realEstateColors, spacing } from '@/constants/RealEstateColors';
import { authAPI } from '@/utils/api';
import { useUser } from '@/contexts/UserContext';

export default function LoginScreen() {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      console.log('Login successful:', response);
      
      // Save user data to context
      setUser({
        _id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role,
        token: response.token
      });
      
      // Navigate to the dashboard
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login pressed');
  };

  const handleAppleLogin = () => {
    console.log('Apple login pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('@/assets/images/estate.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      {/* Enhanced dark overlay with 50% opacity */}
      <View style={styles.darkOverlay} />
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to your account to continue
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
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
                      name={showPassword ? 'eye.slash' : 'eye'}
                      size={20}
                      color={realEstateColors.gray[300]}
                    />
                  </Pressable>
                }
                inputStyle={styles.input}
              />

              <Pressable
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>

              <GradientButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                <SocialButton
                  title="Google"
                  onPress={handleGoogleLogin}
                  variant="google"
                  style={styles.socialButton}
                  leftIcon={
                    <IconSymbol
                      name="globe"
                      size={20}
                      color={realEstateColors.primary[600]}
                    />
                  }
                />
                <SocialButton
                  title="Apple"
                  onPress={handleAppleLogin}
                  variant="apple"
                  style={styles.socialButton}
                  leftIcon={
                    <IconSymbol
                      name="apple.logo"
                      size={20}
                      color={realEstateColors.white}
                    />
                  }
                />
              </View>
              
              {/* Sign up option moved here */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{' '}
                  <Pressable onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.footerLink}>Sign Up</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  // Enhanced dark overlay with 50% opacity
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    justifyContent: 'center',
    paddingVertical: spacing.xl, // Added more vertical padding
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg, // Reduced margin
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: realEstateColors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: realEstateColors.gray[300], // Lighter subtitle color
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  input: {
    color: realEstateColors.white,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md, // Reduced space before button
  },
  forgotPasswordText: {
    fontSize: 14,
    color: realEstateColors.white,
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: realEstateColors.gray[600],
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 14,
    color: realEstateColors.gray[300],
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 14,
    color: realEstateColors.gray[300], // Lighter footer text
  },
  footerLink: {
    color: realEstateColors.white,
    fontWeight: '600',
  },
});