import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  // Fallback untuk development
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000/api';
    }
    
    return 'http://10.252.109.63:3000/api'; 
  }
  
  // Production URL
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiBaseUrl();

interface LoginResponse {
  message: string;
  token: string;
  userId: number;
  role: string;
}

interface RequestBarang {
  id: number;
  pelanggan_id: number;
  nama_barang: string;
  deskripsi?: string;
  jumlah_dibutuhkan: number;
  harga_estimasi?: number;
  status: 'pending' | 'disetujui' | 'ditolak' | 'selesai';
  catatan_admin?: string;
  created_at: string;
  updated_at: string;
}

interface ApiError {
  message: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔗 API Request:', url);
    console.log('📋 Headers:', options.headers);
    console.log('📤 Body:', options.body);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('⏳ Fetching...');
      const response = await fetch(url, config);
      
      console.log('📡 Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server mengembalikan response yang tidak valid');
      }
      
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan pada server');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ API Request Error:', {
          url,
          error: error.message,
          name: error.name
        });
        
        // Network error
        if (error.message === 'Network request failed' || error.name === 'TypeError') {
          throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan dan HP terhubung ke WiFi yang sama.');
        }
        
        throw error;
      }
      throw new Error('Tidak dapat terhubung ke server');
    }
  }

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Auth
  async login(no_telpon: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ no_telpon, password }),
    });
  }

  async resetPassword(no_telpon: string): Promise<any> {
    return this.request('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ no_telpon }),
    });
  }

  // Profile
  async getProfileStatus(token: string): Promise<any> {
    return this.request('/profile/profile-status', {
      headers: this.getAuthHeaders(token),
    });
  }

  // Users (Admin only)
  async getAllUsers(token: string): Promise<any[]> {
    return this.request('/users', {
      headers: this.getAuthHeaders(token),
    });
  }

  async createUser(token: string, userData: any): Promise<any> {
    return this.request('/users', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(token: string, userId: number): Promise<any> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Penitip
  async createPenitip(token: string, penitipData: any): Promise<any> {
    return this.request('/penitip', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(penitipData),
    });
  }

  async getAllPemasok(token: string): Promise<any[]> {
    return this.request('/penitip', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getPenitipByUserId(token: string, userId: number): Promise<any> {
    return this.request(`/penitip/user/${userId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async getPemasokDetail(token: string, userId: number): Promise<any> {
    return this.request(`/penitip/user/${userId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async deletePemasok(token: string, pemasokId: number): Promise<any> {
    return this.request(`/penitip/${pemasokId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  async togglePemasokStatus(token: string, profileId: number, status: string): Promise<any> {
    return this.request(`/penitip/${profileId}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });
  }

  // Pelanggan
  async createPelanggan(token: string, pelangganData: any): Promise<any> {
    return this.request('/pelanggan', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(pelangganData),
    });
  }

  async getAllPelanggan(token: string): Promise<any[]> {
    return this.request('/pelanggan', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getPelangganByUserId(token: string, userId: number): Promise<any> {
    return this.request(`/pelanggan/user/${userId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async getPelangganDetail(token: string, userId: number): Promise<any> {
    return this.request(`/pelanggan/user/${userId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async deletePelanggan(token: string, pelangganId: number): Promise<any> {
    return this.request(`/pelanggan/${pelangganId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  async togglePelangganStatus(token: string, profileId: number, status: string): Promise<any> {
    return this.request(`/pelanggan/${profileId}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ status }),
    });
  }

  // Barang
  async getAllBarang(token: string): Promise<any[]> {
    return this.request('/barang', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getBarangById(token: string, id: number): Promise<any> {
    return this.request(`/barang/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async createBarang(token: string, barangData: any): Promise<any> {
    return this.request('/barang', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(barangData),
    });
  }

  // Request Barang (Penerimaan)
  async getAllRequestBarang(token: string): Promise<RequestBarang[]> {
    return this.request('/request-barang', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getRequestBarangById(token: string, id: number): Promise<RequestBarang> {
    return this.request(`/request-barang/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async getRequestBarangByPelanggan(token: string, pelangganId: number): Promise<RequestBarang[]> {
    return this.request(`/request-barang/pelanggan/${pelangganId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async createRequestBarang(token: string, requestData: Omit<RequestBarang, 'id' | 'created_at' | 'updated_at'>): Promise<RequestBarang> {
    return this.request('/request-barang', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(requestData),
    });
  }

  async updateRequestBarangStatus(token: string, requestId: number, status: RequestBarang['status'], catatanAdmin?: string): Promise<RequestBarang> {
    return this.request(`/request-barang/${requestId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ status, catatan_admin: catatanAdmin }),
    });
  }

  // Transaksi
  async getAllTransaksi(token: string): Promise<any[]> {
    return this.request('/transaksi', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getTransaksiById(token: string, id: number): Promise<any> {
    return this.request(`/transaksi/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async deleteTransaksi(token: string, id: number): Promise<any> {
    return this.request(`/transaksi/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Download report
  async downloadReport(token: string, type: string, period: string = 'all'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/laporan/download/${type}?period=${period}`, {
      headers: this.getAuthHeaders(token),
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengunduh laporan');
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();