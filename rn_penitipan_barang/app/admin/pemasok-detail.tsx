import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { pemasokDetailStyles as styles } from '../../styles/pemasokDetailStyles';

export default function PemasokDetailScreen() {
  const { pemasokId } = useLocalSearchParams();
  const { token } = useAuth();
  const [pemasokData, setPemasokData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔑 Current token:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('👤 Current user:', user);
    if (token && pemasokId) {
      loadPemasokDetail();
    }
  }, [token, pemasokId]);

  const loadPemasokDetail = async () => {
    try {
      console.log('🔍 Loading pemasok detail for ID:', pemasokId);
      setLoading(true);
      const data = await apiService.getPemasokDetail(token, pemasokId);
      console.log('✅ Pemasok detail loaded:', data);
      setPemasokData(data);
    } catch (error) {
      console.error('❌ Error loading pemasok detail:', error);
      Alert.alert('Error', 'Gagal memuat detail pemasok');
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
    return pemasokData?.nama && pemasokData?.jenis_kelamin && pemasokData?.alamat;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat detail pemasok...</Text>
      </View>
    );
  }

  if (!pemasokData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Pemasok</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>Data pemasok tidak ditemukan</Text>
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
        <Text style={styles.headerTitle}>Detail Pemasok</Text>
        <TouchableOpacity onPress={() => router.push(`/admin/edit-pemasok?pemasokId=${pemasokId}`)}>
          <Ionicons name="create-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {pemasokData.nama ? pemasokData.nama.charAt(0).toUpperCase() : 'P'}
            </Text>
          </View>
          
          <Text style={styles.profileName}>
            {pemasokData.nama || 'Nama Belum Diisi'}
          </Text>
          <Text style={styles.profileRole}>Pemasok</Text>
          
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(pemasokData.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(pemasokData.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(pemasokData.status) }]}>
              {getStatusText(pemasokData.status)}
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
                  <Text style={styles.infoValue}>{pemasokData.no_telpon}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="person" size={20} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Jenis Kelamin</Text>
                  <Text style={styles.infoValue}>
                    {pemasokData.jenis_kelamin === 'laki_laki' ? 'Laki-laki' : 'Perempuan'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location" size={20} color="#FF9800" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Alamat</Text>
                  <Text style={styles.infoValue}>{pemasokData.alamat}</Text>
                </View>
              </View>

              <View style={[styles.infoItem, styles.infoItemLast]}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar" size={20} color="#9C27B0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tanggal Lahir</Text>
                  <Text style={styles.infoValue}>
                    {pemasokData.tgl_lahir ? formatDate(pemasokData.tgl_lahir) : 'Belum diisi'}
                  </Text>
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
              Pemasok ini belum melengkapi profil mereka. Profil yang lengkap diperlukan untuk dapat menggunakan fitur penitipan barang.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}