import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { usersStyles as styles } from '../../styles/usersStyles';

export default function TokoScreen() {
  const { token } = useAuth();
  const [toko, setToko] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadToko();
  }, []);

  const loadToko = async () => {
    try {
      if (!token) return;
      const data = await apiService.getAllToko(token);
      setToko(data);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data toko');
    } finally {
      setLoading(false);
    }
  };

  const filteredToko = toko.filter(item => 
    item.nama_toko?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.alamat?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderToko = ({ item }) => (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.avatarText}>
            {item.nama_toko?.charAt(0)?.toUpperCase() || 'T'}
          </Text>
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nama_toko}</Text>
        <Text style={styles.userSubtitle}>{item.alamat}</Text>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
        <Text style={styles.statusText}>Active</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toko</Text>
        <TouchableOpacity>
          <Ionicons name="funnel" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stores..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredToko}
        renderItem={renderToko}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadToko}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="storefront-outline" size={64} color="#ccc" />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {searchQuery ? 'Toko tidak ditemukan' : 'Belum ada toko'}
            </Text>
          </View>
        }
      />
    </View>
  );
}