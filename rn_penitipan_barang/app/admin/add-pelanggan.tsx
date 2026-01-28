import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { addUserStyles as styles } from '../../styles/addUserStyles';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

export default function AddPelangganScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [tokos, setTokos] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    warung_id: '',
    nama: '',
    tgl_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    status: 'aktif'
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const genderOptions = [
    { id: 'laki_laki', label: 'Laki-laki', icon: 'man', color: '#2196F3' },
    { id: 'perempuan', label: 'Perempuan', icon: 'woman', color: '#f44336' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchTokos();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiService.getAllUsers(token);
      // Filter only pelanggan users who don't have profile yet
      const pelangganUsers = response.filter(user => user.role === 'pelanggan');
      setUsers(pelangganUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTokos = async () => {
    try {
      const response = await apiService.getAllToko(token);
      setTokos(response);
    } catch (error) {
      console.error('Error fetching tokos:', error);
    }
  };

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
    
    if (!formData.user_id) {
      newErrors.user_id = 'User harus dipilih';
    }
    if (!formData.warung_id) {
      newErrors.warung_id = 'Warung harus dipilih';
    }
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama harus diisi';
    }
    if (!formData.tgl_lahir) {
      newErrors.tgl_lahir = 'Tanggal lahir harus diisi';
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.tgl_lahir)) {
        newErrors.tgl_lahir = 'Format tanggal harus YYYY-MM-DD';
      }
    }
    if (!formData.jenis_kelamin) {
      newErrors.jenis_kelamin = 'Jenis kelamin harus dipilih';
    }
    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat harus diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      await apiService.createPelangganProfile(token, formData);
      
      setSuccessMessage('Profil pelanggan berhasil ditambahkan');
      
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.message || 'Gagal menambahkan profil pelanggan';
      
      // Check for specific error types
      if (errorMessage.includes('user_id')) {
        setErrors({ user_id: 'User sudah memiliki profil pelanggan' });
      } else if (errorMessage.includes('warung_id')) {
        setErrors({ warung_id: 'Warung tidak valid' });
      } else if (errorMessage.includes('nama')) {
        setErrors({ nama: 'Nama tidak valid' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.user_id && formData.warung_id && formData.nama && formData.tgl_lahir && formData.jenis_kelamin && formData.alamat;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Pelanggan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="people" size={40} color="#f44336" />
          </View>
          <Text style={styles.avatarText}>Tambah Profil Pelanggan</Text>
        </View>

        {/* User Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Pilih User Pelanggan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.roleOption,
                  { marginRight: 12, minWidth: 120 },
                  formData.user_id === user.id.toString() && styles.roleOptionSelected,
                  errors.user_id && { borderColor: '#FF5722', borderWidth: 1 }
                ]}
                onPress={() => handleInputChange('user_id', user.id.toString())}
                disabled={isLoading}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={formData.user_id === user.id.toString() ? '#f44336' : '#666'} 
                />
                <Text style={[
                  styles.roleText,
                  { fontSize: 12, textAlign: 'center' },
                  formData.user_id === user.id.toString() && styles.roleTextSelected
                ]}>
                  {user.no_telpon}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ErrorMessage message={errors.user_id} visible={!!errors.user_id} />
        </View>

        {/* Warung Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Pilih Warung</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {tokos.map((toko) => (
              <TouchableOpacity
                key={toko.id}
                style={[
                  styles.roleOption,
                  { marginRight: 12, minWidth: 120 },
                  formData.warung_id === toko.id.toString() && styles.roleOptionSelected,
                  errors.warung_id && { borderColor: '#FF5722', borderWidth: 1 }
                ]}
                onPress={() => handleInputChange('warung_id', toko.id.toString())}
                disabled={isLoading}
              >
                <Ionicons 
                  name="storefront" 
                  size={20} 
                  color={formData.warung_id === toko.id.toString() ? '#f44336' : '#666'} 
                />
                <Text style={[
                  styles.roleText,
                  { fontSize: 12, textAlign: 'center' },
                  formData.warung_id === toko.id.toString() && styles.roleTextSelected
                ]}>
                  {toko.nama}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <ErrorMessage message={errors.warung_id} visible={!!errors.warung_id} />
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'nama' && styles.inputWrapperFocused,
            errors.nama && { borderColor: '#FF5722', borderWidth: 1 }
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
          <ErrorMessage message={errors.nama} visible={!!errors.nama} />
        </View>

        {/* Birth Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tanggal Lahir</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'tgl_lahir' && styles.inputWrapperFocused,
            errors.tgl_lahir && { borderColor: '#FF5722', borderWidth: 1 }
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
          <ErrorMessage message={errors.tgl_lahir} visible={!!errors.tgl_lahir} />
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
                  formData.jenis_kelamin === gender.id && styles.roleOptionSelected,
                  errors.jenis_kelamin && { borderColor: '#FF5722', borderWidth: 1 }
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
          <ErrorMessage message={errors.jenis_kelamin} visible={!!errors.jenis_kelamin} />
        </View>

        {/* Address Input */}
        <View style={styles.textAreaGroup}>
          <Text style={styles.inputLabel}>Alamat</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'alamat' && styles.inputWrapperFocused,
            { minHeight: 80 },
            errors.alamat && { borderColor: '#FF5722', borderWidth: 1 }
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
          <ErrorMessage message={errors.alamat} visible={!!errors.alamat} />
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
            <Text style={styles.saveButtonText}>Simpan Pelanggan</Text>
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