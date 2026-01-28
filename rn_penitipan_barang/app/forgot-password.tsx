import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { StyleSheet } from 'react-native';

export default function ForgotPasswordScreen() {
  const [no_telpon, setNoTelpon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!no_telpon) {
      Alert.alert('Error', 'Nomor telepon harus diisi');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.resetPassword(no_telpon);
      
      Alert.alert(
        'Reset Password Berhasil', 
        `Password Anda telah direset.\n\nPassword baru: ${response.newPassword}\n\n${response.note}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Reset Password Gagal', error instanceof Error ? error.message : 'Terjadi kesalahan');
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={40} color="#4CAF50" />
        </View>
      </View>

      {/* Description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Reset Password Anda</Text>
        <Text style={styles.description}>
          Masukkan nomor telepon yang terdaftar untuk mereset password Anda
        </Text>
      </View>

      {/* Form */}
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
      </View>

      {/* Reset Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.resetButton, isLoading && styles.disabledButton]} 
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.resetButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5e5e5e',
    minHeight: 50,
  },
  inputWrapperFocused: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  input: {
    paddingVertical: 18,
    paddingLeft: 50,
    paddingRight: 15,
    fontSize: 18,
    color: '#5e5e5e',
    borderWidth: 0,
    outlineWidth: 0,
    minHeight: 50,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    shadowOpacity: 0.1,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
    textAlign: 'center',
  },
});