import React from 'react';
import { View, Text, Pressable, StyleSheet, Keyboard } from 'react-native';
import { useForm } from 'react-hook-form';
import { loginSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput'

export default function LoginForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    Keyboard.dismiss();
    console.log('Login data:', data);
  };

  return (
    <View style={styles.container}>
      <FormInput
        control={control}
        name="email"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email?.message}
      />

      <FormInput
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        error={errors.password?.message}
      />

      <Pressable
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Text>
      </Pressable>
    </View>
  );
}

/* -------- Styles -------- */
const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0f766e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
