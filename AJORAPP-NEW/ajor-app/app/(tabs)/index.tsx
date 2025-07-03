import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import styles from "../styles/dashboard.styles";
import ScreenWrapper from "@/app/components/screenWrapper";
import { useRouter } from "expo-router";
import { getFromStorage } from "../components/storage";
import { jwtDecode } from "jwt-decode";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';


const DashboardScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalContributed, setTotalContributed] = useState<number | null>(null);
  const [activeGroups, setActiveGroups] = useState<number | null>(null);
  const [groups, setGroups] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getFromStorage("token");
      const decoded: any = jwtDecode(token);
      if (!decoded?.user_id) throw new Error("Invalid or missing user ID");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      // Fetch groups
      const groupsRes = await fetch(`${API_BASE}/contributions`, { headers });
      if (!groupsRes.ok) throw new Error("Failed to fetch groups");
      const groupsData = await groupsRes.json();
      setGroups(Array.isArray(groupsData) ? groupsData : []);
      setActiveGroups(Array.isArray(groupsData) ? groupsData.length : 0);

      const txRes = await fetch(`${API_BASE}/wallet/transactions`, { headers });
      if (!txRes.ok) throw new Error("Failed to fetch transactions");
      const txData = await txRes.json();
      const txArray = Array.isArray(txData)
        ? txData
        : Array.isArray(txData.transactions)
          ? txData.transactions
          : [];
      // Only sum contributions to groups the user belongs to
      const groupIds = (Array.isArray(groupsData) ? groupsData : []).map((g: any) => g.id || g._id);
      const total = txArray
        .filter((t: any) => t.type === "contribution" && t.status === "success" && groupIds.includes(t.contribution_id))
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      setTotalContributed(total);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "#ef4444", fontSize: 16, marginBottom: 20, textAlign: "center" }}>{error}</Text>
        <TouchableOpacity style={{ backgroundColor: "#3b82f6", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 }} onPress={fetchDashboardData}>
          <Text style={{ color: "white", fontSize: 16 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.overview}>Overview</Text>
        <View style={[styles.card, styles.green]}>
          <View style={styles.cardContent}>
            <View style={styles.iconBox}>
              <Ionicons name="cash" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.label}>Total Contributed</Text>
              <Text style={styles.value}>NGN {totalContributed !== null ? totalContributed.toLocaleString() : "-"}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.card, styles.blue]}>
          <View style={styles.cardContent}>
            <View style={styles.iconBox}>
              <Ionicons name="people" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.label}>Active Groups</Text>
              <Text style={styles.value}>{activeGroups !== null ? activeGroups : "-"}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'service coming soon')}
            style={[styles.actionCard, { backgroundColor: "#eef2ff" }]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: "#4f46e5" }]}> 
              <Ionicons name="send" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Send</Text>
            <Text style={styles.actionSubtitle}>Transfer funds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("../components/createAjoGroup")}
            style={[styles.actionCard, { backgroundColor: "#fdf4ff" }]}
          >
            <View>
              <View style={[styles.iconWrapper, { backgroundColor: "#d946ef" }]}> 
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>New Group</Text>
              <Text style={styles.actionSubtitle}>Create group</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'service coming soon')}
            style={[styles.actionCard, { backgroundColor: "#fff7ed" }]}
          >
            <View style={[styles.iconWrapper, { backgroundColor: "#f97316" }]}> 
              <Ionicons name="card" size={24} color="#fff" />
            </View>
            <Text style={styles.actionTitle}>Pay Bills</Text>
            <Text style={styles.actionSubtitle}>Group expenses</Text>
          </TouchableOpacity>
        </View>
        {/* <Text style={styles.sectionTitle}>Recent Activity</Text> */}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default DashboardScreen;
