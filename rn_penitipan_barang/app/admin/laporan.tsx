import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { laporanStyles as styles } from '../../styles/laporanStyles';

export default function LaporanScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPemasok: 0,
    totalPelanggan: 0,
    totalToko: 0,
    totalBarang: 0,
    totalRequestBarang: 0,
    requestPending: 0,
    requestDisetujui: 0,
    requestDitolak: 0,
    totalTransaksi: 0,
  });

  const loadLaporanData = async () => {
    try {
      if (!token) return;

      const results = await Promise.allSettled([
        apiService.getAllUsers(token),
        apiService.getAllToko(token),
        apiService.getAllBarang(token),
        apiService.getAllRequestBarang(token),
        apiService.getAllTransaksi(token),
        apiService.getAllPemasok(token),
        apiService.getAllPelanggan(token),
      ]);

      const users = results[0].status === 'fulfilled' ? results[0].value : [];
      const toko = results[1].status === 'fulfilled' ? results[1].value : [];
      const barang = results[2].status === 'fulfilled' ? results[2].value : [];
      const requestBarang = results[3].status === 'fulfilled' ? results[3].value : [];
      const transaksi = results[4].status === 'fulfilled' ? results[4].value : [];
      const pemasok = results[5].status === 'fulfilled' ? results[5].value : [];
      const pelanggan = results[6].status === 'fulfilled' ? results[6].value : [];

      const pendingCount = requestBarang.filter(r => r.status === 'pending').length;
      const disetujuiCount = requestBarang.filter(r => r.status === 'disetujui').length;
      const ditolakCount = requestBarang.filter(r => r.status === 'ditolak').length;

      setStats({
        totalUsers: users.length,
        totalPemasok: pemasok.length,
        totalPelanggan: pelanggan.length,
        totalToko: toko.length,
        totalBarang: barang.length,
        totalRequestBarang: requestBarang.length,
        requestPending: pendingCount,
        requestDisetujui: disetujuiCount,
        requestDitolak: ditolakCount,
        totalTransaksi: transaksi.length,
      });
    } catch (error) {
      console.error('Error loading laporan data:', error);
      Alert.alert('Error', 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLaporanData();
  };

  const handleDownloadReport = async (type: string) => {
    try {
      if (!token) return;
      
      const reportData = await apiService.downloadReport(token, type, selectedPeriod);
      
      if (Platform.OS === 'web') {
        // For web, create and download file
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `laporan_${type}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        Alert.alert('Berhasil', 'Laporan berhasil diunduh');
      } else {
        // For mobile, show data in alert (simplified)
        Alert.alert(
          'Laporan Berhasil Dibuat',
          `${reportData.title}\nTotal data: ${Object.keys(reportData.data).length} kategori`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Gagal mengunduh laporan');
    }
  };

  useEffect(() => {
    loadLaporanData();
  }, []);

  const summaryData = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: 'people', color: '#2196F3' },
    { label: 'Pemasok Aktif', value: stats.totalPemasok, icon: 'business', color: '#4CAF50' },
    { label: 'Pelanggan Aktif', value: stats.totalPelanggan, icon: 'person', color: '#FF9800' },
    { label: 'Total Warung', value: stats.totalToko, icon: 'storefront', color: '#9C27B0' },
    { label: 'Total Barang', value: stats.totalBarang, icon: 'cube', color: '#607D8B' },
    { label: 'Total Transaksi', value: stats.totalTransaksi, icon: 'card', color: '#795548' },
  ];

  const reportTypes = [
    {
      type: 'users',
      title: 'Laporan Pengguna',
      subtitle: 'Data lengkap pengguna, pemasok, dan pelanggan',
      icon: 'people',
      color: '#2196F3',
    },
    {
      type: 'barang',
      title: 'Laporan Barang & Penitipan',
      subtitle: 'Data barang dan riwayat penitipan',
      icon: 'cube',
      color: '#FF9800',
    },
    {
      type: 'transaksi',
      title: 'Laporan Transaksi',
      subtitle: 'Riwayat transaksi dan pembayaran',
      icon: 'card',
      color: '#4CAF50',
    },
    {
      type: 'request',
      title: 'Laporan Request Barang',
      subtitle: 'Data request barang dari pelanggan',
      icon: 'mail',
      color: '#9C27B0',
    },
  ];

  const periodOptions = [
    { label: 'Semua', value: 'all' },
    { label: 'Hari Ini', value: 'today' },
    { label: '7 Hari', value: '7days' },
    { label: '30 Hari', value: '30days' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="analytics" size={48} color="#1976D2" />
        <Text style={styles.loadingText}>Memuat laporan...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Laporan</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      {/* Summary Statistics */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Ringkasan Data</Text>
        <View style={styles.statsGrid}>
          {summaryData.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
              </View>
              <Text style={[styles.statNumber, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Period Selection */}
      <View style={styles.periodSection}>
        <Text style={styles.sectionTitle}>Periode Laporan</Text>
        <View style={styles.periodButtons}>
          {periodOptions.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Report Types */}
      <View style={styles.reportTypeSection}>
        <Text style={styles.sectionTitle}>Unduh Laporan</Text>
        {reportTypes.map((report, index) => (
          <TouchableOpacity
            key={index}
            style={styles.reportCard}
            onPress={() => handleDownloadReport(report.type)}
            activeOpacity={0.7}
          >
            <View style={[styles.reportIcon, { backgroundColor: report.color }]}>
              <Ionicons name={report.icon} size={24} color="white" />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportSubtitle}>{report.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleDownloadReport(report.type)}
            >
              <Ionicons name="download" size={14} color="white" />
              <Text style={styles.downloadButtonText}>Unduh</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Request Status Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Status Request Barang</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="time" size={24} color="white" />
            </View>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.requestPending}</Text>
            <Text style={styles.statLabel}>Menunggu</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark-circle" size={24} color="white" />
            </View>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.requestDisetujui}</Text>
            <Text style={styles.statLabel}>Disetujui</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F44336' }]}>
              <Ionicons name="close-circle" size={24} color="white" />
            </View>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.requestDitolak}</Text>
            <Text style={styles.statLabel}>Ditolak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#9C27B0' }]}>
              <Ionicons name="mail" size={24} color="white" />
            </View>
            <Text style={[styles.statNumber, { color: '#9C27B0' }]}>{stats.totalRequestBarang}</Text>
            <Text style={styles.statLabel}>Total Request</Text>
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Laporan diperbarui secara real-time berdasarkan data terkini dari sistem.
        </Text>
        <Text style={styles.lastUpdated}>
          Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
        </Text>
      </View>
    </ScrollView>
  );
}