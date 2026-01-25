import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Keyboard } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useEffect, useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
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
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="My Cart"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      <View style={{ flex: 1 , paddingHorizontal:24, paddingVertical:28}}>
        <View style={{ flex: 1, justifyContent:'center', alignItems:'center'}}>
          <MaterialCommunityIcons name="cart-off" size={120} color="#C4C4C4" />
          <Text style={{fontSize:26, color:'#C4C4C4', marginTop:24, fontWeight:700}}>Cart is Empty</Text>
        </View>
        <Pressable
          style={styles.button}
          onPress={()=>router.push('/search')}
        >
          <Text style={styles.buttonText}>
            Browse Items
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default MyCart

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
