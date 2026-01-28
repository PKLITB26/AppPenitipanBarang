import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { addUserStyles as styles } from '../../styles/addUserStyles';

export default function EditPemasokScreen() {
  const { pemasokId } = useLocalSearchParams();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    jenis_kelamin: '',
    alamat: '',
    tgl_lahir: '',
    status: 'aktif'
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const genderOptions = [
    { id: 'laki_laki', label: 'Laki-laki', icon: 'man', color: '#2196F3' },
    { id: 'perempuan', label: 'Perempuan', icon: 'woman', color: '#f44336' }
  ];

  useEffect(() => {
    loadPemasokData();
  }, []);

  const loadPemasokData = async () => {
    try {
      setIsLoadingData(true);
      const data = await apiService.getPemasokDetail(token, pemasokId);
      
      // Format tanggal lahir ke YYYY-MM-DD
      let formattedDate = '';
      if (data.tgl_lahir) {
        const date = new Date(data.tgl_lahir);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      
      setFormData({
        nama: data.nama || '',
        jenis_kelamin: data.jenis_kelamin || '',
        alamat: data.alamat || '',
        tgl_lahir: formattedDate,
        status: data.status || 'aktif'
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data pemasok');
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
      Alert.alert('Error', 'Nama harus diisi');
      return false;
    }
    if (!formData.jenis_kelamin) {
      Alert.alert('Error', 'Jenis kelamin harus dipilih');
      return false;
    }
    if (!formData.alamat.trim()) {
      Alert.alert('Error', 'Alamat harus diisi');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await apiService.updatePemasok(token, pemasokId, formData);

      Alert.alert(
        'Berhasil',
        'Data pemasok berhasil diupdate',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mengupdate data pemasok');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.nama && formData.jenis_kelamin && formData.alamat;

  if (isLoadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, color: '#666' }}>Memuat data pemasok...</Text>
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
        <Text style={styles.headerTitle}>Edit Pemasok</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="business" size={40} color="#2196F3" />
          </View>
          <Text style={styles.avatarText}>Edit Data Pemasok</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'nama' && styles.inputWrapperFocused
          ]}>
            <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              value={formData.nama}
              onChangeText={(value) => handleInputChange('nama', value)}
              onFocus={() => setFocusedInput('nama')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>Jenis Kelamin</Text>
          <View style={styles.roleOptions}>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender.id}
                style={[
                  styles.roleOption,
                  formData.jenis_kelamin === gender.id && styles.roleOptionSelected
                ]}
                onPress={() => handleInputChange('jenis_kelamin', gender.id)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={gender.icon} 
                  size={24} 
                  color={formData.jenis_kelamin === gender.id ? gender.color : '#666'} 
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText,
                  formData.jenis_kelamin === gender.id && styles.roleTextSelected
                ]}>
                  {gender.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Birth Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tanggal Lahir</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'tgl_lahir' && styles.inputWrapperFocused
          ]}>
            <Ionicons name="calendar" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.tgl_lahir}
              onChangeText={(value) => handleInputChange('tgl_lahir', value)}
              onFocus={() => setFocusedInput('tgl_lahir')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Address Input */}
        <View style={styles.textAreaGroup}>
          <Text style={styles.inputLabel}>Alamat</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'alamat' && styles.inputWrapperFocused,
            { minHeight: 80 }
          ]}>
            <Ionicons name="location" size={20} color="#666" style={[styles.inputIcon, { top: 25 }]} />
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 18 }]}
              placeholder="Masukkan alamat lengkap"
              value={formData.alamat}
              onChangeText={(value) => handleInputChange('alamat', value)}
              multiline
              numberOfLines={3}
              onFocus={() => setFocusedInput('alamat')}
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
            (!isFormValid || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Update Pemasok</Text>
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