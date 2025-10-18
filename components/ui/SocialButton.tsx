import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { realEstateColors, spacing, borderRadius, shadows } from '@/constants/RealEstateColors';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  variant: 'google' | 'apple';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  onPress,
  variant,
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'google':
        return {
          backgroundColor: realEstateColors.white,
          ...shadows.sm,
        };
      case 'apple':
        return {
          backgroundColor: realEstateColors.black,
          ...shadows.sm,
        };
      default:
        return {
          backgroundColor: realEstateColors.white,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'google':
        return realEstateColors.black;
      case 'apple':
        return realEstateColors.white;
      default:
        return realEstateColors.black;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        getVariantStyle(),
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leftIcon && !loading && (
        <View style={styles.iconContainer}>
          {leftIcon}
        </View>
      )}
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    gap: spacing.sm,
  },
  iconContainer: {
    position: 'absolute',
    left: spacing.lg,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default SocialButton;