import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';
import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resetPwd } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { set, z } from 'zod';
import { pwdResetSchema } from '@/lib/zod';
import FormInput from '@/components/FormInput';

const OTP_LENGTH = 6;
const dat = [
  { name: 'password', label: 'New Password', placeholder: 'New Password',icon: 'lock-outline', },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
    icon: 'lock-outline',
  },
];

export default function OTPScreen() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(0);
  const isOtpComplete = otp.every(digit => digit !== '');
  const [created, setCreated] = useState(false);
  const { role, email } = useLocalSearchParams();
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);
  const [showPwdScreen, setShowPwdScreen] = useState(false);

  const inputs = useRef([]);
  const router = useRouter();

    const {
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm({
      resolver: zodResolver(pwdResetSchema),
      defaultValues: {
        password: '',
        confirmPassword: '',
      },
    });

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Handle input change
  const handleChange = (text, index) => {
    if (!/^\d*$/.test(text)) return;
    const cleaned = text.replace(/\D/g, '')
    // 🔥 Full paste detected 
    if (cleaned.length === OTP_LENGTH) { 
      const newOtp = cleaned.split(''); 
      setOtp(newOtp); 
      verifyOtp(cleaned); 
      return; 
    }    
        
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    // Move to next
    if (cleaned && index < OTP_LENGTH - 1) {
      inputs.current[index + 1].focus();
    }

    // Auto submit when full
    if (newOtp.every(d => d !== '')) {
      Keyboard.dismiss();
      verifyOtp(newOtp.join(''));
    }
  };

  // Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verifyOtp = async(code) => {
    console.log('OTP entered:', code, email, role);
    setPayload(prev => ({ ...prev, otp_token: code, email }));
    setShowPwdScreen(true);

  };

  const resendOtp = () => {
    if (timer > 0) return;

    console.log('Resend OTP');
    setTimer(30);

    // Call backend resend endpoint
    // await api.post('/resend-otp')
  };
  const onSubmit = async (data) => {
    Keyboard.dismiss();

    const { password } = data;
    setPayload(prev => ({ ...prev, password}));

    const updatedPayload = {
      ...payload,
      password,
    }
    try {
    const res = await resetPwd({ payload: updatedPayload, role });
      if(res?.success) {
        setShowPwdScreen(false);
        setCreated(true); 
}
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <View style={styles.container}>
    {showPwdScreen &&
    <SafeAreaView style={{flex:1,paddingHorizontal:24, marginTop:60}} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
            style={styles.textArea}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
        <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Change New Password</Text>
        <Text style={{ color:'#666666', marginBottom:39,}} >Enter your registered email below</Text>   
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
          <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Reset Password'}</Text>
          {isSubmitting && (<ActivityIndicator size={18} color="white" /> )}
        </RipplePressable>
        </KeyboardAvoidingView>
    </SafeAreaView>}

    {created &&
    <SafeAreaView style={{flex:1,paddingHorizontal:24, alignItems:'center',marginTop:60}} edges={['top', 'bottom']}>
      <MaterialCommunityIcons name="check-circle" style={{marginTop:40}} size={90} color={Colors.primary} />
      <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Account Created.</Text>
      <Text style={{ color:'#666666', marginBottom:24, marginHorizontal:20, textAlign:'center'}} >Your account has been created successfully.</Text>      
      <RipplePressable
        style={styles.button}
        onPress={() => router.push('/customer/login')}
        rippleColor="rgba(255,255,255,0.6)"
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </RipplePressable>
    </SafeAreaView>}

    {(!created &&  !showPwdScreen)&&
    <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
      </Appbar.Header>
      <View style={{ marginBottom: 18, alignItems:'center', paddingHorizontal:24}} >
        <MaterialCommunityIcons name="email-fast-outline" size={90} color={Colors.primary}/>
        <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Check Mail for OTP</Text>
        <Text style={{fontSize:16, color:'#666666', marginBottom:24}} >Enter the code sent to your email here.</Text>
        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputs.current[index] = ref)}
              style={[styles.input, error && styles.inputErr]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>
          <Text style={{ color: '#ef4444', fontWeight:600, fontSize: 12, marginTop: 4 }}>{error}</Text>

      {/* Resend */}
        <TouchableOpacity
          onPress={resendOtp}
          disabled={timer > 0}
        >
          <Text style={styles.resend}>
            {timer > 0
              ? `Resend OTP in ${timer}s`
              : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
        <RipplePressable
              style={styles.button}
              onPress={verifyOtp.bind(null, otp.join(''))}
              disabled={!isOtpComplete|| timer>0}
              rippleColor="rgba(255,255,255,0.6)"
            >
          <Text style={styles.buttonText}>Continue</Text>
        </RipplePressable>
      </View> 
    </KeyboardAvoidingView>}
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

  otpRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  input: {
    width: 50,
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
  },
  inputErr: {
    width: 50,
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ef4444',
    textAlign: 'center',
    fontSize: 20,
  },
  resend: {
    marginVertical: 25,
    color: '#0a84ff',
    fontWeight: '600',
  },
});
