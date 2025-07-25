import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { COLORS } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import styles from "./auth.styles";
import * as WebBrowser from "expo-web-browser";
import validateForm from "@/app/components/validateForm";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFromStorage, saveToStorage } from "@/app/components/storage";
import Constants from 'expo-constants';

// import { API_BASE_WEB, API_BASE_MOBILE } from "@env";
// import * as Google from "expo-auth-session/providers/google";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  console.log("API_BASE:", API_BASE);

  const handleLogin = async () => {
    const userInfo = { email, password };

    const validationErrors = {}; 

    const emailPattern = /\S+@\S+\.\S+/;

    if (!email) {
      validationErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      validationErrors.email = "Email is invalid";
    }

    if (!password) {
      validationErrors.password = "Password is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();

      if (response.status === 200) {
        await saveToStorage("token", data.token);
        console.log(data.token);
        alert("Login successful");
        router.replace("/(tabs)");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      {/* <Image
        source={require("../../../assets/images/react-logo.png")}
        style={styles.logo}
      /> */}
      <Ionicons name="leaf" size={24} color="white" />

      {/* Title */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          style={styles.input}
          value={email}
          onChangeText={(text) => [setErrors({}), setEmail(text)]}
        />
        {errors.email && <Text style={{ color: "red" }}>{errors.email}</Text>}

        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={(text) => [setErrors({}), setPassword(text)]}
        />
        {errors.password && (
          <Text style={{ color: "red" }}>{errors.password}</Text>
        )}
      </View>
      <View>
        {/* Terms & Conditions */}
        {/* <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing in, you agree to our{" "}
            <Text style={styles.termLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termLink}>Privacy Policy</Text>
          </Text>
        </View> */}

        {/* Login Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>
          <Link href="/(auth)/forget_password/forgetPassword">
            {" "}
            Forgot Password?{" "}
          </Link>
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.divider} />
      </View>

      {/* Google Button */}

      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.8}
          // onPress={() => promptAsync()}
        >
          <>
            <View style={styles.googleIconContainer}>
              <Ionicons name="logo-google" size={20} color={COLORS.surface} />
            </View>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}> Don`t have an account?</Text>
        <TouchableOpacity>
          <Text style={styles.footerLink}>
            {" "}
            <Link href="/(auth)/signup/signup">Sign up</Link>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
