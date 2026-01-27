import { View, Text, Pressable, StyleSheet, ScrollView, FlatList, } from 'react-native'
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useAuth } from "@/contexts/authContext";
import Accordion from '@/components/Accordion';
import EmptyState from '@/components/EmptyState';
import { useState } from 'react';


const orders = [
  {
    id: 1,
    orderNumber: '3378',
    code: '2139',
    date: 'Mar 12, 2025',
    vendor: 'Open Sea Restaurant',
    status: 'Completed',
    deliveryCode:2139
  },
  {
    id: 2,
    orderNumber: '3399',
    code: '2140',
    date: 'Mar 13, 2025',
    vendor: 'Blue Lagoon',
    status: 'Pending',
    deliveryCode:1339
  },
];
const orders2 = [
  {
    id: 1,
    orderNumber: '3398',
    code: '2139',
    date: 'Mar 12, 2025',
    vendor: 'Open Sea Restaurant',
    status: 'Completed',
    deliveryCode:2139
  },
  {
    id: 2,
    orderNumber: '3399',
    code: '2140',
    date: 'Mar 13, 2025',
    vendor: 'Blue Lagoon',
    status: 'Pending',
    deliveryCode:1339
  },
];

const Orders = () => {
  const router = useRouter();
  const drawer = useDrawer(); 
  const { logout, loading } = useAuth();

  const [expandedIds, setExpandedIds] = useState([]);

  const toggle = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const [expandedIds2, setExpandedIds2] = useState([]);

  const toggle2 = (id) => {
    setExpandedIds2((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };


  return (
    <View style={styles.container}>
      <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Orders" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      {orders.length===0?<EmptyState text='Orders Empty'/>:
      <View style={{ padding:20}}>
      <Text style={{fontWeight:600, fontSize:18,}}>Active Orders</Text>
      <FlatList
        data={orders}
        renderItem={({ item }) => <Accordion item={item} isExpanded={expandedIds.includes(item.id)} onToggle={() => toggle(item.id)}/>}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop:12}}/>
      <Text style={{fontWeight:600, fontSize:18,}}>Past Orders</Text>
      <FlatList
        data={orders2}
        renderItem={({ item }) => <Accordion item={item} isExpanded={expandedIds2.includes(item.id)} onToggle={() => toggle2(item.id)}/>}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ marginTop:12}}/>
        </View>
      // <View style={{ padding:20}}>
      //   <Text style={{fontWeight:600, fontSize:18,}}>Active Orders</Text>
      //   <View style={{paddingVertical:20}}>       
      //     {orders.map((order) => (
      //       <Accordion
      //         key={order.id}
      //         item={order}
      //         isExpanded={expandedIds.includes(order.id)}
      //         onToggle={() => toggle(order.id)}
      //       />
      //     ))}
      //   </View>
      // </View>
      }
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
