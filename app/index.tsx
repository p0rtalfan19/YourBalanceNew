import React, { useState, Suspense, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Camera, Image as ImageIcon, Zap, RefreshCw, CreditCard, Calendar, DollarSign, TrendingUp } from 'lucide-react-native';
import LoadingOverlay from '@/components/LoadingOverlay';
import BalanceCard from '@/components/BalanceCard';
import { processCardImage, getStoredCardData, refreshBalance } from '@/services/api';
import { CardData } from '@/types';
import { useFocusEffect } from '@react-navigation/native';

// Dynamic imports for native components
const CameraScanner = React.lazy(() => import('@/components/CameraScanner'));
const GalleryPicker = React.lazy(() => import('@/components/GalleryPicker'));

export default function MainScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleImageCapture = async (imageUri: string) => {
    setShowCamera(false);
    setShowGallery(false);

    // Просто обновляем данные карты, так как обработка уже произошла в CameraScanner
    await loadCardData();
  };

  const handleRefresh = async () => {
    if (!cardData) {
      Alert.alert(
        'Нет данных карты',
        'Сначала отсканируйте карту для обновления баланса.',
        [{ text: 'ОК' }]
      );
      return;
    }

    setIsRefreshing(true);
    try {
      const updatedData = await refreshBalance(cardData.cardNumber);
      if (updatedData.success && updatedData.data) {
        setCardData(updatedData.data);
        setLastUpdated(new Date());
        Alert.alert('Успех', 'Баланс успешно обновлен!');
      } else {
        Alert.alert(
          'Обновление не удалось',
          updatedData.error || 'Не удалось обновить баланс. Попробуйте еще раз.',
          [{ text: 'ОК' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Ошибка',
        'Не удалось обновить баланс. Проверьте соединение и попробуйте снова.',
        [{ text: 'ОК' }]
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCameraPress = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Камера недоступна',
        'Сканирование с помощью камеры недоступно в веб-версии. Пожалуйста, используйте галерею.',
        [{ text: 'ОК' }]
      );
      return;
    }
    setShowCamera(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadCardData();
    }, [])
  );

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Никогда';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes}м назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}ч назад`;
    return date.toLocaleDateString();
  };

  if (showCamera) {
    return (
      <Suspense fallback={<LoadingOverlay visible={true} message="Загрузка камеры..." />}>
        <CameraScanner
          onCapture={handleImageCapture}
          onClose={() => setShowCamera(false)}
        />
      </Suspense>
    );
  }

  if (showGallery) {
    return (
      <Suspense fallback={<LoadingOverlay visible={true} message="Загрузка галереи..." />}>
        <GalleryPicker
          onSelect={handleImageCapture}
          onClose={() => setShowGallery(false)}
        />
      </Suspense>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LoadingOverlay visible={isProcessing} message="Обработка изображения карты..." />
      
      <View style={styles.header}>
        <Text style={styles.title}>Ваш баланс RT</Text>
        <Text style={styles.subtitle}>Отсканируйте карту для проверки баланса</Text>
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
            <BalanceCard/>
            
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Быстрая статистика</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <DollarSign size={24} color="#4CAF50" />
                  </View>
                  <Text style={styles.statLabel}>Текущий баланс</Text>
                  <Text style={styles.statValue}>${cardData.balance}</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <TrendingUp size={24} color="#FF9800" />
                  </View>
                  <Text style={styles.statLabel}>Тип карты</Text>
                  <Text style={styles.statValue}>{cardData.cardType || 'Неизвестно'}</Text>
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

            <View style={styles.scanSection}>
              <Text style={styles.scanSectionTitle}>Сканировать новую карту</Text>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleCameraPress}
                  activeOpacity={0.8}>
                  <Camera size={24} color="#ffffff" />
                  <Text style={styles.primaryButtonText}>Сканировать камерой</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => setShowGallery(true)}
                  activeOpacity={0.8}>
                  <ImageIcon size={24} color="#2196F3" />
                  <Text style={styles.secondaryButtonText}>Выбрать из галереи</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Zap size={64} color="#2196F3" />
              </View>
            </View>

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Как отсканировать карту:</Text>
              <Text style={styles.instructionItem}>• Обеспечьте хорошее освещение</Text>
              <Text style={styles.instructionItem}>• Держите карту ровно и неподвижно</Text>
              <Text style={styles.instructionItem}>• Убедитесь, что весь текст виден</Text>
              <Text style={styles.instructionItem}>• Избегайте бликов и теней</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleCameraPress}
                activeOpacity={0.8}>
                <Camera size={24} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Сканировать камерой</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowGallery(true)}
                activeOpacity={0.8}>
                <ImageIcon size={24} color="#2196F3" />
                <Text style={styles.secondaryButtonText}>Выбрать из галереи</Text>
              </TouchableOpacity>
            </View>
          </>
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
    padding: 24,
    alignItems: 'center',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#212121',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
    marginBottom: 4,
  },
  buttonsContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#2196F3',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
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
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#212121',
    textAlign: 'center',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  transactionsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionsTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#212121',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  scanSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanSectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 