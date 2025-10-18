import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { realEstateColors, spacing, borderRadius, shadows } from '@/constants/RealEstateColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean; // Add required prop
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'light' | 'dark'; // Add variant prop
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  variant = 'dark', // Default to dark
  ...props
}) => {
  // Determine colors based on variant
  const isLight = variant === 'light';
  const textColor = isLight ? realEstateColors.gray[900] : realEstateColors.white;
  const placeholderColor = isLight ? realEstateColors.gray[400] : realEstateColors.gray[300];
  const backgroundColor = isLight ? realEstateColors.white : 'rgba(255, 255, 255, 0.1)';
  const borderColor = isLight ? realEstateColors.gray[200] : 'rgba(255, 255, 255, 0.3)';
  const labelColor = isLight ? realEstateColors.gray[700] : realEstateColors.white;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        { backgroundColor, borderColor },
        error && styles.inputContainerError,
        props.editable === false && styles.inputContainerDisabled
      ]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            { color: textColor },
            leftIcon ? styles.inputWithLeftIcon : {},
            rightIcon ? styles.inputWithRightIcon : {},
            inputStyle
          ]}
          placeholderTextColor={placeholderColor}
          {...props}
        />
        {rightIcon && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  required: {
    color: realEstateColors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    minHeight: 56,
    ...shadows.sm,
  },
  inputContainerError: {
    borderColor: realEstateColors.error,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  iconContainer: {
    paddingHorizontal: spacing.sm,
  },
  error: {
    fontSize: 12,
    color: realEstateColors.error,
    marginTop: spacing.xs,
  },
});