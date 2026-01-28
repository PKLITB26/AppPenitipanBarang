import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { barangListStyles as styles } from '../../styles/barangListStyles';
import ActionSheet from '../../components/ActionSheet';

interface Barang {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  tgl_kadaluwarsa?: string;
}

export default function BarangListScreen() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [filteredBarang, setFilteredBarang] = useState<Barang[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    loadBarang();
  }, []);

  useEffect(() => {
    filterBarang();
  }, [searchQuery, barangList]);

  const loadBarang = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await apiService.getAllBarang(token);
      setBarangList(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data barang');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBarang = () => {
    if (!searchQuery.trim()) {
      setFilteredBarang(barangList);
      return;
    }

    const filtered = barangList.filter(barang =>
      barang.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBarang(filtered);
  };

  const handleDelete = (barang: Barang) => {
    Alert.alert(
      'Konfirmasi',
      `Hapus barang ${barang.nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteBarang(token, barang.id);
              Alert.alert('Berhasil', 'Barang berhasil dihapus');
              loadBarang();
            } catch (error) {
              Alert.alert('Error', error.message || 'Gagal menghapus barang');
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = (barang: Barang) => {
    console.log('ActionSheet will show for:', barang.nama);
    setSelectedBarang(barang);
    setShowActionSheet(true);
  };

  const getActionSheetOptions = () => {
    if (!selectedBarang) return [];
    
    return [
      {
        title: 'Lihat Detail',
        icon: 'eye',
        onPress: () => router.push(`/admin/barang-detail?barangId=${selectedBarang.id}`)
      },
      {
        title: 'Edit Barang',
        icon: 'create',
        onPress: () => router.push(`/admin/edit-barang?barangId=${selectedBarang.id}`)
      },
      {
        title: 'Hapus Barang',
        icon: 'trash',
        destructive: true,
        onPress: () => handleDelete(selectedBarang)
      }
    ];
  };

  const getExpiryStatus = (tglKadaluwarsa?: string) => {
    if (!tglKadaluwarsa) return { color: '#9E9E9E', text: 'Tidak ada' };
    
    const today = new Date();
    const expiryDate = new Date(tglKadaluwarsa);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { color: '#f44336', text: 'Kadaluwarsa' };
    if (diffDays <= 7) return { color: '#FF9800', text: `${diffDays} hari lagi` };
    if (diffDays <= 30) return { color: '#FFC107', text: `${diffDays} hari lagi` };
    return { color: '#4CAF50', text: `${diffDays} hari lagi` };
  };

  const getStatCardColor = (index: number) => {
    const colors = ['#E3F2FD', '#E8F5E8', '#FFF3E0', '#F3E5F5'];
    return colors[index % colors.length];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const renderBarangItem = ({ item }: { item: Barang }) => {
    const expiryStatus = getExpiryStatus(item.tgl_kadaluwarsa);
    
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => router.push(`/admin/barang-detail?barangId=${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={styles.itemIcon}>
            <Ionicons name="cube" size={24} color="white" />
          </View>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.nama}
          </Text>
          <Text style={styles.itemPrice}>{formatPrice(item.harga)}</Text>
          <Text style={styles.itemStock}>Stok: {item.stok}</Text>
        </View>

        <View style={styles.expiryContainer}>
          <Text style={[styles.expiryText, { color: expiryStatus.color }]}>
            {expiryStatus.text}
          </Text>
          {item.tgl_kadaluwarsa && (
            <Text style={styles.expiryDate}>
              {new Date(item.tgl_kadaluwarsa).toLocaleDateString('id-ID')}
            </Text>
          )}
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={(e) => {
            e.stopPropagation();
            handleMenuPress(item);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const stats = [
    { label: 'Total Barang', value: barangList.length, color: '#2196F3' },
    { label: 'Stok Rendah', value: barangList.filter(b => b.stok < 10).length, color: '#FF9800' },
    { label: 'Akan Kadaluwarsa', value: barangList.filter(b => {
      if (!b.tgl_kadaluwarsa) return false;
      const today = new Date();
      const expiryDate = new Date(b.tgl_kadaluwarsa);
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length, color: '#f44336' },
    { label: 'Kadaluwarsa', value: barangList.filter(b => {
      if (!b.tgl_kadaluwarsa) return false;
      const today = new Date();
      const expiryDate = new Date(b.tgl_kadaluwarsa);
      return expiryDate < today;
    }).length, color: '#9E9E9E' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat data barang...</Text>
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
        <Text style={styles.headerTitle}>Barang</Text>
        <TouchableOpacity onPress={() => router.push('/admin/add-barang')}>
          <Ionicons name="add" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari barang..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredBarang}
        renderItem={renderBarangItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {searchQuery ? 'Barang tidak ditemukan' : 'Belum ada barang'}
            </Text>
          </View>
        }
      />
      
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedBarang?.nama || 'Menu Barang'}
        options={getActionSheetOptions()}
      />
    </View>
  );
}