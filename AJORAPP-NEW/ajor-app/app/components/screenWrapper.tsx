import { View, Text, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { jwtDecode } from "jwt-decode";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { getFromStorage } from "./storage";

export default function ScreenWrapper({ children }) {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const loadUser = async () => {
    const token = await getFromStorage("token");
    const decoded = jwtDecode(token);
    setUsername(decoded?.username);
  };

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, []) // Add dependencies here
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hi {username}👋</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>

        <MaterialIcons
          name="notifications"
          size={28}
          color="#111"
          style={styles.notificationIcon}
          onPress={() => router.push("/notifications")}
        />
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // push notification icon to the right
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  welcomeSection: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
  },
  notificationIcon: {
    paddingRight: 5,
    paddingVertical: 8,
  },
});
