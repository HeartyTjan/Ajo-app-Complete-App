import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { saveToStorage, getFromStorage } from "../components/storage";
import { useFocusEffect, useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import styles from "../styles/profile.styles";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeGroups, setActiveGroups] = useState<number | null>(null);
  const [totalContributed, setTotalContributed] = useState<number | null>(null);
  const router = useRouter();

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getFromStorage("token");
      const decoded: any = jwtDecode(token);
      if (!decoded?.user_id) throw new Error("Invalid or missing user ID");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      // Fetch user
      const userRes = await fetch(`${API_BASE}/users/${decoded.user_id}`, { headers });
      if (!userRes.ok) throw new Error("Failed to fetch user");
      const userData = await userRes.json();
      setUser(userData);
      await saveToStorage("user", userData);
      console.log("userData", userData.verified);
      // Fetch profile
      let storedProfile = await getFromStorage("user_profile");
      try { if (typeof storedProfile === "string") storedProfile = JSON.parse(storedProfile); } catch { storedProfile = null; }
      const isValidProfile = storedProfile && typeof storedProfile === "object" && Object.keys(storedProfile).length > 0;
      if (isValidProfile) {
        setProfile(storedProfile);
      } else if (userData?.profile) {
        setProfile(userData.profile);
        await saveToStorage("user_profile", userData.profile);
      } else {
        const profileRes = await fetch(`${API_BASE}/profile/${decoded.user_id}`, { headers });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);
        await saveToStorage("user_profile", profileData);
      }
     
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const handleSignOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          await saveToStorage("token", null);
          await saveToStorage("user", null);
          await saveToStorage("user_profile", null);
          router.replace("/(auth)/login/login");
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.scrollContainer}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {profile?.profile_pic ? (
            <Image source={{ uri: profile.profile_pic }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          ) : (
            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || "J"}</Text>
          )}
        </View>
        <Text style={styles.username}>{user?.username || "John Doe"}</Text>
        <View style={styles.verified}>
          <Text style={styles.verifiedText}>{user?.verified ? "Verified" : "Unverified"}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
  
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>{profile?.bio || ""}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="gray" />
            <Text style={styles.infoText}>{user?.email || "user@example.com"}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="gray" />
            <Text style={styles.infoText}>{user?.phone || "000-000-0000"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Entypo name="location-pin" size={20} color="gray" />
            <Text style={styles.infoText}>{profile?.location || "Unknown Location"}</Text>
          </View>
        </View>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("../components/editProfile")}> 
            <View style={styles.menuIcon}>
              <MaterialIcons name="edit" size={24} color="#0f766e" />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Entypo name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("../components/settings")}> 
            <View style={styles.menuIcon}>
              <MaterialIcons name="settings" size={24} color="#0f766e" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Entypo name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <View style={styles.menuIcon}>
              <MaterialIcons name="logout" size={24} color="#ef4444" />
            </View>
            <Text style={[styles.menuText, { color: "#ef4444" }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
