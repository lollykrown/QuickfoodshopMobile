import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Link, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/authContext";
import Ionicons from '@expo/vector-icons/Ionicons';


const Dashboard = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
    const { logout, user } = useAuth();

    // const {data = [],loading,error,refetch,} = useFetch(() => getProfile(), false);
    // useEffect(() => {
    //     refetch();
    // }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="Dashboard"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ padding: 20, flexDirection:'row',justifyContent:'space-between'}}>          
        <View style={{flexDirection:'column', gap:6}}>
            <Text style={{ fontSize: 14}}>Welcome Back!</Text>
            <Text style={{ fontSize: 24, fontWeight: '600', textTransform: 'capitalize', }}>{`${user?.firstName} ${user?.lastName}`}</Text>
        </View>
          <Link href='/dashboard/notifications'asChild >
            <View style={{position:'relative', alignSelf:'center'}}>
              <Ionicons name="notifications-outline" size={38} color={Colors.green} />
              <View style={{position:'absolute', top:0, right:0, padding:1.5, backgroundColor:'white', borderRadius:12}}>
                <View name="circle" style={{width:18,overflow:'hidden',flexDirection:'col',justifyContent:'center',alignItems:'center', borderRadius:12,height:18,backgroundColor:Colors.red}}>
                  <Text style={{color:'white', fontSize:12,fontWeight:600 }}>3</Text>
                </View>
              </View>
            </View>
          </Link>
      </View>
    </View>
  );
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
})
