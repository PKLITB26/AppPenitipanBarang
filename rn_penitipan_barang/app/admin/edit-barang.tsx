import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { addUserStyles as styles } from '../../styles/addUserStyles';

export default function EditBarangScreen() {
  const { barangId } = useLocalSearchParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    stok: '',
    tgl_kadaluwarsa: ''
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadBarangData();
  }, []);

  const loadBarangData = async () => {
    try {
      setIsLoadingData(true);
      const data = await apiService.getBarangDetail(token, barangId);
      
      // Format tanggal kadaluwarsa ke YYYY-MM-DD
      let formattedDate = '';
      if (data.tgl_kadaluwarsa) {
        const date = new Date(data.tgl_kadaluwarsa);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      
      setFormData({
        nama: data.nama || '',
        harga: data.harga ? data.harga.toString() : '',
        stok: data.stok ? data.stok.toString() : '',
        tgl_kadaluwarsa: formattedDate
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data barang');
      router.back();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nama.trim()) {
      Alert.alert('Error', 'Nama barang harus diisi');
      return false;
    }
    if (!formData.harga || isNaN(Number(formData.harga))) {
      Alert.alert('Error', 'Harga harus berupa angka');
      return false;
    }
    if (!formData.stok || isNaN(Number(formData.stok))) {
      Alert.alert('Error', 'Stok harus berupa angka');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData = {
        nama: formData.nama,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        tgl_kadaluwarsa: formData.tgl_kadaluwarsa || null
      };

      await apiService.updateBarang(token, barangId, updateData);

      Alert.alert(
        'Berhasil',
        'Data barang berhasil diupdate',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mengupdate data barang');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.nama && formData.harga && formData.stok;

  if (isLoadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat data barang...</Text>
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
        <Text style={styles.headerTitle}>Edit Barang</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="cube" size={40} color="#FF9800" />
          </View>
          <Text style={styles.avatarText}>Edit Data Barang</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nama Barang</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'nama' && styles.inputWrapperFocused
          ]}>
            <Ionicons name="cube" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama barang"
              value={formData.nama}
              onChangeText={(value) => handleInputChange('nama', value)}
              onFocus={() => setFocusedInput('nama')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Price Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Harga</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'harga' && styles.inputWrapperFocused
          ]}>
            <Ionicons name="pricetag" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan harga"
              value={formData.harga}
              onChangeText={(value) => handleInputChange('harga', value)}
              onFocus={() => setFocusedInput('harga')}
              onBlur={() => setFocusedInput('')}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Stock Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stok</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'stok' && styles.inputWrapperFocused
          ]}>
            <Ionicons name="layers" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan jumlah stok"
              value={formData.stok}
              onChangeText={(value) => handleInputChange('stok', value)}
              onFocus={() => setFocusedInput('stok')}
              onBlur={() => setFocusedInput('')}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Expiry Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tanggal Kadaluwarsa (Opsional)</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'tgl_kadaluwarsa' && styles.inputWrapperFocused
          ]}>
            <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.tgl_kadaluwarsa}
              onChangeText={(value) => handleInputChange('tgl_kadaluwarsa', value)}
              onFocus={() => setFocusedInput('tgl_kadaluwarsa')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: '#FF9800' },
            (!isFormValid || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Update Barang</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}