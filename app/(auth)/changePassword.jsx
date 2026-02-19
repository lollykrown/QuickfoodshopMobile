import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { useRef, useState, useEffect } from 'react';
import { View, Text,  StyleSheet, Keyboard, } from 'react-native';
import FormInput from '@/components/FormInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


const dat = [
  { name: 'newPassword', label: 'New Password', placeholder: 'New Password' },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
  },
];

export default function ChangePassword() {
  const [created, setCreated] = useState(false);

  const router = useRouter();

 const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
        z.object({ newPassword: z.string().min(6, 'Minimum 6 characters'),
            confirmPassword: z.string().min(6, 'Minimum 6 characters'),    })
            .refine((data) => data.newPassword === data.confirmPassword, {
                message: 'Passwords do not match',
                path: ['confirmPassword'],}),
    ),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {    
    Keyboard.dismiss();

    const { newPassword, confirmPassword} = data;
    console.log('Forgot payload:', newPassword, confirmPassword);
    setCreated(true);
  };
  return (
    <View style={styles.container}>
        {created?
        (<SafeAreaView style={{ flex:1, marginTop:60, marginBottom: 18, alignItems:'center', paddingHorizontal:24}} >
            <MaterialCommunityIcons name="check-circle" style={{marginTop:40}} size={90} color={Colors.primary} />
            <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Success</Text>
            <Text style={{ color:'#666666', marginBottom:24, textAlign:'center', marginHorizontal:20}} >Your password has been changed successfully! </Text>      
            <RipplePressable
                style={styles.button}
                onPress={() => router.push('/customer/login')}
                rippleColor="rgba(255,255,255,0.6)"
            >
                <Text style={styles.buttonText}>Go to Login</Text>
            </RipplePressable>
        </SafeAreaView>):
        (<View >
            <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
                <Appbar.BackAction color="black" onPress={() => router.back()} />
            </Appbar.Header>
            <View style={{ marginBottom: 18, paddingHorizontal:24}} >
                <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Change New Password</Text>
                <Text style={{fontSize:14, color:'#666666', marginBottom:24}} >Enter your registered email below</Text>
                {dat.map((d) => (
                    <FormInput
                    control={control}
                    name={d.name}
                    label={d.label}
                    placeholder={d.placeholder}
                    error={errors?.[d.name]?.message}
                    autoCapitalize="none"
                    key={d.name}
                    />
                ))}
                
                <RipplePressable
                    style={styles.button}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    rippleColor="rgba(255,255,255,0.6)"
                    >
                <Text style={styles.buttonText}>reset password</Text>
                </RipplePressable>
            </View> 
        </View>)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
