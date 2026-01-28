import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { barangDetailStyles as styles } from '../../styles/barangDetailStyles';

interface Barang {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  tgl_kadaluwarsa?: string;
}

export default function BarangDetailScreen() {
  const { barangId } = useLocalSearchParams();
  const { token } = useAuth();
  const [barang, setBarang] = useState<Barang | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (barangId && token) {
      loadBarangDetail();
    }
  }, [barangId, token]);

  const loadBarangDetail = async () => {
    try {
      const data = await apiService.getBarangById(token, Number(barangId));
      setBarang(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat detail barang');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Tidak ada';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  if (loading || !barang) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Barang</Text>
        <TouchableOpacity onPress={() => router.push(`/admin/edit-barang?barangId=${barangId}`)}>          <Ionicons name="create-outline" size={24} color="#FF9800" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="cube" size={32} color="white" />
          </View>
        </View>
        
        <Text style={styles.profileName}>{barang.nama}</Text>
        <Text style={styles.profileSubtitle}>ID: {barang.id}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informasi Barang</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag" size={20} color="#1976D2" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nama Barang</Text>
              <Text style={styles.infoValue}>{barang.nama}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#4CAF50" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Harga</Text>
              <Text style={styles.infoValue}>{formatCurrency(barang.harga)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="layers" size={20} color="#FF9800" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Stok</Text>
              <Text style={styles.infoValue}>{barang.stok} unit</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#F44336" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tanggal Kadaluwarsa</Text>
              <Text style={styles.infoValue}>{formatDate(barang.tgl_kadaluwarsa)}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}