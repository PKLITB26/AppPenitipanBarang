import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { router } from 'expo-router';

export default function CreateRequestScreen() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    nama_barang: '',
    deskripsi: '',
    jumlah_dibutuhkan: '',
    harga_estimasi: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nama_barang.trim()) {
      Alert.alert('Error', 'Nama barang harus diisi');
      return false;
    }
    if (!formData.jumlah_dibutuhkan.trim() || isNaN(Number(formData.jumlah_dibutuhkan))) {
      Alert.alert('Error', 'Jumlah dibutuhkan harus berupa angka');
      return false;
    }
    if (formData.harga_estimasi && isNaN(Number(formData.harga_estimasi))) {
      Alert.alert('Error', 'Harga estimasi harus berupa angka');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!token) {
        Alert.alert('Error', 'Token tidak ditemukan');
        return;
      }

      // Get pelanggan profile first
      const pelangganProfile = await apiService.getPelangganByUserId(token, user?.userId || 0);
      
      const requestData = {
        pelanggan_id: pelangganProfile.id,
        nama_barang: formData.nama_barang.trim(),
        deskripsi: formData.deskripsi.trim() || undefined,
        jumlah_dibutuhkan: parseInt(formData.jumlah_dibutuhkan),
        harga_estimasi: formData.harga_estimasi ? parseFloat(formData.harga_estimasi) : undefined,
        status: 'pending' as const,
      };

      await apiService.createRequestBarang(token, requestData);
      
      Alert.alert(
        'Sukses', 
        'Request barang berhasil dibuat',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating request:', error);
      Alert.alert('Error', 'Gagal membuat request barang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Request Barang Baru</Text>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Barang *</Text>
            <TextInput
              style={styles.input}
              value={formData.nama_barang}
              onChangeText={(value) => handleInputChange('nama_barang', value)}
              placeholder="Masukkan nama barang"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jumlah Dibutuhkan *</Text>
            <TextInput
              style={styles.input}
              value={formData.jumlah_dibutuhkan}
              onChangeText={(value) => handleInputChange('jumlah_dibutuhkan', value)}
              placeholder="Masukkan jumlah"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Harga Estimasi (Opsional)</Text>
            <TextInput
              style={styles.input}
              value={formData.harga_estimasi}
              onChangeText={(value) => handleInputChange('harga_estimasi', value)}
              placeholder="Masukkan estimasi harga"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deskripsi (Opsional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.deskripsi}
              onChangeText={(value) => handleInputChange('deskripsi', value)}
              placeholder="Masukkan deskripsi barang"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Mengirim...' : 'Kirim Request'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});