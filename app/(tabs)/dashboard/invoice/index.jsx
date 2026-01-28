import { View, Text, Pressable, StyleSheet, SectionList, TouchableOpacity } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useState } from 'react';
import { useAuth } from "@/contexts/authContext";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import EmptyState from '@/components/EmptyState';
import Feather from '@expo/vector-icons/Feather';
import RipplePressable from '@/components/RipplePressable';

const invoices = [
  {
    date: 'Mar 4, 2025',
    data: [{
      vendor: 'Order #3398',
      status: 'Completed',
      price:250
    },
    {
      vendor: 'Order #3399',
      status: 'Pending',
      price:250
    },
    {
      vendor: "Order #3388",
      status: 'Completed',
      price:250
    },
    {
      vendor: 'Order #7678',
      status: 'Failed',
      price:250
    },
  ]},
  {
    date: 'Mar 7, 2025',
    data: [{
      vendor: 'Order #8678',
      status: 'Completed',
      price:390
    },
    {
      vendor: 'Order #4567',
      status: 'Completed',
      price:390
    },
]},
  {
    date: 'Mar 14, 2025',
    data: [{
      vendor: 'Order #4567',
      status: 'Completed',
      price:390
    },
    {
      vendor: 'Order #0877',
      status: 'Completed',
      price:390
    },
]},
  {
    date: 'Mar 22, 2025',
    data: [ {
      vendor: 'Order #2340',
      status: 'Completed',
      price:390
    },
  ]},
];


const Invoices = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
    const { user, avatar } = useAuth();

  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Invoices" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      {invoices.length===0&&<EmptyState text='Transactions Empty' icon={<FontAwesome6 name="hand-holding-dollar" size={120} color="#C4C4C4" />}/>}
      <SectionList
        sections={invoices}
        keyExtractor={(item, index) => 'i' + index}
        renderItem={({item}) => (
          <RipplePressable style={{flexDirection:'row',marginHorizontal:18, gap:10, marginTop:12, borderWidth:1, padding:12,borderColor:Colors.border,borderRadius:24,alignItems: 'center',}}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{fontSize:16,fontWeight:600}} numberOfLines={1} ellipsizeMode="tail">{item.vendor}</Text>
              <Text style={{color:Colors.grey }} numberOfLines={1} ellipsizeMode="tail">Jollof rice and chicken </Text>
            </View>
            <View style={{borderWidth:1,borderColor:Colors.border, padding:8, borderRadius:20}}>
              <Feather name="download" size={18} color={Colors.green} />
            </View>
          </RipplePressable>
        )}
        renderSectionHeader={({section: {date}}) => (
          <Text style={{fontWeight:600, fontSize:20,paddingHorizontal:12, paddingVertical:6,marginTop:24,marginHorizontal:8, backgroundColor:'#F8F8F8'}}>{date}</Text>
        )}
      />
    </View>
  )
}

export default Invoices

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
