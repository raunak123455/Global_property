import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/contexts/UserContext";

const KYC_REMINDER_KEY_PREFIX = "kyc_last_reminder_";
const KYC_LOGIN_SESSION_KEY = "kyc_login_session_";
const REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
// For testing, you can use: 5 * 60 * 1000 (5 minutes)

export const useKycReminder = () => {
  const { user } = useUser();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    checkAndShowReminder();
  }, [user]);

  const checkAndShowReminder = async () => {
    // Don't show reminder if user is KYC verified or not logged in
    if (!user || user.kycVerified) {
      setShowReminder(false);
      return;
    }

    try {
      const userId = user._id || user.email;
      const reminderKey = `${KYC_REMINDER_KEY_PREFIX}${userId}`;
      const sessionKey = `${KYC_LOGIN_SESSION_KEY}${userId}`;

      const lastReminderStr = await AsyncStorage.getItem(reminderKey);
      const lastSessionStr = await AsyncStorage.getItem(sessionKey);
      const now = Date.now();

      // Check if this is a new login session
      const isNewSession =
        !lastSessionStr || now - parseInt(lastSessionStr, 10) > 60000; // 1 minute gap = new session

      if (isNewSession) {
        // New login session - always show reminder
        setShowReminder(true);
        await AsyncStorage.setItem(sessionKey, now.toString());
        await AsyncStorage.setItem(reminderKey, now.toString());
      } else if (!lastReminderStr) {
        // First time - show reminder
        setShowReminder(true);
        await AsyncStorage.setItem(reminderKey, now.toString());
      } else {
        const lastReminder = parseInt(lastReminderStr, 10);
        const timeSinceLastReminder = now - lastReminder;

        if (timeSinceLastReminder >= REMINDER_INTERVAL) {
          // Show reminder if enough time has passed
          setShowReminder(true);
          await AsyncStorage.setItem(reminderKey, now.toString());
        }
      }
    } catch (error) {
      console.error("Error checking KYC reminder:", error);
    }
  };

  const dismissReminder = async () => {
    setShowReminder(false);
    try {
      if (user) {
        const userId = user._id || user.email;
        const reminderKey = `${KYC_REMINDER_KEY_PREFIX}${userId}`;
        // Update the last reminder timestamp when dismissed
        await AsyncStorage.setItem(reminderKey, Date.now().toString());
      }
    } catch (error) {
      console.error("Error dismissing KYC reminder:", error);
    }
  };

  const resetReminder = async () => {
    try {
      if (user) {
        const userId = user._id || user.email;
        const reminderKey = `${KYC_REMINDER_KEY_PREFIX}${userId}`;
        const sessionKey = `${KYC_LOGIN_SESSION_KEY}${userId}`;
        await AsyncStorage.removeItem(reminderKey);
        await AsyncStorage.removeItem(sessionKey);
        setShowReminder(false);
      }
    } catch (error) {
      console.error("Error resetting KYC reminder:", error);
    }
  };

  return {
    showReminder,
    dismissReminder,
    resetReminder,
    needsKyc: user ? !user.kycVerified : false,
  };
};
