import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { addUserStyles as styles } from '../../styles/addUserStyles';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

export default function AddUserScreen() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    no_telpon: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [focusedInput, setFocusedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const roles = [
    { id: 'pemasok', label: 'Pemasok', icon: 'business', color: '#2196F3' },
    { id: 'pelanggan', label: 'Pelanggan', icon: 'people', color: '#f44336' }
  ];

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
    
    if (!formData.no_telpon.trim()) {
      newErrors.no_telpon = 'Nomor telepon harus diisi';
    } else if (formData.no_telpon.length < 10) {
      newErrors.no_telpon = 'Nomor telepon minimal 10 digit';
    } else if (!/^[0-9]+$/.test(formData.no_telpon)) {
      newErrors.no_telpon = 'Nomor telepon hanya boleh berisi angka';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      await apiService.createUser(token, {
        no_telpon: formData.no_telpon,
        password: formData.password,
        role: formData.role
      });
      
      setSuccessMessage('User berhasil ditambahkan');
      
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error) {
      const errorMessage = error.message || 'Gagal menambahkan user';
      
      // Check for specific error types
      if (errorMessage.includes('no_telpon') || errorMessage.includes('telepon')) {
        setErrors({ no_telpon: 'Nomor telepon sudah terdaftar' });
      } else if (errorMessage.includes('password')) {
        setErrors({ password: 'Password tidak valid' });
      } else if (errorMessage.includes('role')) {
        setErrors({ role: 'Role tidak valid' });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.no_telpon && formData.password && formData.confirmPassword && formData.role;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah User</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-add" size={40} color="#2196F3" />
          </View>
          <Text style={styles.avatarText}>Tambah User Baru</Text>
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nomor Telepon</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'phone' && styles.inputWrapperFocused,
            errors.no_telpon && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="08xxxxxxxxxx"
              value={formData.no_telpon}
              onChangeText={(value) => handleInputChange('no_telpon', value)}
              keyboardType="phone-pad"
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.no_telpon} visible={!!errors.no_telpon} />
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'password' && styles.inputWrapperFocused,
            errors.password && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.password} visible={!!errors.password} />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Konfirmasi Password</Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'confirmPassword' && styles.inputWrapperFocused,
            errors.confirmPassword && { borderColor: '#FF5722', borderWidth: 1 }
          ]}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ulangi password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput('')}
              editable={!isLoading}
            />
          </View>
          <ErrorMessage message={errors.confirmPassword} visible={!!errors.confirmPassword} />
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.roleTitle}>Pilih Role</Text>
          <View style={styles.roleOptions}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleOption,
                  formData.role === role.id && styles.roleOptionSelected,
                  errors.role && { borderColor: '#FF5722', borderWidth: 1 }
                ]}
                onPress={() => handleInputChange('role', role.id)}
                disabled={isLoading}
              >
                <Ionicons 
                  name={role.icon} 
                  size={24} 
                  color={formData.role === role.id ? role.color : '#666'} 
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText,
                  formData.role === role.id && styles.roleTextSelected
                ]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <ErrorMessage message={errors.role} visible={!!errors.role} />
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
            <Text style={styles.saveButtonText}>Simpan User</Text>
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