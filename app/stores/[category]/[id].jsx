import { View, Text, Dimensions, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, useRouter , usePathname, Link} from "expo-router";
import { fetchStoreByID, fetchFoodByID } from "@/services/api";
import { useCallback, useEffect, useState } from 'react';
import useFetch from '@/hooks/usefetch';
import ShimmerExpoImage from '@/components/ShimmerImg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Button, Snackbar } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCart } from '@/contexts/cartContext'; // Context we created

const { height } = Dimensions.get('window')

export default function StoreDetails() {
  const router = useRouter();
  const {category, id}= useLocalSearchParams();

  if(!id){
   router.back()
  }
  const { cartItems, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const fnChoice = useCallback(() => {
      return (category === 'restaurants' ||category === 'grocery-stores')?fetchStoreByID:fetchFoodByID
    }, [category]);
    
    const fetchFn = useCallback(() => fnChoice()({ id }), [fnChoice, id]);
    
  const {data: details = {},loading,refetch: loadDetails} = useFetch(() => fetchFn({id}), false);
  useEffect(() => {
    loadDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

console.log(details)
  return (
    <>
    <ScrollView style={styles.container}>             
    {loading&&<View style={{height:'100%'}}>
      <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{marginVertical:'auto'}}/>
          </View>}
      <View style={{ height: height * 0.3 }}>
        <ShimmerExpoImage
          uri={details?.store?.image}
          width={'100%'}
          height={height * 0.3}
          accessibilityLabel={details.itemName}
        />
      </View>
      <View style={styles.scrollList}>
        <View style={styles.sectCont}>
          <Text style={{ fontWeight: '600', marginTop: 8, fontSize: 18 }}>
            {details?.store?.businessName}
          </Text>
          <Text numberOfLines={5} style={{ marginVertical: 8, color: '#687076', lineHeight: 24 }}>
            {details?.store?.businessDescription}
          </Text>
        </View>
        <View style={{ flexDirection:'row', marginBottom:18, justifyContent:'space-around',paddingHorizontal:18 }}>
          <View style={{ paddingRight:18, gap:8, justifyContent:'center',alignItems:'center',}}>
            <MaterialCommunityIcons style={{borderRadius:12}} name="clock" size={20} color={Colors.green} />
            <Text style={{fontSize:14, fontWeight:500}}>25min</Text>
            <Text style={{fontSize:14, color:'#687076', fontWeight:'600'}}>Delivery</Text>
          </View>
          <View style={{borderRightWidth:1, borderColor:'#EEE4E4'}}></View>
          <View style={{ paddingRight:18, gap:8, justifyContent:'center',alignItems:'center',}}>
            <Ionicons name="location-sharp" size={22} style={{borderRadius:12}} color={Colors.green}/>
            <Text numberOfLines={1} style={{fontSize:14, fontWeight:500, maxWidth:150, }}>{details?.store?.businessAddress}</Text>
            <Text style={{fontSize:14, color:'#687076', fontWeight:'600'}}>Location</Text>
          </View>
          <View style={{borderRightWidth:1, borderColor:'#EEE4E4'}}></View>
          <View style={{ paddingRight:18, gap:8, justifyContent:'center',alignItems:'center',}}>
            <Fontisto name="star" size={20}style={{borderRadius:12}} color='#ffc859'/>
            <Text style={{fontSize:14, fontWeight:500}}>4.5</Text>
            <Text style={{fontSize:14, color:'#687076', fontWeight:'600'}}>Rating</Text>
          </View>
        </View>
        <Button style={{marginHorizontal:'auto', backgroundColor:'#f6f6f6',marginVertical:12}}  textColor={'black'} mode="contained" onPress={() => console.log('Pressed')}>Add Review</Button>
        {/* auth?add extras:store items */}
        <View style={{padding:12, marginBottom:10, marginTop:20}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:12}}>
            <Text style={{fontSize:20, fontWeight:500,}}>Items</Text>
            <Link href='/search' asChild>
              <TouchableOpacity style={{flexDirection:'row',gap:4, alignItems:'center'}}>
                <FontAwesome name="search" size={16} color="black" />
                <Text style={{ fontSize:16, fontWeight:600}}>Search Foods</Text>
            </TouchableOpacity>
            </Link>            
          </View>

          <View style={{padding:12}}>
            <ScrollView>
            {(details?.items?.list.length>0)&&
            details?.items?.list.slice(0,9).map(item=>(
              <View style={styles.item} key={item._id.toString()}>
                <ShimmerExpoImage uri={item.image} width={40} height={40} accessibilityLabel={item.itemName} styles={{borderRadius:18}} />
                
                  <Text style={styles.title}>{item.itemName}</Text>
                  <Text style={{}}>X</Text>
                  <Text style={{fontSize:18}}>0</Text>
                  <FontAwesome name="minus-square-o" size={24} color={Colors.green} />
                  <FontAwesome name="plus-square-o" size={24} color={Colors.green} />
                </View>
            ))}
            </ScrollView>
          </View>
        </View>
        <Button style={{ backgroundColor:Colors.primary, borderRadius:12, marginHorizontal:12}}  textColor={'white'} mode="contained" onPress={() => console.log('Pressed')}>Add To Cart</Button>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },

  scrollList: {
    width: '100%',
    marginTop: -20,       
    zIndex: 10,
  },

  sectCont: {
    backgroundColor: '#fcfcfc',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
  },
  item: {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical:12,
    borderWidth:1,
    borderColor:'#f6f6f6',
    borderRadius:8,
    marginVertical:6,
    gap:8
  },
  header: {
    fontSize: 16,
    fontWeight:'600'
  },
  title: {
    fontSize: 14,
    maxWidth:100,
    width:100
  }
});

