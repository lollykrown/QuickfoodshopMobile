import { View, Text, Pressable, StyleSheet, Switch, Alert } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useState } from 'react';
import { useAuth } from "@/contexts/authContext";
import ShimmerExpoImage from '@/components/ShimmerImg';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { editProfileSchema } from '@/lib/zod';
import FormInput from '@/components/FormInput';


const EditProfile = () => {
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
      
          const { email,password} = data;
          // const res = await login('joe_kayu@yahoo.com', 'Kvothe01!')
    
          const res = await update(email,password)
          if (res)  Alert.alert('Profile updated successfully');
          return  
        };
        const dat = [ 
            {name:'firstName', icon:'person-outline'}, 
            {name:'lastName', icon:'person-outline'}, 
            {name:'email', icon:'mail-outline'}, 
            {name:'phoneNumber', icon:'phone'}, ]


  return (
    <View style={styles.container}>
        <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Edit Profile" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
            <Pressable onPress={drawer.toggle}>
            <AntDesign name="menu" size={24} color="black" />
            </Pressable>
        </Appbar.Header>
        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center',paddingVertical:28}}>
            <ShimmerExpoImage width={140} height={140} styles={{ borderRadius: '50%'}} uri={user?.image || avatar} accessibilityLabel={user?.firstName} />
        </View>
      <View style={{paddingHorizontal:20,}}>
        {dat.map(d=>(
        <FormInput
          control={control}
          name={d.name}
          placeholder={d.placeholder}
          leftIcon={d.icon}
          leftIconColor={'#748189'}
          contStyles={{borderRadius:50,}}
          textInputStyles={d.name.includes('ame')&&{textTransform:'capitalize'}}
          error={errors?.[d.name]?.message}
          keyboardType={d.name==='phone'?"phone-pad":"email-address"}
          secureTextEntry={d.name.includes('assword')?true:false}
          key={d.name}
        />
        ))}
        <Pressable
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting||loading ? 'Submitting..' : 'Save'}
          </Text>
        </Pressable>
      </View> 

    </View>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },  button: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  }
})
