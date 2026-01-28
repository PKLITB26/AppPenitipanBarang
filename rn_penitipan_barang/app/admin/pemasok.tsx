import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { barangListStyles as styles } from '../../styles/barangListStyles';
import ActionSheet from '../../components/ActionSheet';

export default function PemasokScreen() {
  const [pemasokList, setPemasokList] = useState([]);
  const [filteredPemasok, setFilteredPemasok] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPemasok, setSelectedPemasok] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    loadPemasok();
  }, []);

  useEffect(() => {
    filterPemasok();
  }, [searchQuery, pemasokList]);

  const loadPemasok = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await apiService.getAllPemasok(token);
      console.log('Pemasok data received:', data);
      setPemasokList(data);
    } catch (error) {
      console.error('Error loading pemasok:', error);
      Alert.alert('Error', 'Gagal memuat data pemasok');
    } finally {
      setIsLoading(false);
    }
  };

  const filterPemasok = () => {
    if (!searchQuery.trim()) {
      setFilteredPemasok(pemasokList);
      return;
    }

    const filtered = pemasokList.filter(pemasok =>
      pemasok.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pemasok.no_telpon?.includes(searchQuery)
    );
    setFilteredPemasok(filtered);
  };



  const handleDelete = (pemasok) => {
    Alert.alert(
      'Konfirmasi',
      `Hapus pemasok ${pemasok.nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePemasok(token, pemasok.id);
              Alert.alert('Sukses', 'Pemasok berhasil dihapus');
              loadPemasok();
            } catch (error) {
              Alert.alert('Error', error.message || 'Gagal menghapus pemasok');
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = (pemasok) => {
    console.log('Menu pressed for pemasok:', pemasok);
    setSelectedPemasok(pemasok);
    setShowActionSheet(true);
  };

  const getActionSheetOptions = () => {
    if (!selectedPemasok) {
      console.log('No selected pemasok');
      return [];
    }
    
    console.log('Creating options for pemasok:', selectedPemasok);
    return [
      {
        title: 'Lihat Detail',
        icon: 'eye',
        onPress: () => {
          console.log('View detail pressed for pemasok ID:', selectedPemasok.user_id || selectedPemasok.id);
          router.push(`/admin/pemasok-detail?pemasokId=${selectedPemasok.user_id || selectedPemasok.id}`);
        }
      },
      {
        title: 'Edit Pemasok',
        icon: 'create',
        onPress: () => {
          console.log('Edit pressed for pemasok ID:', selectedPemasok.user_id || selectedPemasok.id);
          router.push(`/admin/edit-pemasok?pemasokId=${selectedPemasok.user_id || selectedPemasok.id}`);
        }
      },
      {
        title: 'Hapus Pemasok',
        icon: 'trash',
        destructive: true,
        onPress: () => {
          console.log('Delete pressed for pemasok:', selectedPemasok.nama);
          handleDelete(selectedPemasok);
        }
      }
    ];
  };

  const renderPemasokItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => router.push(`/admin/pemasok-detail?pemasokId=${item.user_id || item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.itemIcon, { backgroundColor: '#2196F3' }]}>
            <Ionicons name="business" size={24} color="white" />
          </View>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.nama || 'Nama belum diisi'}
          </Text>
          <Text style={styles.itemStock}>No. Telepon : {item.no_telpon || '-'}</Text>
          <Text style={styles.itemStock}>Alamat : {item.alamat || 'Alamat belum diisi'}</Text>
        </View>

        <View style={styles.expiryContainer}>
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 'aktif' ? '#4CAF50' : '#FF5722',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12
          }]}>
            <Text style={[styles.expiryText, { color: 'white', fontSize: 10 }]}>
              {item.status || 'aktif'}
            </Text>
          </View>
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

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat data pemasok...</Text>
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
        <Text style={styles.headerTitle}>Pemasok</Text>
        <TouchableOpacity onPress={() => router.push('/admin/add-pemasok')}>
          <Ionicons name="add" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari pemasok..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredPemasok}
        renderItem={renderPemasokItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="business-outline" size={64} color="#ccc" />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {searchQuery ? 'Pemasok tidak ditemukan' : 'Belum ada pemasok'}
            </Text>
          </View>
        }
      />
      
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedPemasok?.nama || 'Menu Pemasok'}
        options={getActionSheetOptions()}
      />
    </View>
  );
}