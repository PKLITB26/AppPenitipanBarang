import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { pelangganDashboardStyles as styles } from '../../styles/pelangganDashboardStyles';

export default function PelangganDashboard() {
  const { user, token, logout } = useAuth();
  const [transaksiList, setTransaksiList] = useState([]);
  const [stats, setStats] = useState({
    totalToko: 0,
    totalPenjualan: 0,
    pendapatanHariIni: 0
  });

  useEffect(() => {
    if (token && user) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    try {
      // Temporary fallback until backend endpoints are ready
      const mockData = {
        toko: [],
        transaksi: []
      };
      
      try {
        const [toko, transaksi] = await Promise.all([
          apiService.getTokoByPelanggan(user.id, token),
          apiService.getTransaksiByPelanggan(user.id, token)
        ]);
        mockData.toko = toko || [];
        mockData.transaksi = transaksi || [];
      } catch (apiError) {
        console.log('API endpoints not ready, using mock data');
      }
      
      setTransaksiList(mockData.transaksi.slice(0, 5)); // Show latest 5
      
      const today = new Date().toDateString();
      const pendapatanHariIni = mockData.transaksi
        .filter(t => new Date(t.tanggal).toDateString() === today)
        .reduce((sum, t) => sum + (t.total || 0), 0);
      
      setStats({
        totalToko: mockData.toko.length,
        totalPenjualan: mockData.transaksi.length,
        pendapatanHariIni
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setStats({
        totalToko: 0,
        totalPenjualan: 0,
        pendapatanHariIni: 0
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', onPress: () => { logout(); router.replace('/'); }}
      ]
    );
  };

  const renderTransaksiItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Ionicons name="receipt-outline" size={20} color="#1976D2" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.nama_barang}</Text>
          <Text style={styles.itemSubtitle}>Qty: {item.jumlah} | Harga: Rp {item.harga_satuan?.toLocaleString()}</Text>
          <Text style={styles.itemDate}>{new Date(item.tanggal).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.totalAmount}>Rp {item.total?.toLocaleString()}</Text>
        <Ionicons name="chevron-forward" size={16} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/images/logo-app.jpeg')} 
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hai, {user?.nama || 'Pelanggan'}</Text>
            <Text style={styles.subtitle}>Kelola toko dan penjualan</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="storefront" size={20} color="#1976D2" />
          </View>
          <Text style={styles.statNumber}>{stats.totalToko}</Text>
          <Text style={styles.statLabel}>Total Toko</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="receipt" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>{stats.totalPenjualan}</Text>
          <Text style={styles.statLabel}>Penjualan</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cash" size={20} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>Rp {stats.pendapatanHariIni.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Hari Ini</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/pelanggan/penjualan/create')}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.actionText}>Catat Penjualan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => router.push('/pelanggan/toko')}>
          <Ionicons name="storefront" size={24} color="#1976D2" />
          <Text style={styles.actionTextSecondary}>Kelola Toko</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaksi Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/pelanggan/penjualan')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        
        {transaksiList.length > 0 ? (
          <FlatList
            data={transaksiList}
            renderItem={renderTransaksiItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada transaksi</Text>
            <Text style={styles.emptySubtext}>Mulai catat penjualan pertama Anda</Text>
          </View>
        )}
      </View>

      {/* Request Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.requestCard} onPress={() => router.push('/pelanggan/request')}>
          <View style={styles.requestIcon}>
            <Ionicons name="add-circle" size={24} color="#1976D2" />
          </View>
          <View style={styles.requestContent}>
            <Text style={styles.requestTitle}>Request Barang Baru</Text>
            <Text style={styles.requestSubtitle}>Minta admin untuk menambah barang baru</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}