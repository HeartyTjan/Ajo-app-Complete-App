import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import GroupTransactions from '../components/groupTransactions';

const GroupTransactionsScreen = () => {
  const { contributionId } = useLocalSearchParams();
  if (!contributionId) return null;
  return <GroupTransactions contributionId={contributionId as string} />;
};

export default GroupTransactionsScreen; 