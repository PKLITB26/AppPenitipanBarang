import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { settingsStyles as styles } from '../../styles/settingsStyles';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Apakah Anda yakin ingin keluar?');
      if (confirmed) {
        try {
          await logout();
          router.replace('/');
        } catch (error) {
          router.replace('/');
        }
      }
      return;
    }
    
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              router.replace('/');
            }
          }
        },
      ]
    );
  };

  const handleProfile = () => {
    Alert.alert('Info', 'Fitur profil akan segera tersedia');
  };

  const handleNotifications = () => {
    Alert.alert('Info', 'Fitur notifikasi akan segera tersedia');
  };

  const handleAbout = () => {
    Alert.alert(
      'Tentang Aplikasi',
      'Catip App v1.0.0\n\nAplikasi Penitipan Barang untuk mengelola penitipan barang di warung-warung dengan sistem role-based access control.\n\nDikembangkan dengan React Native + Expo',
      [{ text: 'OK' }]
    );
  };

  const settingsItems = [
    {
      title: 'Profil',
      subtitle: 'Kelola informasi profil Anda',
      icon: 'person',
      color: '#2196F3',
      onPress: handleProfile
    },
    {
      title: 'Notifikasi',
      subtitle: 'Atur preferensi notifikasi',
      icon: 'notifications',
      color: '#FF9800',
      onPress: handleNotifications
    },
    {
      title: 'Tentang Aplikasi',
      subtitle: 'Informasi versi dan developer',
      icon: 'information-circle',
      color: '#4CAF50',
      onPress: handleAbout
    },
    {
      title: 'Keluar',
      subtitle: 'Logout dari aplikasi',
      icon: 'log-out',
      color: '#f44336',
      onPress: handleLogout,
      destructive: true
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="white" />
            </View>
          </View>
          <Text style={styles.userName}>Admin</Text>
          <Text style={styles.userRole}>Administrator</Text>
        </View>

        {/* Settings Items */}
        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.settingItem,
                index === settingsItems.length - 1 && styles.settingItemLast
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={20} color="white" />
              </View>
              <View style={styles.settingContent}>
                <Text style={[
                  styles.settingTitle,
                  item.destructive && styles.settingTitleDestructive
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>Catip App</Text>
          <Text style={styles.appInfoVersion}>Versi 1.0.0</Text>
          <Text style={styles.appInfoDescription}>
            Aplikasi Penitipan Barang untuk mengelola penitipan barang di warung-warung
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}