import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { pemasokDetailStyles as styles } from '../../styles/pemasokDetailStyles';

export default function TransaksiDetailScreen() {
  const { transaksiId } = useLocalSearchParams();
  const { token } = useAuth();
  const [transaksiData, setTransaksiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && transaksiId) {
      loadTransaksiDetail();
    }
  }, [token, transaksiId]);

  const loadTransaksiDetail = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTransaksiById(token, transaksiId);
      setTransaksiData(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Konfirmasi',
      'Hapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteTransaksi(token, transaksiId);
              Alert.alert('Sukses', 'Transaksi berhasil dihapus');
              router.back();
            } catch (error) {
              Alert.alert('Error', error.message || 'Gagal menghapus transaksi');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? '#4CAF50' : '#FF9800';
  };

  const getStatusText = (status) => {
    return status === 'paid' ? 'Lunas' : 'Belum Lunas';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat detail transaksi...</Text>
      </View>
    );
  }

  if (!transaksiData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Transaksi</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666' }}>Data transaksi tidak ditemukan</Text>
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
        <Text style={styles.headerTitle}>Detail Transaksi</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>
            Transaksi #{transaksiData.id}
          </Text>
          <Text style={styles.profileRole}>
            {formatDate(transaksiData.tgl_transaksi)}
          </Text>
          
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(transaksiData.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(transaksiData.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(transaksiData.status) }]}>
              {getStatusText(transaksiData.status)}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color="#2196F3" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tanggal Transaksi</Text>
              <Text style={styles.infoValue}>{formatDate(transaksiData.tgl_transaksi)}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="card" size={20} color="#4CAF50" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Status Pembayaran</Text>
              <Text style={styles.infoValue}>{getStatusText(transaksiData.status)}</Text>
            </View>
          </View>

          {transaksiData.catatan && (
            <View style={[styles.infoItem, styles.infoItemLast]}>
              <View style={styles.infoIcon}>
                <Ionicons name="document-text" size={20} color="#FF9800" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Catatan</Text>
                <Text style={styles.infoValue}>{transaksiData.catatan}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.infoLabel, { marginBottom: 15, fontSize: 16, fontWeight: 'bold' }]}>
            Informasi Sistem
          </Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color="#9C27B0" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Dibuat</Text>
              <Text style={styles.infoValue}>
                {new Date(transaksiData.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          <View style={[styles.infoItem, styles.infoItemLast]}>
            <View style={styles.infoIcon}>
              <Ionicons name="refresh" size={20} color="#607D8B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Terakhir Diupdate</Text>
              <Text style={styles.infoValue}>
                {new Date(transaksiData.updated_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}