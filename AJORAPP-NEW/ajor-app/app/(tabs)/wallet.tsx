import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import styles from "../styles/wallet.styles";
import axios from "axios";
import { getFromStorage} from "../components/storage";
import { useFocusEffect } from "expo-router";
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

const WalletScreen = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [ownerNames, setOwnerNames] = useState<{ from?: string; to?: string }>({});
  const [contributionName, setContributionName] = useState<string>("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  const statusColors = {
    success: '#22c55e',
    pending: '#f59e42',
    failed: '#ef4444',
  };

  const getStatusKey = (status: any): keyof typeof statusColors => {
    const s = (typeof status === 'string' ? status.toLowerCase() : 'pending') as keyof typeof statusColors;
    return (s in statusColors ? s : 'pending');
  };

  const loadWallet = async () => {
    try {
      const token = await getFromStorage("token");
      if (!token) {
        Alert.alert("Error", "User not authenticated");
        return;
      }

      const res = await axios.get(`${API_BASE}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWallet(res.data);
    } catch (err) {
      Alert.alert("Error", "Could not load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = await getFromStorage("token");
      const res = await axios.get(`${API_BASE}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data.transactions || res.data || []);
    } catch (err) {
      setTransactions([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWallet();
      fetchTransactions();
    }, [])
  );

  const handleFundWallet = async () => {
    if (!fundAmount || isNaN(Number(fundAmount)) || Number(fundAmount) <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount");
      return;
    }
    setFunding(true);
    try {
      const token = await getFromStorage("token");
      // Use real endpoint for production
      const res = await axios.post(
        `${API_BASE}/wallet/fund`,
        { amount: Number(fundAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", `Wallet funding initiated. Please complete the transfer to your virtual account.`);
      setFundModalVisible(false);
      setFundAmount("");
      loadWallet();
      fetchTransactions();
      // Optionally, trigger notification refresh here
    } catch (err) {
      Alert.alert("Error", "Failed to initiate wallet funding");
    } finally {
      setFunding(false);
    }
  };

  const handleTransactionPress = (item: any) => {
    setSelectedTransaction(item);
    setDetailsModalVisible(true);
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedTransaction) return;
      setDetailsLoading(true);
      try {
        const token = await getFromStorage("token");
        // Fetch from_wallet owner
        const fromRes = await fetch(`${API_BASE}/users/${selectedTransaction.from_wallet}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fromData = await fromRes.json();

        const toRes = await fetch(`${API_BASE}/users/${selectedTransaction.to_wallet}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const toData = await toRes.json();
        // Fetch contribution name
        let contribName = '';
        if (selectedTransaction.contribution_id) {
          const contribRes = await fetch(`${API_BASE}/contributions/${selectedTransaction.contribution_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const contribData = await contribRes.json();
          contribName = contribData.name || contribData.contribution?.name || '';
        }
        setOwnerNames({ from: fromData.name || fromData.full_name || fromData.first_name || '', to: toData.name || toData.full_name || toData.first_name || '' });
        setContributionName(contribName);
      } catch (err) {
        setOwnerNames({});
        setContributionName("");
      } finally {
        setDetailsLoading(false);
      }
    };
    if (selectedTransaction) fetchDetails();
  }, [selectedTransaction]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No wallet found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>
          Account Number: {wallet.virtual_account_number || "N/A"}
        </Text>
        <Text style={styles.balance}>₦{wallet.balance.toLocaleString()}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={() => setFundModalVisible(true)}>
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.buttonText}>Fund Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Ionicons name="arrow-down-circle" size={24} color="white" />
            <Text style={styles.buttonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.transactionSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        <FlatList
          data={transactions}
          keyExtractor={(item, idx) => item._id || item.id || idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleTransactionPress(item)}>
              <View style={styles.transactionItem}>
                <MaterialCommunityIcons
                  name={item.type === "credit" || item.type === "contribution" ? "arrow-down-bold-circle" : "arrow-up-bold-circle"}
                  size={28}
                  color={item.type === "credit" || item.type === "contribution" ? "#4CAF50" : "#ef4444"}
                />
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDesc}>{item.description || item.type}</Text>
                  <Text style={styles.transactionDate}>{item.date ? new Date(item.date).toLocaleString() : ""}</Text>
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: item.type === "credit" || item.type === "contribution" ? "#4CAF50" : "#F44336" },
                  ]}
                >
                  {(item.type === "credit" || item.type === "contribution" ? "+" : "-") + "₦" + (item.amount?.toLocaleString() || "0")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions found</Text>}
          ListFooterComponent={
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreText}>See more</Text>
            </TouchableOpacity>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </View>

      {/* Fund Wallet Modal */}
      <Modal visible={fundModalVisible} animationType="slide" transparent onRequestClose={() => setFundModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Fund Wallet</Text>
            <TextInput
              placeholder="Enter amount"
              keyboardType="numeric"
              value={fundAmount}
              onChangeText={setFundAmount}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
            />
            <TouchableOpacity
              style={{ backgroundColor: '#0f766e', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 }}
              onPress={handleFundWallet}
              disabled={funding}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{funding ? 'Funding...' : 'Fund Wallet'}</Text>
            </TouchableOpacity>
            {__DEV__ && (
              <TouchableOpacity style={[styles.button, { backgroundColor: '#f59e42' }]} onPress={async () => {
                setFunding(true);
                try {
                  const token = await getFromStorage("token");
                  await axios.post(
                    `${API_BASE}/wallet/simulate-fund`,
                    { amount: Number(fundAmount) },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  Alert.alert("Test Only", `Simulated wallet funding with ₦${fundAmount}`);
                  setFundModalVisible(false);
                  setFundAmount("");
                  loadWallet();
                  fetchTransactions();
                } catch (err) {
                  Alert.alert("Error", "Failed to simulate fund wallet");
                } finally {
                  setFunding(false);
                }
              }}>
                <Text style={styles.buttonText}>Simulate Fund (Test Only)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setFundModalVisible(false)} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#0f766e', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>Transaction Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            {/* Status */}
            {selectedTransaction && (
              (() => {
                const status = getStatusKey(selectedTransaction.status);
                return (
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginBottom: 12, backgroundColor: statusColors[status] + '22' }}>
                    <Ionicons
                      name={status === 'success' ? 'checkmark-circle' : status === 'failed' ? 'close-circle' : 'time'}
                      size={22}
                      color={statusColors[status]}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{ color: statusColors[status], fontWeight: 'bold' }}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                  </View>
                );
              })()
            )}
            {/* Amount & Type */}
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#222', marginBottom: 2 }}>
              ₦{selectedTransaction?.amount?.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 2 }}>{selectedTransaction?.type || 'Transaction'}</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>{selectedTransaction ? new Date(selectedTransaction.date).toLocaleString() : ''}</Text>
            {/* Details */}
            <View style={{ backgroundColor: '#f7f7f7', borderRadius: 10, padding: 12, marginBottom: 16 }}>
              {/* Transaction ID */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>Transaction ID:</Text>
                <TouchableOpacity onPress={() => { Clipboard.setStringAsync(selectedTransaction?.id || selectedTransaction?._id || ''); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{(selectedTransaction?.id || selectedTransaction?._id)?.slice(0, 8)}...{(selectedTransaction?.id || selectedTransaction?._id)?.slice(-4)}</Text>
                  <MaterialIcons name="content-copy" size={16} color="#888" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
              {/* Group/Contribution */}
              {selectedTransaction?.contribution_id && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>Group:</Text>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{contributionName}</Text>
                </View>
              )}
              {/* From/To */}
              {selectedTransaction?.from_wallet && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>From:</Text>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{ownerNames.from}</Text>
                </View>
              )}
              {selectedTransaction?.to_wallet && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>To:</Text>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{ownerNames.to}</Text>
                </View>
              )}
              {/* Payment Method */}
              {selectedTransaction?.payment_method && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>Payment Method:</Text>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{selectedTransaction.payment_method}</Text>
                </View>
              )}
              {/* Reference/Description */}
              {selectedTransaction?.reference && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>Reference:</Text>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{selectedTransaction.reference}</Text>
                </View>
              )}
              {/* Status */}
              {selectedTransaction?.status && (
                (() => {
                  const status = getStatusKey(selectedTransaction.status);
                  return (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 14 }}>Status:</Text>
                      <Text style={{ color: statusColors[status], fontWeight: 'bold', fontSize: 14 }}>{selectedTransaction.status}</Text>
                    </View>
                  );
                })()
              )}
              {/* Any meta info */}
              {/* Add more fields as needed */}
            </View>
            {/* Actions */}
            <TouchableOpacity style={{ backgroundColor: '#0f766e', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={() => setDetailsModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletScreen;
