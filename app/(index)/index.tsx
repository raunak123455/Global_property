import React from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { realEstateColors, spacing } from '@/constants/RealEstateColors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={require('@/assets/images/estate.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(111, 29, 27, 0)', 'rgba(111, 29, 27, 0.7)', 'rgba(111, 29, 27, 0.9)']}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <Text style={styles.titleLine1}>Discover</Text>
        <Text style={styles.titleLine2}>your unique</Text>
        <Text style={styles.titleLine3}>dream house</Text>
        <Pressable 
          style={styles.button}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
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
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingLeft: 30,
  },
  titleLine1: {
    fontSize: 34,
    fontWeight: '700',
    color: realEstateColors.white,
    textAlign: 'left',
    lineHeight: 41,
    fontFamily: 'Montserrat',
  },
  titleLine2: {
    fontSize: 34,
    fontWeight: '700',
    color: realEstateColors.white,
    textAlign: 'left',
    lineHeight: 41,
    fontFamily: 'Montserrat',
  },
  titleLine3: {
    fontSize: 34,
    fontWeight: '700',
    color: realEstateColors.white,
    textAlign: 'left',
    lineHeight: 41,
    marginBottom: spacing.lg,
    fontFamily: 'Montserrat',
  },
  button: {
    backgroundColor: realEstateColors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 200,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: realEstateColors.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});