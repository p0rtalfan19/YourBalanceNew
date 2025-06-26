import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { RefreshCw, CreditCard, Calendar, DollarSign, TrendingUp } from 'lucide-react-native';
import BalanceCard from '@/components/BalanceCard';
import { getStoredCardData, refreshBalance } from '@/services/api';
import { CardData } from '@/types';
import { useFocusEffect } from '@react-navigation/native';

export default function BalanceScreen() {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadCardData = async () => {
    try {
      const data = await getStoredCardData();
      setCardData(data);
      if (data) {
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load card data:', error);
    }
  };

  const handleRefresh = async () => {
    if (!cardData) {
      Alert.alert(
        'No Card Data',
        'Please scan a card first to refresh the balance.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRefreshing(true);
    try {
      const updatedData = await refreshBalance(cardData.cardNumber);
      if (updatedData.success && updatedData.data) {
        setCardData(updatedData.data);
        setLastUpdated(new Date());
        Alert.alert('Success', 'Balance updated successfully!');
      } else {
        Alert.alert(
          'Refresh Failed',
          updatedData.error || 'Failed to refresh balance. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to refresh balance. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCardData();
    }, [])
  );

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Card Balance</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}>
          <RefreshCw
            size={24}
            color="#2196F3"
            style={[isRefreshing && styles.spinning]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }>
        {cardData ? (
          <>
            <BalanceCard data={cardData} />
            
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Quick Stats</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <DollarSign size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statLabel}>Current Balance</Text>
                  <Text style={styles.statValue}>${cardData.balance}</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <TrendingUp size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statLabel}>Card Type</Text>
                  <Text style={styles.statValue}>{cardData.cardType || 'Unknown'}</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Calendar size={24} color="#9C27B0" />
                  </View>
                  <Text style={styles.statLabel}>Последнее обновление</Text>
                  <Text style={styles.statValue}>{formatLastUpdated(lastUpdated)}</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <CreditCard size={24} color="#2196F3" />
                  </View>
                  <Text style={styles.statLabel}>Статус карты</Text>
                  <Text style={[styles.statValue, styles.activeStatus]}>Активна</Text>
                </View>
              </View>
            </View>

            {cardData.lastTransactions && cardData.lastTransactions.length > 0 && (
              <View style={styles.transactionsContainer}>
                <Text style={styles.transactionsTitle}>Последние операции</Text>
                {cardData.lastTransactions.map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.amount > 0 ? styles.creditAmount : styles.debitAmount,
                      ]}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <CreditCard size={64} color="#BDBDBD" />
            </View>
            <Text style={styles.emptyTitle}>Нет данных по карте</Text>
            <Text style={styles.emptySubtitle}>
              Отсканируйте карту на главном экране, чтобы увидеть информацию о балансе
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Roboto-Bold',
    color: '#212121',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    textAlign: 'center',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  transactionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionsTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
  },
  transactionAmount: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Roboto-Medium',
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#9E9E9E',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
});