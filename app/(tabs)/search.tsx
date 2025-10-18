
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
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CustomButton } from '@/components/ui/CustomButton';
import { Header } from '@/components/ui/Header';
import { IconSymbol } from '@/components/IconSymbol';
import { realEstateColors, spacing, borderRadius } from '@/constants/RealEstateColors';
import { useRouter } from 'expo-router';

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
  type: string;
}

const mockSearchResults: Property[] = [
  {
    id: '1',
    title: 'Modern Villa',
    price: '$850,000',
    location: 'Beverly Hills, CA',
    bedrooms: 4,
    bathrooms: 3,
    area: '2,500 sq ft',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    isFavorite: false,
    type: 'Villa',
  },
  {
    id: '2',
    title: 'Luxury Apartment',
    price: '$650,000',
    location: 'Manhattan, NY',
    bedrooms: 2,
    bathrooms: 2,
    area: '1,800 sq ft',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
    isFavorite: true,
    type: 'Apartment',
  },
  {
    id: '3',
    title: 'Cozy House',
    price: '$450,000',
    location: 'Austin, TX',
    bedrooms: 3,
    bathrooms: 2,
    area: '1,600 sq ft',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
    isFavorite: false,
    type: 'House',
  },
  {
    id: '4',
    title: 'Downtown Condo',
    price: '$520,000',
    location: 'Seattle, WA',
    bedrooms: 2,
    bathrooms: 1,
    area: '1,200 sq ft',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    isFavorite: false,
    type: 'Condo',
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState(mockSearchResults);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { id: 'house', label: 'House', icon: 'house' },
    { id: 'apartment', label: 'Apartment', icon: 'building.2' },
    { id: 'villa', label: 'Villa', icon: 'house.lodge' },
    { id: 'condo', label: 'Condo', icon: 'building' },
  ];

  const priceRanges = [
    { id: 'under-300k', label: 'Under $300K' },
    { id: '300k-500k', label: '$300K - $500K' },
    { id: '500k-800k', label: '$500K - $800K' },
    { id: 'over-800k', label: 'Over $800K' },
  ];

  const toggleFavorite = (propertyId: string) => {
    setProperties(prev =>
      prev.map(property =>
        property.id === propertyId
          ? { ...property, isFavorite: !property.isFavorite }
          : property
      )
    );
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const renderProperty = ({ item }: { item: Property }) => (
    <Pressable onPress={() => router.push(`/(tabs)/property-details?id=${item.id}`)}>
      <Card style={styles.propertyCard} variant="elevated">
        <View style={styles.propertyContent}>
          <Image source={{ uri: item.image }} style={styles.propertyImage} />
          
          <View style={styles.propertyInfo}>
            <View style={styles.propertyHeader}>
              <View style={styles.propertyTitleContainer}>
                <Text style={styles.propertyTitle}>{item.title}</Text>
                <Text style={styles.propertyLocation}>{item.location}</Text>
              </View>
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
            </View>
            
            <Text style={styles.propertyPrice}>{item.price}</Text>
            
            <View style={styles.propertyDetails}>
              <View style={styles.detailItem}>
                <IconSymbol name="bed.double" size={16} color={realEstateColors.gray[500]} />
                <Text style={styles.detailText}>{item.bedrooms} beds</Text>
              </View>
              <View style={styles.detailItem}>
                <IconSymbol name="drop" size={16} color={realEstateColors.gray[500]} />
                <Text style={styles.detailText}>{item.bathrooms} baths</Text>
              </View>
              <View style={styles.detailItem}>
                <IconSymbol name="square" size={16} color={realEstateColors.gray[500]} />
                <Text style={styles.detailText}>{item.area}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header title="Search Properties" />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by location, property type..."
            leftIcon={
              <IconSymbol
                name="magnifyingglass"
                size={20}
                color={realEstateColors.gray[400]}
              />
            }
            rightIcon={
              <Pressable onPress={() => setShowFilters(!showFilters)}>
                <IconSymbol
                  name="slider.horizontal.3"
                  size={20}
                  color={realEstateColors.primary[600]}
                />
              </Pressable>
            }
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Filters */}
        {showFilters && (
          <Card style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>Property Type</Text>
            <View style={styles.filterButtons}>
              {filters.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    selectedFilters.includes(filter.id) && styles.filterButtonActive,
                  ]}
                  onPress={() => toggleFilter(filter.id)}
                >
                  <IconSymbol
                    name={filter.icon as any}
                    size={20}
                    color={
                      selectedFilters.includes(filter.id)
                        ? realEstateColors.white
                        : realEstateColors.gray[600]
                    }
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedFilters.includes(filter.id) && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.filtersTitle}>Price Range</Text>
            <View style={styles.priceRanges}>
              {priceRanges.map((range) => (
                <Pressable
                  key={range.id}
                  style={[
                    styles.priceRangeButton,
                    selectedFilters.includes(range.id) && styles.priceRangeButtonActive,
                  ]}
                  onPress={() => toggleFilter(range.id)}
                >
                  <Text
                    style={[
                      styles.priceRangeText,
                      selectedFilters.includes(range.id) && styles.priceRangeTextActive,
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.filterActions}>
              <CustomButton
                title="Clear All"
                onPress={() => setSelectedFilters([])}
                variant="outline"
                style={styles.filterActionButton}
              />
              <CustomButton
                title="Apply Filters"
                onPress={() => setShowFilters(false)}
                style={styles.filterActionButton}
              />
            </View>
          </Card>
        )}

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {properties.length} properties found
          </Text>
          <Pressable style={styles.sortButton}>
            <Text style={styles.sortText}>Sort by</Text>
            <IconSymbol
              name="chevron.down"
              size={16}
              color={realEstateColors.gray[600]}
            />
          </Pressable>
        </View>

        <FlatList
          data={properties}
          renderItem={renderProperty}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.propertiesList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: realEstateColors.gray[50],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersCard: {
    marginBottom: spacing.md,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: realEstateColors.gray[900],
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: realEstateColors.gray[100],
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: realEstateColors.primary[600],
  },
  filterButtonText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: realEstateColors.white,
  },
  priceRanges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  priceRangeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: realEstateColors.gray[300],
    backgroundColor: realEstateColors.white,
  },
  priceRangeButtonActive: {
    backgroundColor: realEstateColors.primary[600],
    borderColor: realEstateColors.primary[600],
  },
  priceRangeText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    fontWeight: '500',
  },
  priceRangeTextActive: {
    color: realEstateColors.white,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterActionButton: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: realEstateColors.gray[900],
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sortText: {
    fontSize: 14,
    color: realEstateColors.gray[600],
  },
  propertiesList: {
    paddingBottom: spacing.xl,
  },
  propertyCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  propertyContent: {
    flexDirection: 'row',
  },
  propertyImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  propertyInfo: {
    flex: 1,
    padding: spacing.md,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  propertyTitleContainer: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: realEstateColors.gray[900],
    marginBottom: 2,
  },
  propertyLocation: {
    fontSize: 12,
    color: realEstateColors.gray[600],
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: realEstateColors.primary[600],
    marginBottom: spacing.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: realEstateColors.gray[600],
  },
});
