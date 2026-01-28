import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { barangListStyles as styles } from '../../styles/barangListStyles';
import ActionSheet from '../../components/ActionSheet';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

export default function PelangganScreen() {
  const [pelangganList, setPelangganList] = useState([]);
  const [filteredPelanggan, setFilteredPelanggan] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    loadPelanggan();
  }, []);

  useEffect(() => {
    filterPelanggan();
  }, [searchQuery, pelangganList]);

  const loadPelanggan = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await apiService.getAllPelanggan(token);
      setPelangganList(data);
    } catch (error) {
      const message = error.message || 'Gagal memuat data pelanggan';
      setErrorMessage(message);
      console.error('Error loading pelanggan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPelanggan = () => {
    if (!searchQuery.trim()) {
      setFilteredPelanggan(pelangganList);
      return;
    }

    const filtered = pelangganList.filter(pelanggan =>
      pelanggan.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pelanggan.no_telpon?.includes(searchQuery) ||
      (pelanggan.warung_nama && pelanggan.warung_nama.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredPelanggan(filtered);
  };



  const handleDelete = (pelanggan) => {
    Alert.alert(
      'Konfirmasi',
      `Hapus pelanggan ${pelanggan.nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setErrorMessage('');
              await apiService.deletePelanggan(token, pelanggan.id);
              setSuccessMessage('Pelanggan berhasil dihapus');
              loadPelanggan();
              
              // Clear success message after 3 seconds
              setTimeout(() => {
                setSuccessMessage('');
              }, 3000);
            } catch (error) {
              const message = error.message || 'Gagal menghapus pelanggan';
              setErrorMessage(message);
            }
          }
        }
      ]
    );
  };

  const handleMenuPress = (pelanggan) => {
    setSelectedPelanggan(pelanggan);
    setShowActionSheet(true);
  };

  const getActionSheetOptions = () => {
    if (!selectedPelanggan) return [];
    
    return [
      {
        title: 'Lihat Detail',
        icon: 'eye',
        onPress: () => router.push(`/admin/pelanggan-detail?pelangganId=${selectedPelanggan.user_id || selectedPelanggan.id}`)
      },
      {
        title: 'Edit Pelanggan',
        icon: 'create',
        onPress: () => router.push(`/admin/edit-pelanggan?pelangganId=${selectedPelanggan.user_id || selectedPelanggan.id}`)
      },
      {
        title: 'Hapus Pelanggan',
        icon: 'trash',
        destructive: true,
        onPress: () => handleDelete(selectedPelanggan)
      }
    ];
  };

  const renderPelangganItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => router.push(`/admin/pelanggan-detail?pelangganId=${item.user_id || item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.itemIcon, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="people" size={24} color="white" />
          </View>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.nama || 'Nama belum diisi'}
          </Text>
          <Text style={styles.itemStock}>No. Telepon : {item.no_telpon || '-'}</Text>
          <Text style={styles.itemStock}>
            {item.warung_nama ? ` ${item.warung_nama}` : 'Alamat : ' + (item.alamat || 'Alamat belum diisi')}
          </Text>
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
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat data pelanggan...</Text>
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
        <Text style={styles.headerTitle}>Pelanggan</Text>
        <TouchableOpacity onPress={() => router.push('/admin/add-pelanggan')}>
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari pelanggan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </View>
      
      {/* Error Message */}
      <ErrorMessage message={errorMessage} visible={!!errorMessage} />
      
      {/* Success Message */}
      <SuccessMessage message={successMessage} visible={!!successMessage} />

      {/* List */}
      <FlatList
        data={filteredPelanggan}
        renderItem={renderPelangganItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            {errorMessage ? (
              <>
                <Ionicons name="alert-circle-outline" size={64} color="#FF5722" />
                <Text style={{ color: '#FF5722', marginTop: 10, textAlign: 'center' }}>
                  Terjadi kesalahan
                </Text>
                <TouchableOpacity 
                  style={{ 
                    marginTop: 10, 
                    paddingHorizontal: 20, 
                    paddingVertical: 8, 
                    backgroundColor: '#4CAF50', 
                    borderRadius: 5 
                  }}
                  onPress={loadPelanggan}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>Coba Lagi</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="people-outline" size={64} color="#ccc" />
                <Text style={{ color: '#666', marginTop: 10 }}>
                  {searchQuery ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
                </Text>
              </>
            )}
          </View>
        }
      />
      
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedPelanggan?.nama || 'Menu Pelanggan'}
        options={getActionSheetOptions()}
      />
    </View>
  );
}