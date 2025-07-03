import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { COLORS } from "../../../constants/theme";
import styles from "./signup.styles";
import { Link, useRouter } from "expo-router";
import validateForm from "@/app/components/validateForm";
import { Feather } from "@expo/vector-icons";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

export default function Signup() {
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bvn, setBvn] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleSignup = async () => {
    const userInfo = { userName, email, phone, password, bvn };

    const validationErrors = validateForm(userInfo);

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      console.log("status", response.status);
      if (response.status === 201) {
        const data = await response.json();
        alert(data.message || "Signup successful");
        router.replace("/(auth)/login/login");
      } else {
        const error = await response.json();
        alert("Signup failed: " + (error?.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      {/* <Image
        source={require("../../../assets/images/react-logo.png")}
        style={styles.logo}
      /> */}

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="User Name"
          placeholderTextColor="#888"
          style={styles.input}
          value={userName}
          onChangeText={(text) => [setErrors({}), setUserName(text)]}
        />
        {errors.userName && (
          <Text style={styles.errorText}>{errors.userName}</Text>
        )}

        {/* <TextInput
          placeholder="Last Name"
          placeholderTextColor="#888"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        /> */}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#888"
          keyboardType="email-address"
          style={styles.input}
          value={email}
          onChangeText={(text) => [setErrors({}), setEmail(text)]}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          placeholder="Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          style={styles.input}
          value={phone}
          onChangeText={(text) => [setErrors({}), setPhone(text)]}
        />

        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <TextInput
          placeholder="BVN"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          style={styles.input}
          value={bvn}
          onChangeText={(text) => [setErrors({}), setBvn(text)]}
        />
        {errors.bvn && <Text style={styles.errorText}>{errors.bvn}</Text>}

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            style={styles.textInput}
            value={password}
            onChangeText={(text) => [setErrors({}), setPassword(text)]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPassword}
            style={styles.textInput}
            value={confirmPassword}
            onChangeText={(text) => [setErrors({}), setConfirmPassword(text)]}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Feather
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      <View style={styles.termsContainer}>
        <Text style={styles.termsText} onPress={() => setAgreed(!agreed)}>
          {agreed ? "☑" : "☐"} I agree to the{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !agreed && styles.disabledButton]}
        disabled={!agreed}
        onPress={handleSignup}
      >
        <Text style={styles.primaryButtonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.divider} />
      </View>

      {/* <TouchableOpacity style={styles.googleButton}>
        <Text style={styles.googleButtonText}>Sign up with Google</Text>
      </TouchableOpacity> */}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity>
          <Text style={styles.footerLink}>
            <Link href="/(auth)/login/login"> Log in </Link>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
