import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { pemasokDetailStyles as styles } from '../../styles/pemasokDetailStyles';

export default function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams();
  const { token } = useAuth();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (token && requestId) {
      loadRequestDetail();
    }
  }, [token, requestId]);

  const loadRequestDetail = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRequestBarangById(token, requestId);
      setRequestData(data);
      setCatatanAdmin(data.catatan_admin || '');
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail request');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      setIsUpdating(true);
      await apiService.updateRequestBarangStatus(token, requestId, status, catatanAdmin);
      Alert.alert('Sukses', `Request berhasil ${status}`);
      loadRequestDetail();
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'disetujui': return '#4CAF50';
      case 'ditolak': return '#f44336';
      case 'selesai': return '#2196F3';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat detail request...</Text>
      </View>
    );
  }

  if (!requestData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Request</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>Data request tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(requestData.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(requestData.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(requestData.status) }]}>
              {requestData.status.toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.profileName}>{requestData.nama_barang}</Text>
          <Text style={styles.profileRole}>Request #{requestData.id}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="person" size={20} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Pelanggan</Text>
              <Text style={styles.infoValue}>{requestData.pelanggan_nama || requestData.warung_nama}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="cube" size={20} color="#4CAF50" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Jumlah Dibutuhkan</Text>
              <Text style={styles.infoValue}>{requestData.jumlah_dibutuhkan} unit</Text>
            </View>
          </View>

          {requestData.harga_estimasi && (
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="cash" size={20} color="#FF9800" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Harga Estimasi</Text>
                <Text style={styles.infoValue}>{formatCurrency(requestData.harga_estimasi)}</Text>
              </View>
            </View>
          )}

          {requestData.deskripsi && (
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="document-text" size={20} color="#9C27B0" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Deskripsi</Text>
                <Text style={styles.infoValue}>{requestData.deskripsi}</Text>
              </View>
            </View>
          )}

          <View style={[styles.infoItem, styles.infoItemLast]}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color="#607D8B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tanggal Request</Text>
              <Text style={styles.infoValue}>{formatDate(requestData.created_at)}</Text>
            </View>
          </View>
        </View>

        {(requestData.status === 'pending' || requestData.status === 'disetujui' || requestData.status === 'ditolak') && (
          <View style={styles.infoSection}>
            <Text style={[styles.infoLabel, { marginBottom: 10 }]}>Catatan Admin</Text>
            <TextInput
              style={[styles.infoValue, { 
                borderWidth: 1, 
                borderColor: '#ddd', 
                padding: 10, 
                borderRadius: 8,
                minHeight: 80,
                textAlignVertical: 'top'
              }]}
              placeholder="Tambahkan catatan..."
              value={catatanAdmin}
              onChangeText={setCatatanAdmin}
              multiline
            />
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 15, gap: 10 }}>
              {requestData.status !== 'pending' && (
                <TouchableOpacity 
                  style={[styles.profileCard, { 
                    flex: 1, 
                    backgroundColor: '#FF9800', 
                    padding: 15,
                    opacity: isUpdating ? 0.7 : 1,
                    minWidth: '45%'
                  }]}
                  onPress={() => updateStatus('pending')}
                  disabled={isUpdating}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    {isUpdating ? 'Loading...' : 'Set Pending'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {requestData.status !== 'disetujui' && (
                <TouchableOpacity 
                  style={[styles.profileCard, { 
                    flex: 1, 
                    backgroundColor: '#4CAF50', 
                    padding: 15,
                    opacity: isUpdating ? 0.7 : 1,
                    minWidth: '45%'
                  }]}
                  onPress={() => updateStatus('disetujui')}
                  disabled={isUpdating}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    {isUpdating ? 'Loading...' : 'Setujui'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {requestData.status !== 'ditolak' && (
                <TouchableOpacity 
                  style={[styles.profileCard, { 
                    flex: 1, 
                    backgroundColor: '#f44336', 
                    padding: 15,
                    opacity: isUpdating ? 0.7 : 1,
                    minWidth: '45%'
                  }]}
                  onPress={() => updateStatus('ditolak')}
                  disabled={isUpdating}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    {isUpdating ? 'Loading...' : 'Tolak'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {requestData.status !== 'selesai' && (
                <TouchableOpacity 
                  style={[styles.profileCard, { 
                    flex: 1, 
                    backgroundColor: '#2196F3', 
                    padding: 15,
                    opacity: isUpdating ? 0.7 : 1,
                    minWidth: '45%'
                  }]}
                  onPress={() => updateStatus('selesai')}
                  disabled={isUpdating}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                    {isUpdating ? 'Loading...' : 'Selesaikan'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {requestData.catatan_admin && (
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="chatbubble" size={20} color="#FF5722" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Catatan Admin</Text>
                <Text style={styles.infoValue}>{requestData.catatan_admin}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}