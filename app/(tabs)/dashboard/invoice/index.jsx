import { View, Text, Pressable, StyleSheet, Switch } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useState } from 'react';
import { useAuth } from "@/contexts/authContext";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import EmptyState from '@/components/EmptyState';


const Invoice = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
    const { logout, loading } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Invoice" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <EmptyState text='Invoice is Empty' icon={<FontAwesome6 name="file-invoice" size={120} color="#C4C4C4" />}/>
    </View>
  )
}

export default Invoice

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
    marginBottom:24
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform:'uppercase'
  },
})
