import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { pelangganDetailStyles as styles } from '../../styles/pelangganDetailStyles';

export default function PelangganDetailScreen() {
  const { pelangganId } = useLocalSearchParams();
  const { token } = useAuth();
  const [pelangganData, setPelangganData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPelangganDetail();
  }, []);

  const loadPelangganDetail = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPelangganDetail(token, pelangganId);
      setPelangganData(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return status === 'aktif' ? '#4CAF50' : '#f44336';
  };

  const getStatusText = (status) => {
    return status === 'aktif' ? 'Active' : 'Inactive';
  };

  const hasCompleteProfile = () => {
    return pelangganData?.nama && pelangganData?.jenis_kelamin && pelangganData?.alamat;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat detail pelanggan...</Text>
      </View>
    );
  }

  if (!pelangganData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pelanggan</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>Data pelanggan tidak ditemukan</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pelanggan</Text>
        <TouchableOpacity onPress={() => router.push(`/admin/edit-pelanggan?pelangganId=${pelangganId}`)}>
          <Ionicons name="create-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {pelangganData.nama ? pelangganData.nama.charAt(0).toUpperCase() : 'P'}
            </Text>
          </View>
          
          <Text style={styles.profileName}>
            {pelangganData.nama || 'Nama Belum Diisi'}
          </Text>
          <Text style={styles.profileRole}>Pelanggan</Text>
          
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(pelangganData.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(pelangganData.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(pelangganData.status) }]}>
              {getStatusText(pelangganData.status)}
            </Text>
          </View>
        </View>

        {hasCompleteProfile() ? (
          <>
            {/* Account Information */}
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="call" size={20} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nomor Telepon</Text>
                  <Text style={styles.infoValue}>{pelangganData.no_telpon}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={20} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                  <Text style={styles.infoValue}>
                    {pelangganData.jenis_kelamin === 'laki_laki' ? 'Laki-laki' : 'Perempuan'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location" size={20} color="#FF9800" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Alamat</Text>
                  <Text style={styles.infoValue}>{pelangganData.alamat}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar" size={20} color="#9C27B0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                  <Text style={styles.infoValue}>
                    {pelangganData.tgl_lahir ? formatDate(pelangganData.tgl_lahir) : 'Belum diisi'}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoItem, styles.infoItemLast]}>
                <View style={styles.infoIcon}>
                  <Ionicons name="storefront" size={20} color="#FF5722" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Warung ID</Text>
                  <Text style={styles.infoValue}>{pelangganData.warung_id}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* Empty State */
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Ionicons name="person-add-outline" size={64} color="#ccc" />
            </View>
            <Text style={styles.emptyStateTitle}>Profil Belum Lengkap</Text>
            <Text style={styles.emptyStateText}>
              Pelanggan ini belum melengkapi profil mereka. Profil yang lengkap diperlukan untuk dapat menggunakan fitur warung.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}