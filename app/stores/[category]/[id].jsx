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
import { Button, FAB } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import RipplePressable from '@/components/RipplePressable';
import { useCart } from '@/contexts/cartContext'; // Context we created
import { useToast } from '@/hooks/useToast';

const { height, width } = Dimensions.get('window')

export default function StoreDetails() {
  const router = useRouter();
  const {category, id}= useLocalSearchParams();
  const { show, Toast } = useToast();

  if(!id){
   router.back()
  }
  const { cartItems,cartCount, updateQuantity,addToCart, removeItem, clearCart, totalPrice } = useCart();

  const fnChoice = useCallback(() => {
      return (category === 'restaurants' ||category === 'grocery-stores')?fetchStoreByID:fetchFoodByID
    }, [category]);
    
    const fetchFn = useCallback(() => fnChoice()({ id }), [fnChoice, id]);
    
  const {data: details = {},loading,refetch: loadDetails} = useFetch(() => fetchFn({id}), false);
  
  const inCart = cartItems.length > 0 ? cartItems.some((item) => item.id === details._id):false

  const handleAddToCart = (name) => {
    // console.log('name',name)
    if (inCart) {
      show(`${name} is already in your cart 🛒`,'error')
      return
    };

    addToCart(details,);
    show(`${name} added to cart 🛒`,);
  };


  useEffect(() => {
    loadDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleX = () => {
      router.dismiss()
    }

    // console.log(details?.items?.list[0])
  return (
    <>
    <StatusBar hidden />
    <ScrollView style={styles.container}>             
      {loading&&<View style={{height:'100%'}}>
      <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{marginVertical:'auto'}}/>
      </View>}
      <View style={{ height: height * 0.3 }}>
        <TouchableOpacity style={styles.backBtn} onPress={handleX}>
          <Ionicons style={{textAlign:'center', fontWeight:'700'}} name="close" size={19} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn2} onPress={()=>{}}>
          <Ionicons style={{textAlign:'center', fontWeight:'700'}} name="heart-outline" size={19} color="black" />
        </TouchableOpacity>
        <ShimmerExpoImage
          uri={details?.store?.image||details?.image}
          width={width}
          height={height * 0.3}
          accessibilityLabel={details.itemName}
        />
      </View>
      <View style={styles.scrollList}>
        <View style={styles.sectCont}>
          <Text style={{ fontWeight: '600', marginTop: 8, fontSize: 18 }}>
            {details?.store?.businessName|| details?.itemName}
          </Text>
          <Text numberOfLines={5} style={{ marginVertical: 8, color: '#687076', lineHeight: 24 }}>
            {details?.store?.businessDescription||details?.description}
          </Text>
        </View>
      { (category === 'food' ||category === 'groceries')&&
      // <RipplePressable onPress={()=> router.push(`stores/${details?.categoryId?.name==='groceries'?'grocery-store':'restaurants'}/${details?.vendorId._id}`)}>
        <RipplePressable style={{paddingHorizontal:18,gap:8, paddingVertical:6, flexDirection:'row', marginBottom:32, }} onPress={()=> router.push(`stores/${details?.categoryId?.name==='groceries'?'grocery-stores':'restaurants'}/${details?.vendorId?._id}`)}>
          <ShimmerExpoImage uri={details.vendorId?.image} width={40} height={40} accessibilityLabel={details?.itemName} styles={{borderRadius:20}} />
          <Text style={{alignSelf:'center', marginLeft:8, fontWeight:'600',fontSize:16}}>{details?.vendorId?.businessName}</Text>
          <MaterialIcons style={{alignSelf:'center'}} name="arrow-outward" size={24} color={Colors.green}/>
        </RipplePressable>
        }
        <View style={{ flexDirection:'row', marginBottom:18, justifyContent:'space-around',paddingHorizontal:18 }}>
          <View style={{ paddingRight:18, gap:8, justifyContent:'center',alignItems:'center',}}>
            <MaterialCommunityIcons style={{borderRadius:12}} name="clock" size={20} color={Colors.green} />
            <Text style={{fontSize:14, fontWeight:'500'}}>25min</Text>
            <Text style={{fontSize:14, color:'#687076', fontWeight:'600'}}>Delivery</Text>
          </View>
          <View style={{borderRightWidth:1, borderColor:'#EEE4E4'}}></View>
          <View style={{ paddingRight:18, gap:8, justifyContent:'center',alignItems:'center',}}>
            <Ionicons name="location-sharp" size={22} style={{borderRadius:12}} color={Colors.green}/>
            <Text numberOfLines={1} style={{fontSize:14, fontWeight:'500', maxWidth:150, }}>{details?.store?.businessAddress||details?.vendorId?.businessAddress}</Text>
            <Text style={{fontSize:14, color:'#687076', fontWeight:'600'}}>Location</Text>
          </View>
          <View style={{borderRightWidth:1, borderColor:'#EEE4E4'}}></View>
          <View style={{ paddingRight:18, gap:8, justifyContent:'center',alignItems:'center',}}>
            <Fontisto name="star" size={20}style={{borderRadius:12}} color='#ffc859'/>
            <Text style={{fontSize:14, fontWeight:'500'}}>4.5</Text>
            <Text style={{fontSize:14, color:'#687076', fontWeight:'600'}}>Rating</Text>
          </View>
        </View>
        <Button style={{marginHorizontal:'auto', backgroundColor:'#f6f6f6',marginVertical:12}}  textColor={'black'} mode="contained" onPress={() => console.log('Pressed')}>Add Review</Button>
        {/* auth?add extras:store items */}
        <View style={{padding:12, marginBottom:10, marginTop:20}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginRight:12}}>
            <Text style={{fontSize:20, fontWeight:'500',}}>Items</Text>
            <Link href='/search' asChild>
              <TouchableOpacity style={{flexDirection:'row',gap:4, alignItems:'center'}}>
                <FontAwesome name="search" size={16} color="black" />
                <Text style={{ fontSize:16, fontWeight:'600'}}>Search {details?.items?.list[0]?.categoryId?.name||'Foods'}</Text>
            </TouchableOpacity>
            </Link>            
          </View>

          <View style={{padding:12}}>
            <ScrollView>
            {(details?.items?.list?.length>0)&&
            details?.items?.list?.slice(0,9).map(item=>(
              <RipplePressable onPress={()=>router.push(`stores/${details?.categoryId?.name||details?.items?.list[0]?.categoryId?.name.toLowerCase()}/${item._id}`)} style={styles.item} key={item._id.toString()}>
                <ShimmerExpoImage uri={item.image} width={40} height={40} accessibilityLabel={item.itemName} styles={{borderRadius:18}} />
                  <Text style={styles.title}>{item.itemName}</Text>
                  <Text style={{}}>X</Text>
                  <Text style={{fontSize:18}}>0</Text>
                  {/* <TouchableOpacity onPress={()=>console.log('-')}> */}
                    <FontAwesome style={{alignSelf:'center'}} name="minus-square-o" size={24} color={Colors.green} />
                  {/* </TouchableOpacity> */}
                  {/* <TouchableOpacity onPress={(e)=>console.log('+')}> */}
                    <FontAwesome name="plus-square-o" size={24} color={Colors.green} />
                  {/* </TouchableOpacity> */}
                </RipplePressable>
            ))}
            </ScrollView>
          </View>
        </View>
          {details?.itemName&&<RipplePressable
            style={styles.button}
            onPress={()=>handleAddToCart(details.itemName)}
            // disabled={isSubmitting}
          rippleColor='rgba(255,255,255,0.6)'
          >
            <Text style={styles.buttonText}>
              Add To Cart
            </Text>
          </RipplePressable>}
      </View>
    </ScrollView>
    {cartCount>0&&<FAB
        icon="cart" color='white' label='Goto Cart'
        style={{position: 'absolute',margin: 16,right: 10,bottom: 40,backgroundColor:Colors.green}}
        onPress={() => router.push('/myCart')}
      /> }
    <Toast />
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
    zIndex: 10,
    paddingBottom:40
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
  },
  backBtn: {
    position: 'absolute',
    top: 46,
    left: 24,
    zIndex: 10,
    padding:7,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // shadow for Android
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  backBtn2: {
    position: 'absolute',
    top: 46,
    right: 24,
    zIndex: 10,
    padding:7,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // shadow for Android
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  button:{
    backgroundColor:Colors.primary,
    justifyContent:'center',
    alignItems:'center',
    padding:14,
    marginHorizontal:26,
    borderRadius:14
  },
  buttonText:{
    color:'white',
    fontSize:16,
    fontWeight:'600'
  }
});



