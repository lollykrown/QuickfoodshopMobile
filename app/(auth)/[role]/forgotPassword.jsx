import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { useRef, useState, useEffect } from 'react';
import { View, Text,  StyleSheet, Keyboard, } from 'react-native';
import FormInput from '@/components/FormInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgetPwd } from '@/services/api';


export default function ForgotPassword() {
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const { role } = useLocalSearchParams();
  const router = useRouter();

 const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(
        z.object({ email: z.string().trim().email('Invalid email address') }),
    ),
    defaultValues: {
      email: '',
    },
  });

const onSubmit = async (data) => {
  Keyboard.dismiss();

  const { email } = data;
  if(!email)return
  setPayload({ email, role }); 

  try {
    const res = await forgetPwd({ email, role });
    // console.log('Forgot response:', res);
     res?.success &&setCreated(true); // success if no error thrown
  } catch (error) {
    setError(error.message);
  }
};

  return (
    <View style={styles.container}>
        {created?
        (<SafeAreaView style={{ flex:1, marginTop:60, marginBottom: 18, alignItems:'center', paddingHorizontal:24}} >
            <MaterialCommunityIcons name="email-fast-outline" size={90} color={Colors.primary}/>
            <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Check Mail for OTP</Text>
            <Text style={{fontSize:16, color:'#666666', marginBottom:24}} >A verification code has been sent to your email.</Text>   
      <RipplePressable
        style={styles.button}
        onPress={() => router.replace(`/otp?email=${payload?.email}&role=${payload?.role}`)}
        rippleColor="rgba(255,255,255,0.6)"
      >
        <Text style={styles.buttonText}>Continue</Text>
      </RipplePressable>
        </SafeAreaView>):
        (<View >
            <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
                <Appbar.BackAction color="black" onPress={() => router.back()} />
            </Appbar.Header>
            <View style={{ marginBottom: 18, paddingHorizontal:24}} >
                <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Forgot Password</Text>
                <Text style={{fontSize:14, color:'#666666', marginBottom:24}} >Enter your registered email below</Text>
                <FormInput
                control={control}
                name={'email'}
                label={'Email Address'}
                placeholder={'e.g.email@example.com'}
                error={errors?.email?.message||error}
                autoCapitalize="none"
                key={'email'}
                labelStyles={{
                    marginLeft: 2,
                    fontWeight: 600,
                    marginTop: 12,
                }}
                />
                <Text style={{ color:'#666666', marginBottom:12}} >
                    Remember the password? <Text style={{ color: Colors.green, fontWeight: 600 }} onPress={() => router.push(`/${role}/login`)}>Sign in</Text></Text>

                <RipplePressable
                    style={styles.button}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    rippleColor="rgba(255,255,255,0.6)"
                    >
                <Text style={styles.buttonText}>Send Link</Text>
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
