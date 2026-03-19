import RipplePressable from '@/components/RipplePressable';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useAuth } from '@/contexts/authContext';
import { useCart } from '@/contexts/cartContext';
import { priceFormat } from '@/utils/misc';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import Svg, { Line } from 'react-native-svg';

const MyCart = () => {
  const router = useRouter();
  const drawer = useDrawer();
  const { cartItems, updateQuantity, removeItem, deliveryAddress, clearCart,removeAddress, totalPrice } =
    useCart();
  const { avatar } = useAuth();

  const deliveryFee = deliveryAddress?.distance ? (deliveryAddress?.distance/1000) * 1.2: 2;
    // console.log('routeInfo',cartItems)

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="My Cart"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>
      {cartItems.length === 0 && (
        <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 28 }}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <MaterialCommunityIcons
              name="cart-off"
              size={120}
              color="#C4C4C4"
            />
            <Text
              style={{
                fontSize: 26,
                color: '#C4C4C4',
                marginTop: 24,
                fontWeight: '700',
              }}
            >
              Cart is Empty
            </Text>
          </View>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.buttonText}>Browse Items</Text>
          </Pressable>
        </View>
      )}
      {cartItems.length > 0 && (
        <ScrollView style={{ padding: 20 }}>
          {cartItems.map((item) => (
            <RipplePressable
              onPress={() =>
                router.push(`/stores/${item?.category?item.category.toLowerCase():'food'}/${item.id}`)
              }
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 18,
                paddingHorizontal: 20,
                paddingVertical: 12,
                gap: 12,
                marginVertical: 4,
              }}
            >
              <ShimmerExpoImage
                width={60}
                height={60}
                styles={{ borderRadius: 30 }}
                uri={item?.image || avatar}
              />
              <View style={{ gap: 6 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: '600', maxWidth: 215 }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
                <Text
                  style={{ color: Colors.grey, maxWidth: 215 }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
                <View
                  style={{
                    marginTop: 4,
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: Colors.green,
                    }}
                  >
                    {priceFormat(item.price)}
                  </Text>
                  <TouchableOpacity
                    style={{ marginLeft: 8 }}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <AntDesign
                      name="minus-square"
                      size={24}
                      color={Colors.green}
                    />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontWeight: '600' }}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    style={{}}
                    onPress={() => updateQuantity(item.id, +1)}
                  >
                    <AntDesign
                      name="plus-square"
                      size={24}
                      color={Colors.green}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={{ marginLeft: 'auto' }}
                onPress={() => {
                  cartItems.length === 1 && removeAddress()
                  removeItem(item.id)}}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </RipplePressable>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <RipplePressable 
            style={{
              backgroundColor: Colors.lightGrey,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 6,
            }}
            onPress={() => router.push('/myCart/delivery')}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  textDecorationLine: 'underline',
                }}
              >
                Change Delivery Address
              </Text>
            </RipplePressable>
            <RipplePressable
              style={{
                backgroundColor: Colors.red,  
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 20,
              }}
              onPress={()=> { removeAddress(); clearCart(); }}
              rippleColor="rgba(255,255,255,0.6)"
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#fff',
                }}
              >
                Clear Cart
              </Text>
            </RipplePressable>
          </View>
          {deliveryAddress?.address && (
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.border,
              borderRadius: 18,
              paddingHorizontal: 20,
              paddingVertical: 12,
              gap: 20,
              marginVertical: 8,
            }}
          >
            <Text
              style={{
                color: Colors.grey,
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 12,
              }}
            >
              Payment Summary
            </Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '400' }}>Subtotal</Text>
              <Text style={{ fontSize: 16, fontWeight: '400' }}>
                {priceFormat(totalPrice)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '400' }}>Est. Tax</Text>
              <Text style={{ fontSize: 16, fontWeight: '400' }}>
                {priceFormat(totalPrice * 0.04)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '400' }}>Service Fee</Text>
              <Text style={{ fontSize: 16, fontWeight: '400' }}>
                {priceFormat(totalPrice * 0.05)}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Delivery</Text>
              <Text style={{ fontSize: 16, fontWeight: '500' }}>
                {priceFormat(deliveryFee)}
              </Text>
            </View>
            <Svg width="100%" height="2">
              <Line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke={Colors.grey}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            </Svg>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700' }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: '700' }}>
                {priceFormat(totalPrice+ (totalPrice * 0.04) + (totalPrice * 0.05) + deliveryFee)}
              </Text>
            </View>
          </View>)}
          <RipplePressable
            style={styles.button}
            onPress={() => router.push(deliveryAddress?.address?'/payment':'/myCart/delivery')}
            // disabled={isSubmitting}
            rippleColor="rgba(255,255,255,0.6)"
          >
            <Text style={styles.buttonText}>{deliveryAddress?.address?'Pay':'Proceed'}</Text>
          </RipplePressable>
        </ScrollView>
      )}
    </View>
  );
};

export default MyCart;

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
    marginTop: 28,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
