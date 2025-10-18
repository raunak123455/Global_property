
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  ViewStyle,
  TextStyle
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/Header';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/IconSymbol';
import { realEstateColors, spacing, borderRadius } from '@/constants/RealEstateColors';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'property' | 'message' | 'system' | 'favorite';
  isRead: boolean;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Property Match',
      message: 'A new property matching your criteria is available in Beverly Hills',
      time: '2 hours ago',
      type: 'property',
      isRead: false,
    },
    {
      id: '2',
      title: 'Message from Agent',
      message: 'Sarah Johnson sent you a message about the downtown apartment',
      time: '4 hours ago',
      type: 'message',
      isRead: false,
    },
    {
      id: '3',
      title: 'Price Drop Alert',
      message: 'The Modern Villa you favorited has dropped in price by $50,000',
      time: '1 day ago',
      type: 'favorite',
      isRead: true,
    },
    {
      id: '4',
      title: 'Tour Reminder',
      message: 'Your property tour is scheduled for tomorrow at 2:00 PM',
      time: '1 day ago',
      type: 'system',
      isRead: true,
    },
    {
      id: '5',
      title: 'New Listing',
      message: 'A new luxury condo is now available in Manhattan',
      time: '2 days ago',
      type: 'property',
      isRead: true,
    },
  ]);

  const markAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property':
        return 'house';
      case 'message':
        return 'message';
      case 'system':
        return 'bell';
      case 'favorite':
        return 'heart';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'property':
        return realEstateColors.primary[500];
      case 'message':
        return realEstateColors.secondary[500]; // Using secondary instead of undefined blue
      case 'system':
        return realEstateColors.gray[500];
      case 'favorite':
        return realEstateColors.accent[500]; // Using accent instead of undefined red
      default:
        return realEstateColors.gray[500];
    }
  };

  const getNotificationBackgroundColor = (type: string) => {
    const baseColor = getNotificationColor(type);
    // Create a lighter version by reducing opacity (this is a simple approach)
    return `${baseColor}20`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Pressable onPress={() => markAsRead(item.id)}>
      <Card style={
        !item.isRead 
          ? {...styles.notificationCard, ...styles.unreadCard} 
          : styles.notificationCard
      }>
        <View style={styles.notificationContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: getNotificationBackgroundColor(item.type) }
          ]}>
            <IconSymbol
              name={getNotificationIcon(item.type)}
              size={20}
              color={getNotificationColor(item.type)}
            />
          </View>
          
          <View style={styles.textContent}>
            <View style={styles.headerRow}>
              <Text style={
                !item.isRead 
                  ? {...styles.notificationTitle, ...styles.unreadTitle} 
                  : styles.notificationTitle
              }>
                {item.title}
              </Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Header 
        title="Notifications"
        rightComponent={
          unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null
        }
      />
      
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  notificationCard: {
    marginBottom: spacing.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: realEstateColors.primary[500],
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: realEstateColors.gray[900],
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: realEstateColors.primary[500],
    marginLeft: spacing.xs,
  },
  notificationMessage: {
    fontSize: 14,
    color: realEstateColors.gray[600],
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: 12,
    color: realEstateColors.gray[400],
  },
  badge: {
    backgroundColor: realEstateColors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: realEstateColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
