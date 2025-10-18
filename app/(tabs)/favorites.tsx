
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/IconSymbol';
import { realEstateColors, spacing, borderRadius } from '@/constants/RealEstateColors';

interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  isFavorite: boolean;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Modern Villa',
      price: '$850,000',
      location: 'Beverly Hills, CA',
      bedrooms: 4,
      bathrooms: 3,
      area: '2,500 sq ft',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop',
      isFavorite: true,
    },
    {
      id: '2',
      title: 'Downtown Apartment',
      price: '$450,000',
      location: 'Manhattan, NY',
      bedrooms: 2,
      bathrooms: 2,
      area: '1,200 sq ft',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      isFavorite: true,
    },
    {
      id: '3',
      title: 'Cozy Cottage',
      price: '$320,000',
      location: 'Portland, OR',
      bedrooms: 3,
      bathrooms: 2,
      area: '1,800 sq ft',
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
      isFavorite: true,
    },
  ]);

  const toggleFavorite = (propertyId: string) => {
    console.log('Toggling favorite for property:', propertyId);
    setFavoriteProperties(prev =>
      prev.filter(property => property.id !== propertyId)
    );
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <Pressable onPress={() => router.push(`/(tabs)/property-details?id=${item.id}`)}>
      <Card style={styles.propertyCard}>
        <View style={styles.propertyContent}>
          <Image source={{ uri: item.image }} style={styles.propertyImage} />
          <Pressable
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item.id);
            }}
          >
            <IconSymbol
              name={item.isFavorite ? 'heart.fill' : 'heart'}
              size={20}
              color={item.isFavorite ? realEstateColors.error : realEstateColors.gray[400]}
            />
          </Pressable>
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyTitle}>{item.title}</Text>
            <Text style={styles.propertyPrice}>{item.price}</Text>
            <Text style={styles.propertyLocation}>{item.location}</Text>
            <View style={styles.propertyFeatures}>
              <View style={styles.feature}>
                <IconSymbol name="bed.double" size={16} color={realEstateColors.gray[500]} />
                <Text style={styles.featureText}>{item.bedrooms}</Text>
              </View>
              <View style={styles.feature}>
                <IconSymbol name="shower" size={16} color={realEstateColors.gray[500]} />
                <Text style={styles.featureText}>{item.bathrooms}</Text>
              </View>
              <View style={styles.feature}>
                <IconSymbol name="square" size={16} color={realEstateColors.gray[500]} />
                <Text style={styles.featureText}>{item.area}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="heart" size={64} color={realEstateColors.gray[300]} />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyDescription}>
        Start exploring properties and add them to your favorites!
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header title="Favorites" />
      
      {favoriteProperties.length > 0 ? (
        <FlatList
          data={favoriteProperties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  listContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  propertyContent: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: realEstateColors.white,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyDetails: {
    padding: spacing.md,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: realEstateColors.gray[900],
    marginBottom: spacing.xs,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: realEstateColors.primary[600],
    marginBottom: spacing.xs,
  },
  propertyLocation: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    marginBottom: spacing.md,
  },
  propertyFeatures: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: realEstateColors.gray[900],
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: 16,
    color: realEstateColors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
});
