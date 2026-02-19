import FormInput from '@/components/FormInput';
import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/authContext';
import { useDrawer } from '@/contexts/DrawerProvider';
import { editProfileSchema } from '@/lib/zod';
import AntDesign from '@expo/vector-icons/AntDesign';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';

const ChangePassword = () => {
  const router = useRouter();
  const drawer = useDrawer();

  const { avatar, user, update, loading } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });
  const onSubmit = async (data) => {
    Keyboard.dismiss();

    const { email, password } = data;
    // const res = await login('joe_kayu@yahoo.com', 'Kvothe01!')

    const res = await update(email, password);
    if (res) Alert.alert('Password changed successfully');
    return;
  };
  const dat = [
    {
      name: 'currentPassword',
      placeholder: 'Old Password',
      icon: 'lock-clock',
    },
    { name: 'newPassword', placeholder: 'New Password', icon: 'lock-outline' },
    {
      name: 'confrimPassword',
      placeholder: 'Confirm Password',
      icon: 'lock-outline',
    },
  ];

  return (
    <View style={styles.container}>
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
            placeholder={d.placeholder}
            leftIcon={d.icon}
            leftIconColor={Colors.grey}
            contStyles={{ borderRadius: 50 }}
            textInputStyles={
              d.name.includes('ame') && { textTransform: 'capitalize' }
            }
            error={errors?.[d.name]?.message}
            keyboardType={d.name === 'phone' ? 'phone-pad' : 'email-address'}
            secureTextEntry={d.name.includes('assword') ? true : false}
            key={d.name}
          />
        ))}
        <RipplePressable
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          rippleColor="rgba(255,255,255,0.6)"
        >
          <Text style={styles.buttonText}>
            {isSubmitting || loading ? 'Submitting..' : 'Save'}
          </Text>
        </RipplePressable>
      </View>
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
