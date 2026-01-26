import { View, Text, Pressable, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar, Divider } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useState } from 'react';
import { useAuth } from "@/contexts/authContext";
import ShimmerExpoImage from '@/components/ShimmerImg';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


const Account = () => {
  const router = useRouter();
  const drawer = useDrawer(); 

    const { logout, user, avatar } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Account" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{padding:24,}}>
        <View style={{ flexDirection: 'row',marginBottom:24,paddingHorizontal:8, alignItems: 'center', gap: 8 }}>
          <ShimmerExpoImage width={48} height={48} styles={{ borderRadius: 24 }} uri={user?.image || avatar} accessibilityLabel={user?.firstName} />
          <View style={{flexDirection:'column', gap:6}}>
            <Text style={{ fontSize: 16, fontWeight: '600', textTransform: 'capitalize', }}>{`${user?.firstName} ${user?.lastName}`}</Text>
            <Text style={{ fontSize: 12, color:'#748189'}}>Customer Account</Text>
          </View>
        </View>
        <Divider bold={true}/>

        <TouchableOpacity onPress={()=>router.push('/dashboard/account/edit-profile')} style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', marginTop:20, paddingVertical:10, paddingHorizontal:18,borderRadius:24, borderColor:'#c6e3e5', borderWidth:1,}}>
            <Text style={{fontWeight:600,fontSize:14,}}>Edit Profile</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>router.push('/dashboard/account/change-password')} style={{flexDirection:'row', justifyContent:'space-between',alignItems:'center', marginVertical:20, paddingVertical:10, paddingHorizontal:18,borderRadius:24, borderColor:'#c6e3e5', borderWidth:1,}}>
            <Text style={{fontWeight:600,fontSize:14,}}>Change Pasword </Text>
            <MaterialCommunityIcons name="lock-reset" size={24} color="black" />
        </TouchableOpacity>
      </View>

     <Pressable onPress={()=>logout()} style={{flexDirection:'row',gap:8,marginStart:28, alignItems:'center'}}>                
        <MaterialCommunityIcons name="logout" size={24} color='red'/>
        <Text style={{color:'red',fontSize:16 , fontWeight:600}}>Log out</Text>
    </Pressable>
    </View>
  )
}

export default Account

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
})
