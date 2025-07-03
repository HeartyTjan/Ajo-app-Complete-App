import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import styles from "../styles/createAjoGroup.styles";
import { Stack, useRouter } from "expo-router";
import { getFromStorage, saveToStorage } from "../components/storage";
import RNPickerSelect from "react-native-picker-select";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';
export default function CreateAjoGroup() {
  const router = useRouter();

  const [group, setGroup] = useState({
    name: "",
    description: "",
    amount: "",
    cycle: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { name, description, amount, cycle } = group;

    if (!name || !description || !amount || !cycle) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);

    try {
      const token = await getFromStorage("token");

      if (!token) {
        Alert.alert("Error", "User not authenticated");
        setLoading(false);
        return;
      }

      const payload = {
        name,
        description,
        amount: parseFloat(amount),
        cycle,
        type: group.type,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        `${API_BASE}/contributions`,
        payload,
        config
      );

      Alert.alert("Success", "Ajo Group Created");

      const newGroup = response.data;

      setGroup({
        name: "",
        description: "",
        amount: "",
        cycle: "",
        type: "",
      });

      router.replace("/(tabs)/groups");
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to create Ajo group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Stack.Screen
        options={{ title: "Create Ajo Group", headerShown: true }}
      />

      <View style={styles.field}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          value={group.name}
          onChangeText={(text) => setGroup({ ...group, name: text })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={group.description}
          onChangeText={(text) => setGroup({ ...group, description: text })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={group.amount}
          onChangeText={(text) => setGroup({ ...group, amount: text })}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cycle</Text>
        <RNPickerSelect
          onValueChange={(value) => setGroup({ ...group, cycle: value })}
          placeholder={{ label: "Select cycle", value: null }}
          items={[
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
            { label: "Daily", value: "daily" },
          ]}
          style={{
            inputIOS: styles.inputDropDown,
            inputAndroid: styles.inputDropDown,
          }}
          value={group.cycle}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Type</Text>
        <RNPickerSelect
          onValueChange={(value) => setGroup({ ...group, type: value })}
          placeholder={{ label: "Select type", value: null }}
          items={[
            { label: "Fixed", value: "daily_savings" },
            { label: "Rotating", value: "group_contribution" },
          ]}
          style={{
            inputIOS: styles.inputDropDown,
            inputAndroid: styles.inputDropDown,
          }}
          value={group.type}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {loading ? "Creating..." : "Create Group"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
