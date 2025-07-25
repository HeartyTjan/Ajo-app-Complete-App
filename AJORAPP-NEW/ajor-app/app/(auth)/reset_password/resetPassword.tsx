import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./resetPassword.styles";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const validatePassword = (pwd: string) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*()\-_=+\[\]{}|;:',.<>?/`~\\"]/.test(pwd)
    );
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, digit, and special character");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Password reset successful. You can now log in.", [
          { text: "OK", onPress: () => router.replace("/(auth)/login/login") },
        ]);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        placeholder="New Password"
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        placeholder="Confirm New Password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
        <Text style={styles.primaryButtonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
} 