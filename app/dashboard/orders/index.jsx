import Accordion from '@/components/Accordion';
import EmptyState from '@/components/EmptyState';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useAuth } from '@/contexts/authContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Appbar, FAB } from 'react-native-paper';

const orders = [
  {
    id: 11,
    orderNumber: '3378',
    code: '2139',
    date: 'Mar 12, 2025',
    vendor: 'Open Sea Restaurant',
    status: 'Completed',
    deliveryCode: 2139,
    items: [
      { name: 'Jollof rice and chicken', quantity: 1 },
      { name: 'Fried rice and chicken', quantity: 1 },
      { name: 'Spagetti Bolognes', quantity: 3 },
    ],
    extras: [
      { name: 'Orange juice', quantity: 1 },
      { name: 'water 50cl', quantity: 1 },
      { name: 'Coca cola', quantity: 3 },
    ],
  },
  {
    id: 22,
    orderNumber: '3399',
    code: '2140',
    date: 'Mar 13, 2025',
    vendor: 'Blue Lagoon',
    status: 'Pending',
    deliveryCode: 1339,
    items: [
      { name: 'Puff puff', quantity: 1 },
      { name: 'Eba nad Egusi', quantity: 1 },
      { name: 'Croaker Fish', quantity: 3 },
    ],
    extras: [
      { name: 'Orange juice', quantity: 1 },
      { name: 'water 50cl', quantity: 1 },
      { name: 'Coca cola', quantity: 3 },
    ],
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
    deliveryCode: 2139,
    items: [
      { name: 'Jollof rice and chicken', quantity: 1 },
      { name: 'Fried rice and chicken', quantity: 1 },
      { name: 'Spagetti Bolognes', quantity: 3 },
    ],
    extras: [
      { name: 'Orange juice', quantity: 1 },
      { name: 'water 50cl', quantity: 1 },
      { name: 'Coca cola', quantity: 3 },
    ],
  },
  {
    id: 2,
    orderNumber: '3499',
    code: '2140',
    date: 'Mar 13, 2025',
    vendor: 'Blue Lagoon',
    status: 'Pending',
    deliveryCode: 1339,
    items: [
      { name: 'Puff puff', quantity: 1 },
      { name: 'Eba and Egusi', quantity: 1 },
      { name: 'Croaker Fish', quantity: 3 },
    ],
    extras: [
      { name: 'Guiness 30cl', quantity: 4 },
      { name: 'Cranberry juice', quantity: 2 },
      { name: 'Water 50cl', quantity: 3 },
    ],
  },
];

const Orders = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const { logout, loading } = useAuth();

  const [expandedIds, setExpandedIds] = useState([]);

  const toggle = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const [expandedIds2, setExpandedIds2] = useState([]);

  const toggle2 = (id) => {
    setExpandedIds2((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Orders"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      {(orders.length === 0 || orders2.length === 0) && (
        <EmptyState text="Orders Empty" />
      )}
      {(orders.length > 0 || orders2.length > 0) && (
        <>
          <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontWeight: 600, fontSize: 18 }}>Active Orders</Text>
            <View style={{ paddingVertical: 20 }}>
              {orders.map((order) => (
                // <TouchableOpacity onPress={()=>{router.push(`/dashboard/orders/${order.id}`)}} key={order.id}>
                <Accordion
                  onPress={() => {
                    router.push(`/dashboard/orders/${order.id}`);
                  }}
                  key={order.id}
                  item={order}
                  isExpanded={expandedIds.includes(order.id)}
                  onToggle={() => toggle(order.id)}
                />
                // </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontWeight: 600, fontSize: 18 }}>Past Orders</Text>
            <View style={{ paddingVertical: 20 }}>
              {orders2.map((order) => (
                <Accordion
                  onPress={() => {
                    router.push(`/dashboard/orders/${order.id}`);
                  }}
                  key={order.id}
                  item={order}
                  isExpanded={expandedIds2.includes(order.id)}
                  onToggle={() => toggle2(order.id)}
                />
              ))}
            </View>
          </ScrollView>
          <FAB
            icon="cart"
            color="white"
            label="Order Now"
            style={{
              position: 'absolute',
              margin: 16,
              fontWeight: 600,
              right: 10,
              bottom: 10,
              backgroundColor: Colors.green,
            }}
            onPress={() => router.push('/search')}
          />
        </>
      )}
    </View>
  );
};

export default Orders;

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
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
