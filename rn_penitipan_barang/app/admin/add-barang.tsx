import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { addUserStyles as styles } from '../../styles/addUserStyles';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

export default function AddBarangScreen() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    harga: '',
    stok: '',
    tgl_kadaluwarsa: ''
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama barang harus diisi';
    }
    if (!formData.harga) {
      newErrors.harga = 'Harga harus diisi';
    } else if (isNaN(Number(formData.harga)) || Number(formData.harga) <= 0) {
      newErrors.harga = 'Harga harus berupa angka positif';
    }
    if (!formData.stok) {
      newErrors.stok = 'Stok harus diisi';
    } else if (isNaN(Number(formData.stok)) || Number(formData.stok) < 0) {
      newErrors.stok = 'Stok harus berupa angka positif atau nol';
    }
    if (formData.tgl_kadaluwarsa) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.tgl_kadaluwarsa)) {
        newErrors.tgl_kadaluwarsa = 'Format tanggal harus YYYY-MM-DD';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const barangData = {
        nama: formData.nama,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        tgl_kadaluwarsa: formData.tgl_kadaluwarsa || null
      };

      await apiService.createBarang(token, barangData);
      
      Alert.alert(
        'Berhasil',
        'Barang berhasil ditambahkan',
        [{
          text: 'OK',
          onPress: () => router.back()
        }]
      );
      
    } catch (error) {
      const errorMessage = error.message || 'Gagal menambahkan barang';
      
      // Check for specific error types
      if (errorMessage.includes('nama')) {
        setErrors({ nama: 'Nama barang sudah ada' });
      } else if (errorMessage.includes('harga')) {
        setErrors({ harga: 'Harga tidak valid' });
      } else if (errorMessage.includes('stok')) {
        setErrors({ stok: 'Stok tidak valid' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.nama && formData.harga && formData.stok;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Barang</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nama Barang</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'nama' && styles.inputWrapperFocused,
            errors.nama && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="pricetag" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Indomie"
              value={formData.nama}
              onChangeText={(value) => handleInputChange('nama', value)}
              onFocus={() => setFocusedInput('nama')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.nama} visible={!!errors.nama} />
        </View>

        {/* Price Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Harga</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'harga' && styles.inputWrapperFocused,
            errors.harga && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="cash" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="4000"
              value={formData.harga}
              onChangeText={(value) => handleInputChange('harga', value)}
              onFocus={() => setFocusedInput('harga')}
              onBlur={() => setFocusedInput('')}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.harga} visible={!!errors.harga} />
        </View>

        {/* Stock Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stok</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'stok' && styles.inputWrapperFocused,
            errors.stok && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="layers" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="10"
              value={formData.stok}
              onChangeText={(value) => handleInputChange('stok', value)}
              onFocus={() => setFocusedInput('stok')}
              onBlur={() => setFocusedInput('')}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.stok} visible={!!errors.stok} />
        </View>

        {/* Expiry Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tanggal Kadaluwarsa (Opsional)</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'tgl_kadaluwarsa' && styles.inputWrapperFocused,
            errors.tgl_kadaluwarsa && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="2026-11-10"
              value={formData.tgl_kadaluwarsa}
              onChangeText={(value) => handleInputChange('tgl_kadaluwarsa', value)}
              onFocus={() => setFocusedInput('tgl_kadaluwarsa')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.tgl_kadaluwarsa} visible={!!errors.tgl_kadaluwarsa} />
        </View>
        
        {/* General Error Message */}
        <ErrorMessage message={errors.general} visible={!!errors.general} />
        
        {/* Success Message */}
        <SuccessMessage message={successMessage} visible={!!successMessage} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Simpan</Text>
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