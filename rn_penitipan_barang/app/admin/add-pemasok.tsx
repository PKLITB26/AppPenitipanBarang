import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { addUserStyles as styles } from '../../styles/addUserStyles';

export default function AddPemasokScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    nama: '',
    jenis_kelamin: '',
    alamat: '',
    tgl_lahir: '',
    status: 'aktif'
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions = [
    { id: 'laki_laki', label: 'Laki-laki', icon: 'man', color: '#2196F3' },
    { id: 'perempuan', label: 'Perempuan', icon: 'woman', color: '#f44336' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiService.getAllUsers(token);
      // Filter only pemasok users who don't have profile yet
      const pemasokUsers = response.filter(user => user.role === 'pemasok');
      setUsers(pemasokUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.user_id) {
      Alert.alert('Error', 'User harus dipilih');
      return false;
    }
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
    if (!formData.tgl_lahir) {
      Alert.alert('Error', 'Tanggal lahir harus diisi');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await apiService.createPemasokProfile(token, formData);

      Alert.alert(
        'Berhasil',
        'Profil pemasok berhasil ditambahkan',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal menambahkan profil pemasok');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.user_id && formData.nama && formData.jenis_kelamin && formData.alamat && formData.tgl_lahir;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Pemasok</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="business" size={40} color="#2196F3" />
          </View>
          <Text style={styles.avatarText}>Tambah Profil Pemasok</Text>
        </View>

        {/* User Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Pilih User Pemasok</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.roleOption,
                  { marginRight: 12, minWidth: 120 },
                  formData.user_id === user.id.toString() && styles.roleOptionSelected
                ]}
                onPress={() => handleInputChange('user_id', user.id.toString())}
                disabled={isLoading}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={formData.user_id === user.id.toString() ? '#2196F3' : '#666'} 
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