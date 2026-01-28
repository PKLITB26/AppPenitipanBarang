import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { adminStyles as styles } from '../../styles/adminStyles';

export default function PenerimaanScreen() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    disetujui: 0,
    ditolak: 0,
    selesai: 0,
  });

  const loadStats = async () => {
    try {
      if (!token) return;
      
      const requests = await apiService.getAllRequestBarang(token);
      
      const pending = requests.filter(r => r.status === 'pending').length;
      const disetujui = requests.filter(r => r.status === 'disetujui').length;
      const ditolak = requests.filter(r => r.status === 'ditolak').length;
      const selesai = requests.filter(r => r.status === 'selesai').length;
      
      setStats({ pending, disetujui, ditolak, selesai });
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Gagal memuat statistik');
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const menuItems = [
    {
      title: 'Lihat Semua Request',
      subtitle: 'Kelola semua request barang',
      icon: 'list',
      route: '/admin/penerimaan-list',
      color: '#2196F3',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Penerimaan Request Barang</Text>
        <Text style={styles.subtitle}>Kelola request barang dari pelanggan</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.disetujui}</Text>
          <Text style={styles.statLabel}>Disetujui</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.ditolak}</Text>
          <Text style={styles.statLabel}>Ditolak</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.selesai}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color="white" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}