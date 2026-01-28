import { useEffect } from 'react';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log('Index useEffect - user:', user, 'isLoading:', isLoading);
    
    if (!isLoading) {
      if (user) {
        // User sudah login, redirect ke dashboard sesuai role
        console.log('User found, redirecting to dashboard for role:', user.role);
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
            console.log('Unknown role, redirecting to login');
            router.replace('/login');
        }
      } else {
        console.log('No user found, should redirect to login');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    console.log('Still loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login via Redirect');
    return <Redirect href="/login" />;
  }

  return null;
}