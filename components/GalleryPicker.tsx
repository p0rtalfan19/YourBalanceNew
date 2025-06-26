import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Image as ImageIcon, Upload } from 'lucide-react-native';

interface GalleryPickerProps {
  onSelect: (imageUri: string) => void;
  onClose: () => void;
}

export default function GalleryPicker({ onSelect, onClose }: GalleryPickerProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Требуется разрешение',
        'Извините, для выбора изображений из галереи нужно разрешение на доступ к фото.',
        [{ text: 'ОК' }]
      );
      return false;
    }
    return true;
  };

  const selectImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsSelecting(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onSelect(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image selection error:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение. Пожалуйста, попробуйте ещё раз.');
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title}>Выбрать из галереи</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {/* <View style={styles.iconBackground}>
            <ImageIcon size={64} color="#2196F3" style={{ opacity: 0.15, position: 'absolute', top: 28, left: 28 }} />
            <ImageIcon size={64} color="#2196F3" />
          </View> */}
        </View>

        <Text style={styles.instructionTitle}>Выберите изображение карты</Text>
        <Text style={styles.instructionText}>
          Выберите чёткое фото вашей карты из галереи устройства. 
          Убедитесь, что детали карты видны, а изображение не размыто.
        </Text>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Советы для лучшего результата:</Text>
          <Text style={styles.tipItem}>• Выбирайте качественное изображение</Text>
          <Text style={styles.tipItem}>• Обеспечьте хорошее освещение на фото</Text>
          <Text style={styles.tipItem}>• Карта должна занимать большую часть кадра</Text>
          <Text style={styles.tipItem}>• Избегайте бликов и теней на изображении</Text>
        </View>

        <TouchableOpacity
          style={[styles.selectButton, isSelecting && styles.disabledButton]}
          onPress={selectImage}
          disabled={isSelecting}
          activeOpacity={0.8}>
          <Upload size={24} color="#ffffff" />
          <Text style={styles.selectButtonText}>
            {isSelecting ? 'Выбор...' : 'Открыть галерею'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.8}>
          <Text style={styles.cancelButtonText}>Отмена</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
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
    position: 'relative',
  },
  instructionTitle: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  tipsContainer: {
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
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: '#212121',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#424242',
    marginBottom: 6,
    lineHeight: 20,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
    shadowOpacity: 0,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});