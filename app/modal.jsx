import { StyleSheet, View, Text, Keyboard , Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import FormInput from '@/components/FormInput';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useForm } from 'react-hook-form';
import { loginSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import GoogleLogo from '@/components/GoogleLogo';
import { useAuth } from '@/contexts/authContext'


export default function ModalScreen() {
  const {role, prev}= useLocalSearchParams()
  const router = useRouter()
  const { login, loading } = useAuth();

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
  
    const handleX = () => {
      if (prev) {
        router.replace('/home');
      }else{
        router.push('/')
      }
    }
    const onSubmit = async (data) => {
      Keyboard.dismiss();
  
      const { email,password} = data;
      // const res = await login('joe_kayu@yahoo.com', 'Kvothe01!')

      const res = await login(email,password)
      if(res) router.replace('/home')
      return  
    };
    const dat = [
      {name:'email',label:'Email',placeholder:"Email"},
      {name:'password',label:'Password',placeholder:"Password"},
    ]
  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>

      <Pressable style={styles.backBtn} onPress={handleX}>
        <Ionicons style={{textAlign:'center', fontWeight:700}} name="close" size={19} color="black" />
      </Pressable>

      <Text style={{fontSize:20, color:Colors.primary, textAlign:'center', fontWeight:700}}>Login </Text>

      <Text style={{textAlign:'center',marginBottom:22, marginTop:10}}>Don&apos;t have an account? {" "}
      <Link href={`${role}/login`} asChild><Text style={{color:Colors.orange, fontWeight:500,textDecorationColor: Colors.orange,textDecorationStyle: 'solid',textDecorationLine: 'underline',}}>Sign up</Text></Link></Text>
      <View
        // contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        // keyboardShouldPersistTaps="handled"
        >
        {dat.map(d=>(
        <FormInput
          control={control}
          name={d.name}
          label={d.label}
          placeholder={d.placeholder}
          error={errors?.[d.name]?.message}
          autoCapitalize="none"
          keyboardType={d.name==='phone'?"phone-pad":"email-address"}
          secureTextEntry={d.name.includes('assword')?true:false}
          key={d.name}
        />
        ))}
        <Text style={{textAlign:'right', color:Colors.primary,fontWeight:600}}>Forgot Password?</Text>
        <Pressable
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting||loading ? 'Submitting..' : 'Login'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.button2}
          onPress={()=>{}}
        >  
        <GoogleLogo width={18} height={18} />
          <Text style={{fontSize: 14,fontWeight: '500',}}>
            Login with Google
          </Text>
        </Pressable>
      </View> 
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding:7,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // shadow for Android
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
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
    marginBottom:320,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    gap:12,
    borderColor: '#DADCE0',
    backgroundColor: '#F3f3f3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
