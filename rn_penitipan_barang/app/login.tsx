import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { loginStyles as styles } from '../styles/loginStyles';

export default function LoginScreen() {
  const [no_telpon, setNoTelpon] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!no_telpon || !password) {
      Alert.alert('Error', 'Nomor telepon dan password harus diisi');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', { no_telpon, password });
      const response = await apiService.login(no_telpon, password);
      console.log('Login response:', response);
      
      await login(response.token, {
        id: response.userId,
        role: response.role,
        no_telpon: no_telpon
      });
      
      console.log('Login successful, navigating based on role:', response.role);
      
      // Redirect berdasarkan role
      switch (response.role) {
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
          Alert.alert('Error', 'Role tidak dikenali');
          return;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Gagal', error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/logo-app.jpeg')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Catip</Text>
      </View>

      {/* Warehouse Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.warehouseContainer}>
          <View style={styles.warehouse}>
            <View style={styles.warehouseRoof}>
              <View style={styles.roofTop} />
            </View>
            <View style={styles.warehouseBody}>
              <View style={styles.warehouseDoor} />
              <View style={styles.warehouseWindows}>
                <View style={styles.window} />
                <View style={styles.window} />
              </View>
            </View>
            <View style={styles.warehouseBoxes}>
              <View style={styles.box} />
              <View style={styles.box} />
              <View style={styles.box} />
            </View>
          </View>
        </View>
      </View>

      {/* Welcome Text */}
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Login di Catip</Text>
        <Text style={styles.descriptionText}>
          Kelola penitipan barang dengan mudah dan aman
        </Text>
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nomor Telepon</Text>
          <View style={[styles.inputWrapper, focusedInput === 'phone' && styles.inputWrapperFocused]}>
            <Ionicons name="call" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="08xxxxxxxxx"
              value={no_telpon}
              onChangeText={setNoTelpon}
              keyboardType="phone-pad"
              editable={!isLoading}
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
            <Ionicons name="lock-closed" size={22} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="****"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </View>
      </View>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Masuk</Text>
          )}
        </TouchableOpacity>
        
        {/* Forgot Password Link */}
        <TouchableOpacity 
          style={styles.forgotPasswordContainer}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}></Text>
      </View>
    </ScrollView>
  );
}