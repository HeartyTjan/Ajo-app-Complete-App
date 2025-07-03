import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import styles from "./forgetPassword.styles";
import { Link } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleReset = () => {
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    // Send request to backend
    alert("Reset link sent to " + email);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/react-logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter the email linked to your account
      </Text>

      <TextInput
        placeholder="Email Address"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      {error !== "" && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.primaryButton} onPress={handleReset}>
        <Text style={styles.primaryButtonText}>Send Reset Link</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password?</Text>
        <Text style={styles.footerLink}>
          <Link href="/(auth)/login/login"> Go back to Login</Link>
        </Text>
      </View>
    </View>
  );
}
