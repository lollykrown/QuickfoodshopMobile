import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';import { useRouter } from 'expo-router';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(30);
  const isOtpComplete = otp.every(digit => digit !== '');
  const [created, setCreated] = useState(false);

  const inputs = useRef([]);
  const router = useRouter();

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

  const verifyOtp = (code) => {
    console.log('OTP entered:', code);

    // Call backend verify endpoint
    // await api.post('/verify-otp', { code })
    //set Created to true if success
    setCreated(true);
  };

  const resendOtp = () => {
    if (timer > 0) return;

    console.log('Resend OTP');
    setTimer(30);

    // Call backend resend endpoint
    // await api.post('/resend-otp')
  };

  return (
    <View style={styles.container}>
    {created ?
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
    </SafeAreaView> :     
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
              style={styles.input}
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
              onPress={() => router.push('/myCart/delivery')}
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
  resend: {
    marginVertical: 25,
    color: '#0a84ff',
    fontWeight: '600',
  },
});
