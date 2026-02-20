import FormInput from '@/components/FormInput';
import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import { pwdChngSchema } from '@/lib/zod';
import { changePwd } from '@/services/dashboardApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const dat = [
    {
      name: 'currentPassword',
      placeholder: 'Old Password',
      icon: 'lock-clock',
    },
    { name: 'newPassword', placeholder: 'New Password', icon: 'lock-outline' },
    {
      name: 'confirmPassword',
      placeholder: 'Confirm Password',
      icon: 'lock-outline',
    },
  ];

const ChangePassword = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const { avatar, user, logout } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(pwdChngSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    Keyboard.dismiss();
    
    const { currentPassword, newPassword } = data;
    const payload = {currentPassword, newPassword}
    const role=user.role
  try {
    const res = await changePwd({ payload, role });

    if (res?.success) {
      setCreated(true);
      await logout()
    }

  } catch (error) {
    console.log('Handled error:', error.message);
    if (error?.message.includes('login')||error?.message.includes('header')) {
      await logout();
      router.replace(`${user.role}/login`)
    }
    setError(error.message)
  }

    return;
  };


  return (
    <View style={styles.container}>
    {created ?
    <SafeAreaView style={{flex:1,paddingHorizontal:24, alignItems:'center',marginTop:60}} edges={['top', 'bottom']}>
      <MaterialCommunityIcons name="check-circle" style={{marginTop:40}} size={90} color={Colors.primary} />
      <Text style={{fontSize:24, fontWeight:'700', marginVertical:12}} >Password changed.</Text>
      <Text style={{ color:'#666666', marginBottom:24, marginHorizontal:20, textAlign:'center'}} >Your password has been changed successfully.</Text>      
      <RipplePressable
        style={styles.button}
        onPress={() => router.push('/customer/login')}
        rippleColor="rgba(255,255,255,0.6)"
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </RipplePressable>
    </SafeAreaView>:<>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Change Password"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 28,
        }}
      >
        <ShimmerExpoImage
          width={140}
          height={140}
          styles={{ borderRadius: '50%' }}
          uri={user?.image || avatar}
          accessibilityLabel={user?.firstName}
        />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {dat.map((d) => (
          <FormInput
              control={control}
              name={d.name}
              label={d.label}
              placeholder={d.placeholder}
              leftIcon={d.icon}
              leftIconColor={Colors.grey}
              error={errors?.[d.name]?.message}
              autoCapitalize="none"
              contStyles={{ borderRadius: 50 }}
              keyboardType={d.name === 'phone' ? 'phone-pad' : 'email-address'}
              key={d.name}
            />
          ))}
          <Text style={{ color: '#ef4444', fontWeight:600, fontSize: 12, marginTop: -10, marginHorizontal:10 }}>{error}</Text>
        <RipplePressable
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          rippleColor='rgba(255,255,255,0.6)'
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Submitting..' : 'Save'}
          </Text>
        </RipplePressable>
      </View></>}
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
