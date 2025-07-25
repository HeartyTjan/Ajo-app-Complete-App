import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Button, Alert, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getFromStorage } from '../components/storage';
import styles from '../styles/notifications.styles';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export const API_BASE = Constants.expoConfig?.extra?.API_BASE || 'http://localhost:8080';

const isDev = __DEV__;

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [relatedNames, setRelatedNames] = useState<{ [id: string]: string }>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [transactionFetchErrors, setTransactionFetchErrors] = useState<{ [id: string]: string }>({});
  const [contributionFetchErrors, setContributionFetchErrors] = useState<{ [id: string]: string }>({});
  const [markingAll, setMarkingAll] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getFromStorage('token');
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(typeof err === 'object' && err && 'message' in err ? (err as any).message : 'Error fetching notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // const createTestNotification = async () => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const token = await getFromStorage('token');
  //     const res = await fetch(`${API_BASE}/notifications/test`, {
  //       method: 'POST',
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.error || 'Failed to create test notification');
  //     Alert.alert('Success', 'Test notification created!');
  //     fetchNotifications();
  //   } catch (err: any) {
  //     Alert.alert('Error', err.message || 'Error creating test notification');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const markAsRead = async (id: string) => {
    try {
      const token = await getFromStorage('token');
      await fetch(`${API_BASE}/notifications/mark-read?id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {}
  };

  const markAsUnread = async (id: string) => {
    try {
      const token = await getFromStorage('token');
      await fetch(`${API_BASE}/notifications/mark-unread?id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch {}
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const token = await getFromStorage('token');
      await Promise.all(
        notifications.filter(n => !n.read).map(n =>
          fetch(`${API_BASE}/notifications/mark-read?id=${n.id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      fetchNotifications();
    } catch {}
    setMarkingAll(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications every 10 seconds if there are unread notifications
  useEffect(() => {
    const hasUnread = notifications.some(n => !n.read);
    if (!hasUnread) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [notifications]);

  useEffect(() => {
    const fetchRelatedNames = async () => {
      setDetailsLoading(true);
      setDetailsError('');
      const txErrors: { [id: string]: string } = {};
      const contribErrors: { [id: string]: string } = {};
      try {
        const token = await getFromStorage('token');
        const names: { [id: string]: string } = {};
        for (const n of notifications) {
          if (n.contribution_id && !names[n.contribution_id]) {
            if (!n.contribution_id || typeof n.contribution_id !== 'string' || n.contribution_id.length !== 24) {
              contribErrors[n.contribution_id] = 'Invalid or missing contribution ID';
              names[n.contribution_id] = '(invalid ID)';
              continue;
            }
            try {
              const res = await fetch(`${API_BASE}/contributions/${n.contribution_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (!res.ok) {
                contribErrors[n.contribution_id] = data.error || 'Unknown backend error';
                names[n.contribution_id] = '(fetch error)';
              } else {
                names[n.contribution_id] = data.name || data.contribution?.name || '(not found)';
              }
            } catch (err: any) {
              contribErrors[n.contribution_id] = err.message || 'Fetch error';
              names[n.contribution_id] = '(fetch error)';
            }
          }
          if (n.transaction_id && !names[n.transaction_id]) {
            if (!n.transaction_id || typeof n.transaction_id !== 'string' || n.transaction_id.length !== 24) {
              txErrors[n.transaction_id] = 'Invalid or missing transaction ID';
              names[n.transaction_id] = '(invalid ID)';
              continue;
            }
            try {
              console.log('Fetching transaction for ID:', n.transaction_id);
              const res = await fetch(`${API_BASE}/transactions/${n.transaction_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (!res.ok) {
                txErrors[n.transaction_id] = data.error || 'Unknown backend error';
                names[n.transaction_id] = '(fetch error)';
              } else {
                names[n.transaction_id] = data.description || data.type || '(not found)';
              }
            } catch (err: any) {
              txErrors[n.transaction_id] = err.message || 'Fetch error';
              names[n.transaction_id] = '(fetch error)';
            }
          }
        }
        setRelatedNames(names);
        setTransactionFetchErrors(txErrors);
        setContributionFetchErrors(contribErrors);
      } catch (err) {
        setDetailsError('Failed to load related info');
      } finally {
        setDetailsLoading(false);
      }
    };
    if (notifications.length > 0) fetchRelatedNames();
  }, [notifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (item: any) => {
    if (!item.read) markAsRead(item.id);
    if (item.action_link) {
      router.push(item.action_link);
      return;
    }
    if (item.meta && item.meta.group) {
      router.push({ pathname: '/ajo/groupTransactions', params: { groupName: item.meta.group } });
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'wallet_funded':
        return <MaterialIcons name="account-balance-wallet" size={22} color="#0f766e" style={{ marginRight: 4 }} />;
      case 'group_contribution':
        return <Ionicons name="people" size={22} color="#d946ef" style={{ marginRight: 4 }} />;
      case 'late_contribution':
        return <Ionicons name="alert-circle" size={22} color="#f59e42" style={{ marginRight: 4 }} />;
      case 'payout_approved':
        return <Ionicons name="checkmark-circle" size={22} color="#22c55e" style={{ marginRight: 4 }} />;
      case 'removed_from_group':
        return <Ionicons name="remove-circle" size={22} color="#ef4444" style={{ marginRight: 4 }} />;
      default:
        return <Ionicons name="notifications" size={22} color="#0f766e" style={{ marginRight: 4 }} />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)} style={[styles.notificationItem, !item.read && styles.unreadNotification, { borderLeftWidth: 4, borderLeftColor: item.read ? '#fff' : '#0f766e' }]}>
      <View style={{ position: 'relative', marginRight: 12 }}>
        {typeIcon(item.type)}
        {!item.read && (
          <View style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'red',
            borderWidth: 1,
            borderColor: '#fff',
          }} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.notificationTitle}>{item.title || 'Notification'}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        {item.meta && item.meta.group && (
          <Text style={{ color: '#0f766e', fontWeight: 'bold' }}>Group: {item.meta.group}</Text>
        )}
        {item.meta && item.meta.amount && (
          <Text style={{ color: '#0f766e' }}>Amount: NGN {item.meta.amount}</Text>
        )}
        <Text style={styles.notificationTime}>{new Date(item.created_at).toLocaleString()}</Text>
        <View style={{ flexDirection: 'row', marginTop: 4 }}>
          {item.read ? (
            <TouchableOpacity onPress={() => markAsUnread(item.id)}><Text style={{ color: '#0f766e', marginRight: 12 }}>Mark as Unread</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => markAsRead(item.id)}><Text style={{ color: '#0f766e', marginRight: 12 }}>Mark as Read</Text></TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, opacity: 0.5 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0f7fa', marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <View style={{ height: 16, backgroundColor: '#e0f7fa', marginBottom: 6, borderRadius: 4, width: '60%' }} />
              <View style={{ height: 12, backgroundColor: '#e0f7fa', marginBottom: 4, borderRadius: 4, width: '40%' }} />
              <View style={{ height: 10, backgroundColor: '#e0f7fa', borderRadius: 4, width: '30%' }} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity onPress={fetchNotifications} style={{ backgroundColor: '#0f766e', padding: 10, borderRadius: 6 }}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // if (!notifications.length) {
  //   return (
  //     <View style={styles.centered}>
  //       <Ionicons name="notifications-off" size={48} color="#888" style={{ marginBottom: 12 }} />
  //       <Text style={{ color: '#888', fontSize: 18, marginBottom: 8 }}>No notifications yet</Text>
  //       <Text style={{ color: '#aaa', fontSize: 14 }}>You'll see important updates here.</Text>
  //       {isDev && (
  //         <Button title="Create Test Notification" onPress={createTestNotification} />
  //       )}
  //     </View>a
  //   );
  // }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead} disabled={markingAll || notifications.every(n => n.read)} style={{ opacity: markingAll || notifications.every(n => n.read) ? 0.5 : 1 }}>
          <Text style={{ color: '#0f766e', fontWeight: 'bold' }}>{markingAll ? 'Marking...' : 'Mark All as Read'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
      {/* {isDev && (
        <View style={{ padding: 16 }}>
          <Button title="Create Test Notification" onPress={createTestNotification} />
        </View>
      )} */}
    </View>
  );
};

export default NotificationsScreen; 