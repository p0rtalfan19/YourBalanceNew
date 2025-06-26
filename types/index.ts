export interface CardData {
  cardNumber: string;
  balance: string;
  cardType?: string;
  cardHolder?: string;
  expiryDate?: string;
  issuer?: string;
  lastTransactions?: Transaction[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ScanResult {
  success: boolean;
  cardData?: CardData;
  error?: string;
  confidence?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface CameraPermission {
  granted: boolean;
  canAskAgain: boolean;
}

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: string;
}