import FormInput from '@/components/FormInput';
import { Image } from 'expo-image';
import {
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GoogleLogo from '@/components/GoogleLogo';
import { Colors } from '@/constants/colors';
import { signupSchema } from '@/lib/zod';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import RipplePressable from '@/components/RipplePressable';

const { height } = Dimensions.get('window');
const dat = [
  { name: 'firstName', label: 'first name', placeholder: 'First name' },
  { name: 'lastName', label: 'last name', placeholder: 'Last name' },
  { name: 'email', label: 'Email', placeholder: 'Email' },
  { name: 'phone', label: 'Phone Number', placeholder: 'Phone number' },
  { name: 'password', label: 'Password', placeholder: 'Password' },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Confirm Password',
  },
];

export default function SignupForm() {
  const { role } = useLocalSearchParams();
  const router = useRouter();

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
    router.push('/otp');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.imageCont}
        source={require('../../../assets/images/onboardingBg.webp')}
        contentFit="cover"
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons
            style={{ textAlign: 'center' }}
            name="arrow-back-ios-new"
            size={18}
            color="black"
          />
        </Pressable>
        <Image
          source={require('../../../assets/images/onboarding3.webp')}
          width={'70%'}
          height={height * 0.45}
          contentPosition={{ top: 20, right: 0 }}
          accessibilityLabel={'sign up image'}
        />
        <View style={styles.overlay} />
      </ImageBackground>
      <KeyboardAvoidingView
        style={styles.textArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.bar}></View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingBottom: 20 }}
        >
          <Text
            style={{
              fontSize: 20,
              color: Colors.primary,
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            Create Account
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 12 }}>
            Already have an account?{' '}
            <Link href={`${role}/login`} asChild>
              <Text
                style={{
                  color: Colors.orange,
                  fontWeight: 500,
                  textDecorationColor: Colors.orange,
                  textDecorationStyle: 'solid',
                  textDecorationLine: 'underline',
                }}
              >
                Login
              </Text>
            </Link>
          </Text>

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
          rippleColor='rgba(255,255,255,0.6)'
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Text>
          </RipplePressable>

          <RipplePressable style={styles.button2} onPress={() => {}}>
            <GoogleLogo width={18} height={18} />
            <Text style={{ fontSize: 14, fontWeight: '500' }}>
              Sign up with Google
            </Text>
          </RipplePressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------- Styles -------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageCont: {
    height: height * 0.3,
    paddingTop: 20,
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backBtn: {
    backgroundColor: 'white',
    borderRadius: 12,
    position: 'absolute',
    left: 24,
    top: 54,
    zIndex: 10,
    padding: 6,
  },
  textArea: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  bar: {
    width: 60,
    height: 16,
    borderBottomWidth: 6,
    marginHorizontal: 'auto',
    borderBottomColor: '#dfdddd',
    borderRadius: 4,
    marginBottom: 12,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  button2: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 320,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    borderColor: Colors.border,
    backgroundColor: '#F3f3f3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
