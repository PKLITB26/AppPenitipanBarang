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
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

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
  pelanggan?: {
    nama: string;
    warung: {
      nama: string;
    };
  };
}

export default function PenerimaanScreen() {
  const { token, user } = useAuth();
  const [requestList, setRequestList] = useState<RequestBarang[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequestBarang = async () => {
    try {
      if (!token) return;
      
      const data = await apiService.getAllRequestBarang(token);
      setRequestList(data);
    } catch (error) {
      console.error('Error fetching request barang:', error);
      Alert.alert('Error', 'Gagal memuat data request barang');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (requestId: number, status: RequestBarang['status']) => {
    try {
      if (!token) return;

      await apiService.updateRequestBarangStatus(token, requestId, status);
      Alert.alert('Sukses', `Request berhasil ${status}`);
      fetchRequestBarang();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Gagal mengupdate status request');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequestBarang();
  };

  useEffect(() => {
    fetchRequestBarang();
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

  const renderRequestItem = ({ item }: { item: RequestBarang }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <Text style={styles.barangName}>{item.nama_barang}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.pelangganInfo}>
        Pelanggan: {item.pelanggan?.nama || 'N/A'}
      </Text>
      <Text style={styles.warungInfo}>
        Warung: {item.pelanggan?.warung?.nama || 'N/A'}
      </Text>
      
      <Text style={styles.jumlah}>Jumlah: {item.jumlah_dibutuhkan}</Text>
      {item.harga_estimasi && (
        <Text style={styles.harga}>
          Estimasi Harga: Rp {item.harga_estimasi.toLocaleString()}
        </Text>
      )}
      
      {item.deskripsi && (
        <Text style={styles.deskripsi}>{item.deskripsi}</Text>
      )}

      {user?.role === 'admin' && item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleStatusUpdate(item.id, 'disetujui')}
          >
            <Text style={styles.buttonText}>Setujui</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleStatusUpdate(item.id, 'ditolak')}
          >
            <Text style={styles.buttonText}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}
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
      <Text style={styles.title}>Penerimaan Request Barang</Text>
      
      <FlatList
        data={requestList}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Tidak ada request barang</Text>
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
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
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
  pelangganInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  warungInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});