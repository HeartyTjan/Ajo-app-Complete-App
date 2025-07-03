import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useRouter, Stack } from "expo-router";

import { getFromStorage, saveToStorage } from "../components/storage";
import styles from "../styles/editProfile.styles";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

export default function EditProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    profile_pic: "",
  });
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const user = await getFromStorage("user");
        const userProfile = await getFromStorage("user_profile");
        const jwt = await getFromStorage("token");

        setToken(jwt);
        setUserId(user?._id);

        setProfile({
          username: user?.username || "",
          email: user?.email || "",
          phone: user?.phone || "",
          bio: userProfile?.bio || "",
          location: userProfile?.location || "",
          profile_pic: userProfile?.profile_pic || null,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const pickImage = async () => {
    setImageLoading(true);
    try {
      // Request permissions first
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [10, 5],
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setProfile((prev) => ({ ...prev, profile_pic: uri }));
        // await saveToStorage("user_profile", { ...profile, profile_pic: uri });
        await saveToStorage("user_profile", profile);

        Alert.alert("Success", "Profile picture selected");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.put(
        `${API_BASE}/profile/${userId}`,
        {
          bio: profile.bio,
          location: profile.location,
          profile_pic: profile.profile_pic,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProfile((prev) => ({
        ...prev,
        bio: data.bio || prev.bio,
        location: data.location || prev.location,
        profile_pic: data.profile_pic || prev.profile_pic,
      }));

      await saveToStorage("user_profile", {
        bio: data.bio,
        location: data.location,
        profile_pic: data.profile_pic,
      });

      Alert.alert("Success", "Profile updated successfully");
    } catch (err: any) {
      console.error(err?.response?.data || err.message);
      Alert.alert(
        "Error",
        err?.response?.data?.error || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Edit Profile",
          headerBackTitle: "Back",
          headerBackVisible: true,
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTintColor: "#333",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />

      <View style={styles.profilePicSection}>
        {profile.profile_pic && (
          <Image
            source={{ uri: profile.profile_pic }}
            style={styles.profileImage}
          />
        )}
        <TouchableOpacity
          onPress={pickImage}
          style={styles.uploadButton}
          disabled={imageLoading}
        >
          {imageLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.changePicText}>
              {profile.profile_pic ? "Change Picture" : "Add Picture"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Username (read-only) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Username</Text>
        <View style={styles.disabledInput}>
          <Text style={styles.disabledText}>{profile?.username}</Text>
        </View>
      </View>

      {/* Email (Non-editable) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <View style={styles.disabledInput}>
          <Text style={styles.disabledText}>{profile?.email}</Text>
        </View>
      </View>

      {/* Phone Number */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(text) => setProfile({ ...profile, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={profile.bio}
          onChangeText={(text) => setProfile({ ...profile, bio: text })}
          multiline
        />
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TextInput
          style={styles.input}
          value={profile.location}
          onChangeText={(text) => setProfile({ ...profile, location: text })}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        {isLoading ? (
          <Text style={styles.saveButtonText}>Saving...</Text>
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      {/* Danger Zone */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => router.push("./changePassword")}
        >
          <Text style={styles.dangerButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerButton, { borderColor: "#ff4444" }]}
        >
          <Text style={[styles.dangerButtonText, { color: "#ff4444" }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
