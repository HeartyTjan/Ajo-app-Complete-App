// app/settings/index.tsx
import React from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../components/themeContext";
import { getFromStorage, saveToStorage } from "../components/storage";
import styles from "../styles/settings.styles";

const SettingsScreen = () => {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme, colors } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  // Load saved preferences
  React.useEffect(() => {
    const loadSettings = async () => {
      const settings = await getFromStorage("user_settings");
      if (settings) {
        setNotificationsEnabled(settings.notifications ?? true);
      }
    };
    loadSettings();
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await saveToStorage("user_settings", {
      notifications: value,
    });
  };

  const handleThemeChange = async (value: boolean) => {
    const newTheme = value ? "dark" : "light";
    toggleTheme(newTheme);
  };

  const openContactSupport = () => {
    Linking.openURL("mailto:support@example.com?subject=App Support");
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Settings",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.text, fontWeight: "600" },
          headerTintColor: colors.primary,
          headerShown: true,
        }}
      />

      {/* App Preferences Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Preferences
        </Text>

        <View
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
        >
          <View style={styles.settingInfo}>
            <Feather name="bell" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Notifications
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
        >
          <View style={styles.settingInfo}>
            <Feather name="moon" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeChange}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
        >
          <View style={styles.settingInfo}>
            <Feather name="sun" size={20} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Theme Preference
            </Text>
          </View>
          <TouchableOpacity
            style={styles.themeOptionButton}
            onPress={() => toggleTheme("system")}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "system" && { color: colors.primary },
              ]}
            >
              System
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.themeOptionButton}
            onPress={() => toggleTheme("light")}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "light" && { color: colors.primary },
              ]}
            >
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.themeOptionButton}
            onPress={() => toggleTheme("dark")}
          >
            <Text
              style={[
                styles.themeOptionText,
                theme === "dark" && { color: colors.primary },
              ]}
            >
              Dark
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
