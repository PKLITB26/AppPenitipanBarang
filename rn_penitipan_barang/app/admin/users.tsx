import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { usersStyles as styles } from '../../styles/usersStyles';
import ActionSheet from '../../components/ActionSheet';

export default function UsersScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionSheet, setShowActionSheet] = useState(false);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF9800';
      case 'pemasok': return '#2196F3';
      case 'pelanggan': return '#f44336';
      default: return '#666';
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        loadUsers();
      }
    }, [token])
  );

  const loadUsers = async () => {
    try {
      if (!token) return;
      const data = await apiService.getAllUsers(token);
      setUsers(data);

    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserMenu = (user) => {
    setSelectedUser(user);
    setShowActionSheet(true);
  };

  const getActionSheetOptions = () => {
    if (!selectedUser) return [];
    
    return [
      {
        title: 'Edit User',
        icon: 'create',
        onPress: () => handleEditUser(selectedUser)
      },
      {
        title: 'Hapus User',
        icon: 'trash',
        destructive: true,
        onPress: () => handleDeleteUser(selectedUser)
      }
    ];
  };

  const handleEditUser = (user) => {
    Alert.alert('Info', `Edit user ${user.no_telpon} - Coming soon`);
  };

  const handleDeleteUser = (user) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus user ${user.no_telpon}?`,
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteUser(user.id)
        }
      ]
    );
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      await apiService.deleteUser(token, userId);
      Alert.alert('Berhasil', 'User berhasil dihapus');
      loadUsers();
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal menghapus user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.no_telpon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: getRoleColor(item.role) }]}>
          <Text style={styles.avatarText}>
            {item.no_telpon?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.no_telpon}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
        <Text style={styles.userId}>ID: {item.id}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.menuButton} 
        onPress={(e) => {
          e.stopPropagation();
          handleUserMenu(item);
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola User</Text>
        <TouchableOpacity onPress={() => router.push('/admin/add-user')}>
          <Ionicons name="add" size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>



      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau ID user..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Daftar User</Text>
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadUsers}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={{ color: '#666', marginTop: 10 }}>
              {searchQuery ? 'User tidak ditemukan' : 'Belum ada user'}
            </Text>
          </View>
        }
      />
      
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={selectedUser?.no_telpon || 'Menu User'}
        options={getActionSheetOptions()}
      />
    </View>
  );
}