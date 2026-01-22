import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { signupSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '@/components/FormInput'

export default function SignupForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    Keyboard.dismiss();

    const { confirmPassword, ...payload } = data;
    console.log('Signup payload:', payload);
  };

  return (
    <View style={styles.container}>
      <FormInput
        control={control}
        name="firstName"
        placeholder="First name"
        error={errors.firstName?.message}
      />

      <FormInput
        control={control}
        name="lastName"
        placeholder="Last name"
        error={errors.lastName?.message}
      />

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
        name="phone"
        placeholder="Phone number"
        keyboardType="phone-pad"
        error={errors.phone?.message}
      />

      <FormInput
        control={control}
        name="password"
        placeholder="Password"
        secureTextEntry
        error={errors.password?.message}
      />

      <FormInput
        control={control}
        name="confirmPassword"
        placeholder="Confirm password"
        secureTextEntry
        error={errors.confirmPassword?.message}
      />

      <Pressable
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Creating account...' : 'Sign Up'}
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
