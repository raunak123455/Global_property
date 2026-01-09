import React from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  realEstateColors,
  spacing,
  borderRadius,
  shadows,
} from "@/constants/RealEstateColors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean; // Add required prop
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "light" | "dark"; // Add variant prop
  isFocused?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  containerStyle,
  inputStyle,
  inputContainerStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  variant = "dark", // Default to dark
  isFocused = false,
  placeholderTextColor,
  ...props
}) => {
  // Determine colors based on variant
  const isLight = variant === "light";
  const textColor = isLight
    ? realEstateColors.gray[900]
    : realEstateColors.white;
  const defaultPlaceholderColor = isLight
    ? realEstateColors.gray[500]
    : "rgba(255, 255, 255, 0.6)";
  const backgroundColor = isLight
    ? realEstateColors.white
    : "rgba(255, 255, 255, 0.15)";
  const borderColor = isLight
    ? isFocused
      ? realEstateColors.primary[500]
      : realEstateColors.gray[300]
    : "rgba(255, 255, 255, 0.4)";
  const labelColor = isLight
    ? realEstateColors.gray[700]
    : realEstateColors.white;

  const finalPlaceholderColor = placeholderTextColor || defaultPlaceholderColor;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: labelColor }, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor, borderColor },
          error && styles.inputContainerError,
          props.editable === false && styles.inputContainerDisabled,
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: textColor },
            leftIcon ? styles.inputWithLeftIcon : {},
            rightIcon ? styles.inputWithRightIcon : {},
            inputStyle,
          ]}
          placeholderTextColor={finalPlaceholderColor}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  required: {
    color: realEstateColors.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: borderRadius.xl,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    backdropFilter: "blur(10px)",
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
