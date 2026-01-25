import { View, Text, Pressable, StyleSheet, Switch } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useState } from 'react';
import { useAuth } from "@/contexts/authContext";


const Orders = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
    const { logout, loading } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Orders" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
    </View>
  )
}

export default Orders

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
})
