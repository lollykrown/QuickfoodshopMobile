import { Controller } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';

const FormInput = ({
  control,
  name,
  label,
  error,
  leftIcon,        // 👈 new prop
  leftIconColor = '#555',
  contStyles,
  labelStyles,
  textInputStyles,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField =
    props.secureTextEntry || name.toLowerCase().includes('assword');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={{ marginBottom: 12 }}>
          {label && (
            <Text style={{ textTransform: 'capitalize', marginBottom: 4, ...labelStyles }}>
              {label}
            </Text>
          )}

          <View style={[styles.inputWrapper, error && styles.inputError, contStyles]}>
            
            {/* LEFT ICON */}
            {leftIcon && (
              <View style={styles.leftIcon}>
                <MaterialIcons
                  name={leftIcon}
                  size={22}
                  color={leftIconColor}
                />
              </View>
            )}

            <TextInput
              style={[
                styles.input,
                leftIcon && styles.inputWithLeftIcon,textInputStyles
              ]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={isPasswordField && !showPassword}
              placeholder={props.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              {...props}
            />

            {/* PASSWORD TOGGLE */}
            {isPasswordField && (
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color="#555"
                />
              </Pressable>
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}
    />
  );
};

export default FormInput;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 4, // prevents extra spacing
  },
  leftIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  iconButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});
