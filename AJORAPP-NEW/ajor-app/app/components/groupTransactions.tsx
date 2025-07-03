import React, { useEffect, useState} from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet, Platform, Modal, Pressable } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFromStorage } from './storage';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

const GroupTransactions = ({ contributionId }: { contributionId: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ownerNames, setOwnerNames] = useState<{ from?: string; to?: string }>({});
  const [contributionName, setContributionName] = useState<string>("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getFromStorage('token');
      const res = await fetch(`${API_BASE}/contributions/${contributionId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data.transactions || data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (contributionId) fetchTransactions();
  }, [contributionId]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedTransaction) return;
      setDetailsLoading(true);
      setDetailsError("");
      try {
        const token = await getFromStorage('token');
        // Fetch from_wallet owner
        let fromName = "";
        try {
          const fromRes = await fetch(`${API_BASE}/users/${selectedTransaction.from_wallet}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fromData = await fromRes.json();
          fromName = fromData.name || fromData.full_name || fromData.first_name || fromData.email || fromData._id || "(not found)";
        } catch {
          fromName = "(fetch error)";
        }
        // Fetch to_wallet owner
        let toName = "";
        try {
          const toRes = await fetch(`${API_BASE}/users/${selectedTransaction.to_wallet}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const toData = await toRes.json();
          toName = toData.name || toData.full_name || toData.first_name || toData.email || toData._id || "(not found)";
        } catch {
          toName = "(fetch error)";
        }
        // Fetch contribution name
        let contribName = '';
        try {
          if (selectedTransaction.contribution_id) {
            const contribRes = await fetch(`${API_BASE}/contributions/${selectedTransaction.contribution_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const contribData = await contribRes.json();
            contribName = contribData.name || contribData.contribution?.name || "(not found)";
          }
        } catch {
          contribName = "(fetch error)";
        }
        setOwnerNames({ from: fromName, to: toName });
        setContributionName(contribName);
      } catch (err) {
        setOwnerNames({ from: "(fetch error)", to: "(fetch error)" });
        setContributionName("(fetch error)");
        setDetailsError("Failed to load transaction details");
      } finally {
        setDetailsLoading(false);
      }
    };
    if (selectedTransaction) fetchDetails();
  }, [selectedTransaction]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const handlePress = (item: any) => {
    setSelectedTransaction(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable onPress={() => handlePress(item)}>
      <View style={styles.transactionItem}>
        <Ionicons
          name={item.type === 'contribution' ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={24}
          color={item.type === 'contribution' ? '#0f766e' : '#b91c1c'}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.amount}>₦{item.amount?.toLocaleString() || '0'}</Text>
          <Text style={styles.type}>{item.type || 'Transaction'}</Text>
          <Text style={styles.status}>{item.status || ''}</Text>
          <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
        </View>
      </View>
    </Pressable>
  );

  const statusColors = {
    success: '#22c55e',
    pending: '#f59e42',
    failed: '#ef4444',
  };

  // Helper to get a valid status key
  const getStatusKey = (status: any): keyof typeof statusColors => {
    const s = (typeof status === 'string' ? status.toLowerCase() : 'pending') as keyof typeof statusColors;
    return (s in statusColors ? s : 'pending');
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#0f766e" /></View>;
  }

  if (error) {
    return <View style={styles.centered}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }

  return (
    <>
      <FlatList
        data={transactions}
        keyExtractor={(item, idx) => item._id || item.id || idx.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={transactions.length === 0 && styles.centered}
        ListEmptyComponent={<Text>No transactions yet.</Text>}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>Transaction Details</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#222" />
              </Pressable>
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
                <Pressable onPress={() => { Clipboard.setStringAsync(selectedTransaction?.id || selectedTransaction?._id || ''); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#222', fontSize: 14, maxWidth: 180 }}>{(selectedTransaction?.id || selectedTransaction?._id)?.slice(0, 8)}...{(selectedTransaction?.id || selectedTransaction?._id)?.slice(-4)}</Text>
                  <MaterialIcons name="content-copy" size={16} color="#888" style={{ marginLeft: 4 }} />
                </Pressable>
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
            <Pressable style={{ backgroundColor: '#0f766e', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  type: {
    fontSize: 14,
    color: '#444',
  },
  status: {
    fontSize: 12,
    color: '#888',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});

export default GroupTransactions; 