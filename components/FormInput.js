import { Controller } from 'react-hook-form';
import { View, Text, TextInput, StyleSheet } from 'react-native';


const FormInput = ({ control, name, error, ...props }) =>{
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View style={{ marginBottom: 12 }}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...props}
          />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}
    />
  );
}
export default FormInput
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});