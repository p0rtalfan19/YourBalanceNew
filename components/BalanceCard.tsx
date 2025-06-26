import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { CreditCard, Shield, CircleCheck as CheckCircle } from 'lucide-react-native';
import { CardData } from '@/types';

interface BalanceCardProps {
  data: CardData;
}

export default function BalanceCard({ data }: BalanceCardProps) {
  const formatCardNumber = (cardNumber: string) => {
    // Mask all but last 4 digits
    const lastFour = cardNumber.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  const getCardTypeColor = (cardType?: string) => {
    switch (cardType?.toLowerCase()) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'amex':
      case 'american express':
        return '#006FCF';
      default:
        return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Balance Card */}
      <View style={[styles.card, { backgroundColor: getCardTypeColor(data.cardType) }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTypeContainer}>
            <CreditCard size={24} color="#ffffff" />
            <Text style={styles.cardTypeText}>
              {data.cardType || 'Подарочная карта'}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <CheckCircle size={20} color="#4CAF50" />
            <Text style={styles.statusText}>Активна</Text>
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Доступный баланс</Text>
          <Text style={styles.balanceAmount}>${data.balance}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardNumber}>
            {formatCardNumber(data.cardNumber)}
          </Text>
          <View style={styles.securityContainer}>
            <Shield size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.securityText}>Защищено</Text>
          </View>
        </View>

        {/* Card Chip Decoration */}
        <View style={styles.chipContainer}>
          <View style={styles.chip} />
        </View>
      </View>

      {/* Additional Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Владелец карты</Text>
          <Text style={styles.infoValue}>{data.cardHolder || 'Владелец карты'}</Text>
        </View>
        
        {data.expiryDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Действует до</Text>
            <Text style={styles.infoValue}>{data.expiryDate}</Text>
          </View>
        )}
        
        {data.issuer && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Эмитент</Text>
            <Text style={styles.infoValue}>{data.issuer}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Последнее обновление</Text>
          <Text style={styles.infoValue}>
            {new Date().toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTypeText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    textTransform: 'uppercase',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Roboto-Medium',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 48,
    fontFamily: 'Roboto-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 1,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  chipContainer: {
    position: 'absolute',
    top: 80,
    left: 24,
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
  },
});