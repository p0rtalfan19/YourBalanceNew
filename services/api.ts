import { CardData, ApiResponse, Transaction } from '@/types';

// Mock API configuration
const API_BASE_URL = 'https://your-api-backend.com/api';
const API_TIMEOUT = 10000; // 10 seconds

// Storage key for caching
const STORAGE_KEY = 'yourbalance_card_data';

/**
 * Process card image and extract balance information
 */
export async function processCardImage(imageUri: string): Promise<ApiResponse<CardData>> {
  try {
    // Create FormData for image upload
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'card_image.jpg',
    } as any);

    // Add additional parameters
    formData.append('scan_type', 'balance_check');
    formData.append('quality', 'high');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/scan-card`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      // Cache the successful result
      await storeCardData(data.data);
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to process card image',
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    // For demo purposes, return mock data
    const mockData: CardData = {
      cardNumber: '1234567890123456',
      balance: '45.67',
      cardType: 'Gift Card',
      cardHolder: 'Card Holder',
      expiryDate: '12/25',
      issuer: 'Sample Store',
      lastTransactions: [
        {
          id: '1',
          description: 'Purchase at Store #123',
          amount: -15.99,
          date: new Date().toISOString(),
        },
        {
          id: '2',
          description: 'Card Reload',
          amount: 50.00,
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    };

    await storeCardData(mockData);
    return {
      success: true,
      data: mockData,
    };
  }
}

/**
 * Refresh balance for existing card
 */
export async function refreshBalance(cardNumber: string): Promise<ApiResponse<CardData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/refresh-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        card_number: cardNumber,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      await storeCardData(data.data);
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to refresh balance',
      };
    }
  } catch (error) {
    console.error('Refresh Error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please try again.',
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }

    // For demo purposes, return updated mock data
    const existingData = await getStoredCardData();
    if (existingData) {
      const updatedData: CardData = {
        ...existingData,
        balance: (parseFloat(existingData.balance) + Math.random() * 10).toFixed(2),
        lastTransactions: [
          {
            id: Date.now().toString(),
            description: 'Balance Check',
            amount: 0,
            date: new Date().toISOString(),
          },
          ...(existingData.lastTransactions || []).slice(0, 4),
        ],
      };
      
      await storeCardData(updatedData);
      return {
        success: true,
        data: updatedData,
      };
    }

    return {
      success: false,
      error: 'No card data found to refresh',
    };
  }
}

/**
 * Store card data locally for caching
 */
async function storeCardData(data: CardData): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to store card data:', error);
  }
}

/**
 * Retrieve stored card data
 */
export async function getStoredCardData(): Promise<CardData | null> {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve card data:', error);
    return null;
  }
}

/**
 * Clear stored card data
 */
export async function clearStoredCardData(): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear card data:', error);
  }
}

/**
 * Health check for API connectivity
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
}