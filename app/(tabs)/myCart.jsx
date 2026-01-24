import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Keyboard } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useEffect, useState } from 'react';
import Fontisto from '@expo/vector-icons/Fontisto';
import useFetch from "@/hooks/usefetch";
import SearchBar from '@/components/SearchBar';
import { fetchAllData } from "@/services/api";
import { ItemCard } from '@/components/ItemCard';
import { useDrawer } from '@/contexts/DrawerProvider';


const MyCart = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
  
  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Cart" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>


    </View>
  )
}

export default MyCart

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
})
