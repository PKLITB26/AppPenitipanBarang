import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { transaksiStyles as styles } from '../../styles/transaksiStyles';

export default function TransaksiScreen() {
  const { token } = useAuth();
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTransaksi();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        loadTransaksi();
      }
    }, [token])
  );

  const loadTransaksi = async () => {
    try {
      if (!token) return;
      const transaksiData = await apiService.getAllTransaksi(token);
      setTransaksi(transaksiData);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'unpaid': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Lunas';
      case 'unpaid': return 'Belum Lunas';
      default: return 'Unknown';
    }
  };

  const filteredTransaksi = transaksi.filter(item => 
    item.catatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id?.toString().includes(searchQuery)
  );

  const renderTransaksi = ({ item }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => router.push(`/admin/transaksi-detail?transaksiId=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.transaksiInfo}>
        <Text style={styles.transaksiId}>Transaksi #{item.id}</Text>
        <Text style={styles.transaksiDate}>{formatDate(item.tgl_transaksi)}</Text>
        <Text style={styles.transaksiNote} numberOfLines={1}>
          {item.catatan || 'Tidak ada catatan'}
        </Text>
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
      
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaksi</Text>
        <TouchableOpacity onPress={() => Alert.alert('Info', 'Fitur tambah transaksi akan segera hadir')}>
          <Ionicons name="add" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari ID atau catatan transaksi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Daftar Transaksi</Text>
      </View>

      <FlatList
        data={filteredTransaksi}
        renderItem={renderTransaksi}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadTransaksi}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="card-outline" size={64} color="#ccc" />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {searchQuery ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}
            </Text>
          </View>
        }
      />
    </View>
  );
}