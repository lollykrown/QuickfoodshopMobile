import { Controller } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';


const FormInput = ({ control, name,label, error, ...props }) =>{
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = props.secureTextEntry || name.toLowerCase().includes('assword');


  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ textTransform: 'capitalize', marginBottom: 4 }}>{label}</Text>

          <View style={[styles.inputWrapper, error && styles.inputError]}>
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={isPasswordField && !showPassword}
              placeholder={props.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />

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
}
export default FormInput
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