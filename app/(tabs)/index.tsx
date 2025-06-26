import React, { useState, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Camera, Image as ImageIcon, Zap } from 'lucide-react-native';
import LoadingOverlay from '@/components/LoadingOverlay';
import { processCardImage } from '@/services/api';
import { CardData } from '@/types';

// Dynamic imports for native components
const CameraScanner = React.lazy(() => import('@/components/CameraScanner'));
const GalleryPicker = React.lazy(() => import('@/components/GalleryPicker'));

export default function ScanScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageCapture = async (imageUri: string) => {
    setIsProcessing(true);
    setShowCamera(false);
    setShowGallery(false);

    try {
      const result = await processCardImage(imageUri);
      if (result.success) {
        // Navigate to balance screen or update global state
        Alert.alert(
          'Успех!',
          `Карта успешно отсканирована. Баланс: $${result.data?.balance || '0.00'}`,
          [{ text: 'ОК' }]
        );
      } else {
        Alert.alert(
          'Сканирование не удалось',
          result.error || 'Не удалось обработать изображение карты. Пожалуйста, попробуйте еще раз.',
          [{ text: 'ОК' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Ошибка',
        'Произошла непредвиденная ошибка. Проверьте соединение и попробуйте снова.',
        [{ text: 'ОК' }]
      );
    } finally {
      setIsProcessing(false);
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

      <View style={styles.content}>
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
      </View>
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
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#424242',
    marginBottom: 6,
    lineHeight: 20,
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
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#2196F3',
  },
});