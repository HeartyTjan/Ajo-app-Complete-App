import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Clipboard,
  ToastAndroid,
  Platform,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { getFromStorage } from "../components/storage";
import styles from "../styles/groupDashboard";
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE 

export default function AjoGroupDashboard() {
  const router = useRouter();
  const { group } = useLocalSearchParams();

  const [ajoGroup, setAjoGroup] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributing, setContributing] = useState(false);
  const [adminName, setAdminName] = useState<string>("");
  const [memberNames, setMemberNames] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Memoize parsed group
  const parsedGroup = useMemo(() => {
    try {
      return typeof group === "string" ? JSON.parse(group) : group;
    } catch {
      return null;
    }
  }, [group]);

  useEffect(() => {
    setAjoGroup(parsedGroup);
  }, [parsedGroup]);

  const handlePress = () => {
    if (Platform.OS === 'web') {
      alert("This feature is currently unavailable. Please check back later.");
    } else {
      Alert.alert("Feature Unavailable", "This feature is currently unavailable. Please check back later.");
    }
  };
  // Define fetchWallet as a local function so it can be called after contribution
  const fetchWallet = async () => {
    if (!ajoGroup?.id && !ajoGroup?._id) return;
    setWalletLoading(true);
    setWalletError('');
    try {
      const token = await getFromStorage("token");
      if (!token) return;
      const groupId = ajoGroup.id || ajoGroup._id;
      const res = await fetch(`${API_BASE}/contributions/${groupId}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch wallet');
      const data = await res.json();
      setWallet(data);
    } catch (err) {
      setWallet(null);
      setWalletError('Could not load wallet info');
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (ajoGroup) fetchWallet();
  }, [ajoGroup]);

  useEffect(() => {
    const fetchAdminAndMembers = async () => {
      if (!ajoGroup) return;
      try {
        const token = await getFromStorage("token");
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userId = decoded.user_id || decoded.id || "";
        setCurrentUserId(userId);
        const adminUsername = ajoGroup.admin_username || ajoGroup.adminUsername || "(not found)";
        setAdminName(adminUsername);
        let adminId = ajoGroup.group_admin;
        setIsAdmin(userId === adminId);

        let members: any[] = [];
        const memberIds = [
          ...(ajoGroup.yet_to_collect_members || ajoGroup.yetToCollectMembers || []),
          ...(ajoGroup.already_collected_members || ajoGroup.alreadyCollectedMembers || []),
        ];
        const memberUsernames = ajoGroup.member_usernames || ajoGroup.memberUsernames || {};
        for (const id of memberIds) {
          if (!id) continue;
          let username = memberUsernames[id] || "(not found)";
          let role = id === adminId ? "Admin" : "Member";

          if (username === "(not found)") {
            try {
              const res = await fetch(`${API_BASE}/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              username = data.username || data.name || data.full_name || data.first_name || data.email || data._id || "(not found)";
            } catch (err) {
              
            }
          }
          if (id === adminId && (!username || username === "(not found)")) {
            username = adminUsername;
          }
          if (!username || username === "(not found)" || username === "(fetch error)") {
            username = id;
          }
          members.push({ id, username, role });
        }
        setMemberNames(members);
      } catch (err) {
        setAdminName("(fetch error)");
        setMemberNames([]);
      }
    };
    fetchAdminAndMembers();
  }, [ajoGroup]);


  const copyInviteLink = () => {
    const link = `https://ajor.com/invite/${ajoGroup?.invite_code || "code"}`;
    Clipboard.setString(link);
    ToastAndroid.show("Invite link copied!", ToastAndroid.SHORT);
  };

  const handleContribute = async () => {
    if (Platform.OS === 'web') {
      console.log("contributeAmount", contributeAmount);
      if (!contributeAmount || isNaN(Number(contributeAmount)) || Number(contributeAmount) <= 0) {
        window.alert(`Contribution amount must be ${contributeAmount}`);
        return;
      }
    } else {
      if (!contributeAmount || isNaN(Number(contributeAmount)) || Number(contributeAmount) <= 0) {
        Alert.alert("Invalid amount", `Contribution amount must be ${contributeAmount}`);
        return;
      }
    }
    
    setContributing(true);
    try {
      const token = await getFromStorage("token");
      const groupId = ajoGroup.id || ajoGroup._id;
      const res = await fetch(`${API_BASE}/contributions/${groupId}/contribute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: Number(contributeAmount), payment_method: 'manual' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to contribute');
      Alert.alert('Success', 'Contribution made successfully!');
      setContributeModalVisible(false);
      setContributeAmount("");
      // Refresh wallet info
      fetchWallet && fetchWallet();
      // Optionally, trigger a parent/group transactions refresh here
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to contribute');
    } finally {
      setContributing(false);
    }
  };

  const handleRemoveMember = (memberId: string, username: string) => {
    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${username} from the group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getFromStorage("token");
              const groupId = ajoGroup.id || ajoGroup._id;
              const res = await fetch(`${API_BASE}/contributions/${groupId}/${memberId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) throw new Error('Failed to remove member');
              Alert.alert('Success', 'Member removed successfully!');
              // Refresh members
              setMemberNames(members => members.filter(m => m.id !== memberId));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.groupName}>{ajoGroup?.name || "Ajo Group"}</Text>
        <TouchableOpacity onPress={() => setShowAdmin((prev) => !prev)} style={{ marginVertical: 4 }}>
          <Text style={[styles.tagText, { color: '#0f766e', textDecorationLine: 'underline' }]}>Show Admin</Text>
        </TouchableOpacity>
        {showAdmin && (
          <Text style={styles.tagText}>Admin: {adminName || "(not found)"}</Text>
        )}
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>
            {ajoGroup?.cycle || "Cycle"} - {ajoGroup?.type || "Type"}
          </Text>
        </View>
        <View style={styles.inviteContainer}>
          <TouchableOpacity
            onPress={copyInviteLink}
            style={styles.inviteButton}
          >
            <Text style={styles.inviteButtonText}>Invite Code: {ajoGroup?.invite_code || ajoGroup?.inviteCode || "code"}</Text>
            <Text style={styles.copyHintText}>(Tap to copy link)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Members */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity onPress={() => setMembersModalVisible(true)} style={{ marginBottom: 8, backgroundColor: '#0f766e', borderRadius: 8, padding: 12, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#fff' }}>View All Members</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Info */}
      <View style={styles.walletContainer}>
        <Text style={styles.walletTitle}>Group Wallet</Text>
        {walletLoading ? (
          <Text>Loading wallet info...</Text>
        ) : walletError ? (
          <Text style={{ color: 'red' }}>{walletError}</Text>
        ) : (
          <>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Account Number:</Text>
              <Text style={styles.walletValue}>
                {wallet?.virtual_account_number || "Not available"}
              </Text>
            </View>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Current Balance:</Text>
              <Text style={styles.walletValue}>
                ₦{wallet?.balance?.toLocaleString() || "0"}
              </Text>
            </View>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Total Contributed:</Text>
              <Text style={styles.walletValue}>
                ₦{wallet?.balance?.toLocaleString() || "0"}
              </Text>
            </View>
            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Next Payout:</Text>
              <Text style={styles.walletValue}>
                ₦{wallet?.balance?.toLocaleString() || "0"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setContributeModalVisible(true)}
        >
          <MaterialIcons name="attach-money" size={24} color="#0f766e" />
          <Text style={styles.menuText}>Contribute</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          // onPress={() => router.push({ pathname: '/ajo/recordPayment' })}
          onPress={handlePress}
        >
          <MaterialIcons name="payment" size={24} color="#0f766e" />
          <Text style={styles.menuText}>Record Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push({ pathname: '/ajo/groupTransactions', params: { contributionId: ajoGroup?.id || ajoGroup?._id } })}
        >
          <MaterialIcons name="receipt" size={24} color="#0f766e" />
          <Text style={styles.menuText}>View Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          // onPress={() => router.push({ pathname: '/ajo/settings' })}
          onPress={handlePress}
        >
          <Entypo name="cog" size={24} color="#0f766e" />
          <Text style={styles.menuText}>Group Settings</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={contributeModalVisible} animationType="slide" transparent onRequestClose={() => setContributeModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Contribute to Group</Text>
            <TextInput
              placeholder="Enter amount"
              keyboardType="numeric"
              value={contributeAmount}
              onChangeText={setContributeAmount}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#0f766e', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
              onPress={handleContribute}
              disabled={contributing}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{contributing ? 'Contributing...' : 'Contribute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setContributeModalVisible(false)} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#0f766e', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={membersModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMembersModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, width: '90%', maxHeight: '80%', padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#0f766e', textAlign: 'center' }}>Group Members</Text>
            <FlatList
              data={memberNames}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: item.role === 'Admin' ? '#0f766e' : '#222' }}>{item.username}</Text>
                    <Text style={{ fontSize: 12, color: item.role === 'Admin' ? '#0f766e' : '#888' }}>{item.role}</Text>
                  </View>
                  {isAdmin && item.role !== 'Admin' && (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(item.id, item.username)}
                      style={{ backgroundColor: '#ef4444', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No members found.</Text>}
              showsVerticalScrollIndicator={false}
              style={{ marginBottom: 10 }}
            />
            <TouchableOpacity onPress={() => setMembersModalVisible(false)} style={{ marginTop: 10, alignSelf: 'center', backgroundColor: '#0f766e', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
