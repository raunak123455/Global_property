
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { realEstateColors, spacing, borderRadius, shadows } from '@/constants/RealEstateColors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...shadows.md,
          backgroundColor: realEstateColors.white,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: realEstateColors.gray[200],
          backgroundColor: realEstateColors.white,
        };
      default:
        return {
          backgroundColor: realEstateColors.white,
          ...shadows.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
  },
});

export default Card;
