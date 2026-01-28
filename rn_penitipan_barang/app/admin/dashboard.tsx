import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { adminDashboardStyles as styles } from '../../styles/adminDashboardStyles';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalToko: 0,
    totalBarang: 0,
    totalRequestBarang: 0,
    totalPemasok: 0,
    totalPelanggan: 0,
  });

  useEffect(() => {
    // Only load stats if we have token and user
    if (token && user) {
      loadStats();
    }
  }, [token, user]);

  const loadStats = async () => {
    try {
      if (!token) {
        console.log('No token available for loading stats');
        return;
      }
      
      console.log('Loading stats with token:', token.substring(0, 10) + '...');
      
      // Load stats with better error handling
      const results = await Promise.allSettled([
        apiService.getAllUsers(token),
        apiService.getAllTransaksi(token),
        apiService.getAllBarang(token),
        apiService.getAllRequestBarang(token),
        apiService.getAllPemasok(token),
        apiService.getAllPelanggan(token),
      ]);

      const users = results[0].status === 'fulfilled' ? results[0].value : [];
      const transaksi = results[1].status === 'fulfilled' ? results[1].value : [];
      const barang = results[2].status === 'fulfilled' ? results[2].value : [];
      const requestBarang = results[3].status === 'fulfilled' ? results[3].value : [];
      const pemasok = results[4].status === 'fulfilled' ? results[4].value : [];
      const pelanggan = results[5].status === 'fulfilled' ? results[5].value : [];

      // Log any errors but don't fail completely
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const names = ['users', 'transaksi', 'barang', 'request-barang', 'pemasok', 'pelanggan'];
          console.error(`Error loading ${names[index]}:`, result.reason);
        }
      });

      setStats({
        totalUsers: users.length,
        totalToko: transaksi.length,
        totalBarang: barang.length,
        totalRequestBarang: requestBarang.length,
        totalPemasok: pemasok.length,
        totalPelanggan: pelanggan.length,
      });
      
      console.log('Stats loaded successfully:', {
        users: users.length,
        transaksi: transaksi.length,
        barang: barang.length,
        requestBarang: requestBarang.length,
        pemasok: pemasok.length,
        pelanggan: pelanggan.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', `Gagal memuat data: ${error.message}`);
      // Set default values if all fails
      setStats({
        totalUsers: 0,
        totalToko: 0,
        totalBarang: 0,
        totalRequestBarang: 0,
        totalPemasok: 0,
        totalPelanggan: 0,
      });
    }
  };

  const menuItems = [
    { title: 'Pemasok', icon: 'business', route: '/admin/pemasok', color: '#2196F3' },
    { title: 'Pelanggan', icon: 'people', route: '/admin/pelanggan', color: '#4CAF50' },
    { title: 'Barang', icon: 'cube', route: '/admin/barang-list', color: '#FF9800' },
    { title: 'Penerimaan', icon: 'mail', route: '/admin/penerimaan-list', color: '#9C27B0' },
    { title: 'Transaksi', icon: 'card', route: '/admin/transaksi', color: '#F44336' },
    { title: 'Laporan', icon: 'bar-chart', route: '/admin/laporan', color: '#607D8B' },
  ];

  const getStatCardColor = (index: number) => {
    const colors = ['#E3F2FD', '#E8F5E8', '#FFF3E0', '#F3E5F5'];
    return colors[index % colors.length];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo-app.jpeg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Catip App</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/admin/settings')} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Hai, Admin Penitipan Barang</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>Statistik</Text>
        <View style={styles.statsContainer}>
          {[
            { label: 'Total User', value: stats.totalUsers, color: '#2196F3' },
            { label: 'Total Transaksi', value: stats.totalToko, color: '#4CAF50' },
            { label: 'Total Barang', value: stats.totalBarang, color: '#FF9800' },
            { label: 'Request Barang', value: stats.totalRequestBarang, color: '#9C27B0' },
          ].map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: getStatCardColor(index) }]}>
              <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapSection}>
        <Text style={styles.mapSectionTitle}>Lokasi Tracking</Text>
        <TouchableOpacity 
          style={styles.mapCard}
          onPress={() => router.push('/admin/map-tracking')}
        >
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={40} color="#1976D2" />
              <Text style={styles.mapPlaceholderText}>Lihat Lokasi</Text>
            </View>
          </View>
          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle}>Tracking Lokasi</Text>
            <Text style={styles.mapDescription}>Pantau lokasi pelanggan dan penitip secara real-time</Text>
            <View style={styles.mapStats}>
              <View style={styles.mapStatItem}>
                <Ionicons name="business" size={16} color="#2196F3" />
                <Text style={styles.mapStatText}>{stats.totalPemasok} Pemasok</Text>
              </View>
              <View style={styles.mapStatItem}>
                <Ionicons name="people" size={16} color="#4CAF50" />
                <Text style={styles.mapStatText}>{stats.totalPelanggan} Pelanggan</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Menu Grid */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Menu</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color="white" />
              </View>
              <Text style={styles.menuLabel}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Statistik & Informasi</Text>
        <Text style={styles.infoSubtitle}>
          Temukan informasi terkini tentang sistem penitipan barang.
        </Text>

        <TouchableOpacity style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="help-circle" size={20} color="#1976D2" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoCardTitle}>Butuh Bantuan? Cek Panduan</Text>
            <Text style={styles.infoCardSubtitle}>
              Temukan jawaban terbaik dari pertanyaan atau permasalahan Anda.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}