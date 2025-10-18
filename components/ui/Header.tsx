
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { realEstateColors, spacing } from '@/constants/RealEstateColors';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  backgroundColor?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightComponent,
  onBackPress,
  style,
  titleStyle,
  backgroundColor = realEstateColors.white,
}) => {
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor }, style]}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <Pressable
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <IconSymbol
                name="chevron.left"
                size={24}
                color={realEstateColors.gray[700]}
              />
            </Pressable>
          )}
        </View>
        
        <View style={styles.centerSection}>
          {title && (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          )}
        </View>
        
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: realEstateColors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: realEstateColors.gray[900],
    textAlign: 'center',
  },
});

export default Header;
