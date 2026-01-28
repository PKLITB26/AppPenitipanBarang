import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, token, isLoading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, [user, token]);

  const checkAuthStatus = async () => {
    if (isLoading) {
      return;
    }

    if (!user || !token) {
      router.replace('/login');
      return;
    }

    // Redirect ke dashboard sesuai role
    switch (user.role) {
      case 'admin':
        router.replace('/admin/dashboard');
        break;
      case 'pemasok':
        router.replace('/pemasok/dashboard');
        break;
      case 'pelanggan':
        router.replace('/pelanggan/dashboard');
        break;
      default:
        setIsCheckingAuth(false);
    }
  };

  if (isLoading || isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976D2" />
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Role tidak dikenali: {user?.role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
