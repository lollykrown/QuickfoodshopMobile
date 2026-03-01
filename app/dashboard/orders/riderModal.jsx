import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import ShimmerExpoImage from '@/components/ShimmerImg'
import { useAuth } from '@/contexts/authContext';
import { Colors } from '@/constants/colors';
import { useRouter } from 'expo-router';
import HorizontalLine from '@/components/Horizontal Lines';

const OrderModal = () => {
      const { avatar, user } = useAuth();
      const router = useRouter();
  
  return (
    <View style={{padding:18, backgroundColor:'white'}}>
      <Text style={{textAlign:'center',marginVertical:24,fontWeight:600, fontSize:16}}>Assign rider to customer?</Text>
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
        <View style={{alignItems:'center'}}>
          <ShimmerExpoImage
              width={80}
              height={80}
              styles={{ borderRadius: 50 }}
              uri={user?.image || avatar}
              />
          <Text style={{marginTop:8}}>Jonathan Mike</Text>
          <Text style={{color:Colors.grey}}>Dispatch rider</Text>
        </View>
        <View style={{ flex: 1, alignSelf:'center', marginBottom:36 }}>
          <HorizontalLine />
        </View>
        <ShimmerExpoImage
            width={74}
            height={74}
            styles={{ borderRadius: 24, backgroundColor:'white' }}
            uri={require('../../../assets/images/logo-d.png')}
            />
        <View style={{ flex: 1, alignSelf:'center', marginBottom:36 }}>
          <HorizontalLine />
        </View>
        <View style={{alignItems:'center'}}>
          <ShimmerExpoImage
              width={80}
              height={80}
              styles={{ borderRadius: 50 }}
              uri={user?.image || avatar}
              />
          <Text style={{marginTop:8}}>Tobi Makinde</Text>
          <Text style={{color:Colors.grey}}>Customer rider</Text>
        </View>
      </View>
        <Pressable
          style={styles.button}
          onPress={()=>router.replace('/dashboard/orders/confirmation')}
          >
          <Text style={styles.buttonText}>
            Confirm
          </Text>
        </Pressable>
    </View>
  )
}

export default OrderModal

const styles = StyleSheet.create({
    container:{padding:18, backgroundColor:'white',},
    button: {
      backgroundColor: Colors.primary,
      padding: 18,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 36,
      marginBottom:60
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      textTransform:'uppercase'
    },
  })