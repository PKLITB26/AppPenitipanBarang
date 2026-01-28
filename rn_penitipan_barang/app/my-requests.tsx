import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { router } from 'expo-router';

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

export default function MyRequestScreen() {
  const { token, user } = useAuth();
  const [requestList, setRequestList] = useState<RequestBarang[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pelangganId, setPelangganId] = useState<number | null>(null);

  const fetchPelangganProfile = async () => {
    try {
      if (!token || !user?.userId) return;
      
      const profile = await apiService.getPelangganByUserId(token, user.userId);
      setPelangganId(profile.id);
      return profile.id;
    } catch (error) {
      console.error('Error fetching pelanggan profile:', error);
      Alert.alert('Error', 'Gagal memuat profil pelanggan');
      return null;
    }
  };

  const fetchMyRequests = async () => {
    try {
      if (!token) return;
      
      let currentPelangganId = pelangganId;
      if (!currentPelangganId) {
        currentPelangganId = await fetchPelangganProfile();
        if (!currentPelangganId) return;
      }
      
      const data = await apiService.getRequestBarangByPelanggan(token, currentPelangganId);
      setRequestList(data);
    } catch (error) {
      console.error('Error fetching my requests:', error);
      Alert.alert('Error', 'Gagal memuat data request');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRequests();
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'disetujui': return '#4CAF50';
      case 'ditolak': return '#F44336';
      case 'selesai': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'disetujui': return 'Disetujui';
      case 'ditolak': return 'Ditolak';
      case 'selesai': return 'Selesai';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequestItem = ({ item }: { item: RequestBarang }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.barangName}>{item.nama_barang}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.jumlah}>Jumlah: {item.jumlah_dibutuhkan}</Text>
      
      {item.harga_estimasi && (
        <Text style={styles.harga}>
          Estimasi Harga: Rp {item.harga_estimasi.toLocaleString()}
        </Text>
      )}
      
      {item.deskripsi && (
        <Text style={styles.deskripsi}>{item.deskripsi}</Text>
      )}

      {item.catatan_admin && (
        <View style={styles.adminNote}>
          <Text style={styles.adminNoteLabel}>Catatan Admin:</Text>
          <Text style={styles.adminNoteText}>{item.catatan_admin}</Text>
        </View>
      )}

      <Text style={styles.dateText}>
        Dibuat: {formatDate(item.created_at)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Request Barang Saya</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/create-request')}
        >
          <Text style={styles.addButtonText}>+ Buat Request</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={requestList}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Belum ada request barang</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => router.push('/create-request')}
            >
              <Text style={styles.createFirstButtonText}>Buat Request Pertama</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barangName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  jumlah: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  harga: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deskripsi: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  adminNote: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  adminNoteLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  adminNoteText: {
    fontSize: 14,
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});