import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { penerimaanStyles as styles } from '../../styles/penerimaanStyles';
import ActionSheet from '../../components/ActionSheet';

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
  pelanggan_nama?: string;
  warung_nama?: string;
}

export default function PenerimaanListScreen() {
  const { token } = useAuth();
  const [requestList, setRequestList] = useState<RequestBarang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestBarang | null>(null);

  useEffect(() => {
    loadRequestBarang();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        loadRequestBarang();
      }
    }, [token])
  );

  const loadRequestBarang = async () => {
    try {
      if (!token) return;
      console.log('Loading request barang with token:', token.substring(0, 10) + '...');
      const data = await apiService.getAllRequestBarang(token);
      console.log('Request barang data received:', data);
      setRequestList(data);
    } catch (error) {
      console.error('Error loading request barang:', error);
      Alert.alert('Error', 'Gagal memuat data request barang');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMenu = (request: RequestBarang) => {
    setSelectedRequest(request);
    setShowActionSheet(true);
  };

  const getActionSheetOptions = () => {
    if (!selectedRequest) return [];
    
    const options = [
      {
        title: 'View Detail',
        icon: 'eye',
        onPress: () => handleViewDetail(selectedRequest)
      }
    ];

    // Tambahkan semua status enum
    const statusOptions = [
      { status: 'pending', title: 'Set Pending', icon: 'time', color: '#FF9800' },
      { status: 'disetujui', title: 'Setujui', icon: 'checkmark-circle', color: '#4CAF50' },
      { status: 'ditolak', title: 'Tolak', icon: 'close-circle', color: '#f44336' },
      { status: 'selesai', title: 'Selesaikan', icon: 'checkmark-done-circle', color: '#2196F3' }
    ];

    statusOptions.forEach(statusOption => {
      if (statusOption.status !== selectedRequest.status) {
        options.push({
          title: statusOption.title,
          icon: statusOption.icon,
          destructive: statusOption.status === 'ditolak',
          onPress: () => handleUpdateStatus(selectedRequest, statusOption.status)
        });
      }
    });

    return options;
  };

  const handleViewDetail = (request: RequestBarang) => {
    router.push(`/admin/request-detail?requestId=${request.id}`);
  };

  const handleUpdateStatus = (request: RequestBarang, newStatus: RequestBarang['status']) => {
    Alert.alert(
      'Konfirmasi',
      `${newStatus === 'disetujui' ? 'Setujui' : 'Tolak'} request ${request.nama_barang}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: newStatus === 'disetujui' ? 'Setujui' : 'Tolak',
          onPress: () => updateRequestStatus(request.id, newStatus)
        }
      ]
    );
  };

  const updateRequestStatus = async (requestId: number, status: RequestBarang['status']) => {
    try {
      setLoading(true);
      await apiService.updateRequestBarangStatus(token, requestId, status);
      Alert.alert('Berhasil', `Request berhasil ${status}`);
      loadRequestBarang();
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mengupdate status request');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'disetujui': return '#4CAF50';
      case 'ditolak': return '#f44336';
      case 'selesai': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'disetujui': return 'Disetujui';
      case 'ditolak': return 'Ditolak';
      case 'selesai': return 'Selesai';
      default: return 'Unknown';
    }
  };

  const filteredRequests = requestList.filter(item => 
    item.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRequest = ({ item }: { item: RequestBarang }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => router.push(`/admin/request-detail?requestId=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{item.nama_barang}</Text>
        <Text style={styles.requestDate}>Pelanggan: {item.pelanggan_nama || 'N/A'}</Text>
        <Text style={styles.requestQuantity}>Jumlah: {item.jumlah_dibutuhkan}</Text>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { 
          backgroundColor: getStatusColor(item.status) 
        }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={(e) => {
          e.stopPropagation();
          handleRequestMenu(item);
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Barang</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama barang atau status..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Request dari Pelanggan</Text>
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadRequestBarang}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="mail-outline" size={64} color="#ccc" />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {searchQuery ? 'Request tidak ditemukan' : 'Belum ada request barang'}
            </Text>
          </View>
        }
      />
      
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        options={getActionSheetOptions()}
        title={selectedRequest ? `Request: ${selectedRequest.nama_barang}` : ''}
      />
    </View>
  );
}