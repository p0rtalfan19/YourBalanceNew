import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { processCardImage } from '@/services/api';

export default function BalanceCard() {
  const [image, setImage] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Функция выбора фото и отправки на сервер
  const pickImageAndSend = async () => {
    setBalance(null);
    setImage(null);
    setLoading(true);

    // Выбор фото
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      
      try {
        const response = await processCardImage(uri);
        if (response.success && response.data) {
          setBalance(response.data.balance);
        } else {
          setBalance('Ошибка: ' + (response.error || 'Неизвестная ошибка'));
        }
      } catch (e) {
        setBalance('Ошибка соединения');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Выбрать фото проездного" onPress={pickImageAndSend} />
      {loading && <ActivityIndicator size="large" color="#2196F3" />}
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {balance && (
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Баланс проездного:</Text>
          <Text style={styles.balanceValue}>{balance} руб.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 220,
    height: 140,
    marginVertical: 16,
    borderRadius: 8,
  },
  balanceContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#757575',
  },
  balanceValue: {
    fontSize: 32,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});