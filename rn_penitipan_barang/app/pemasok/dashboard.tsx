import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { pemasokDashboardStyles as styles } from '../../styles/pemasokDashboardStyles';

export default function PemasokDashboard() {
  const { user, token, logout } = useAuth();
  const [penitipanList, setPenitipanList] = useState([]);
  const [stats, setStats] = useState({
    totalPenitipan: 0,
    aktif: 0,
    selesai: 0
  });

  useEffect(() => {
    if (token && user) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    try {
      // Temporary fallback until backend endpoints are ready
      let penitipan = [];
      
      try {
        penitipan = await apiService.getPenitipanByPemasok(user.id, token);
      } catch (apiError) {
        console.log('API endpoint not ready, using empty data');
        penitipan = [];
      }
      
      setPenitipanList(penitipan.slice(0, 5)); // Show latest 5
      
      setStats({
        totalPenitipan: penitipan.length,
        aktif: penitipan.filter(p => p.status === 'aktif').length,
        selesai: penitipan.filter(p => p.status === 'selesai').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setStats({
        totalPenitipan: 0,
        aktif: 0,
        selesai: 0
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

  const renderPenitipanItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}>
          <Ionicons name="cube-outline" size={20} color="#1976D2" />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.nama_barang}</Text>
          <Text style={styles.itemSubtitle}>Toko: {item.nama_toko}</Text>
          <Text style={styles.itemDate}>Tanggal: {new Date(item.tanggal_penitipan).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'aktif' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
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
            <Text style={styles.greeting}>Hai, {user?.nama || 'Pemasok'}</Text>
            <Text style={styles.subtitle}>Kelola penitipan barang Anda</Text>
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
            <Ionicons name="cube" size={20} color="#1976D2" />
          </View>
          <Text style={styles.statNumber}>{stats.totalPenitipan}</Text>
          <Text style={styles.statLabel}>Total Penitipan</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>{stats.aktif}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="time" size={20} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>{stats.selesai}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/pemasok/penitipan/create')}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.actionText}>Buat Penitipan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => router.push('/pemasok/penitipan')}>
          <Ionicons name="list" size={24} color="#1976D2" />
          <Text style={styles.actionTextSecondary}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Penitipan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Penitipan Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/pemasok/penitipan')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
        
        {penitipanList.length > 0 ? (
          <FlatList
            data={penitipanList}
            renderItem={renderPenitipanItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Belum ada penitipan</Text>
            <Text style={styles.emptySubtext}>Mulai buat penitipan barang pertama Anda</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}