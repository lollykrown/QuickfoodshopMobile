import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Image } from 'expo-image';
import { ActivityIndicator, Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Colors } from '@/constants/colors';
import featured from '@/assets/images/featured.webp'
import useFetch from "@/hooks/usefetch";
import { fetchPopularStores, fetchPopularDishes } from "@/services/api";
import { useEffect, useState } from 'react';
import { ItemCard } from '@/components/ItemCard';
import { useDrawer } from '@/contexts/DrawerProvider';
import {useAuth } from '../../contexts/authContext'

const stores = [
  {
    location: {
      latitude: 54.9042429,
      longitude: -1.3772213,
    },
    _id: '688d06de0c5e3c22ae8a05ee',
    firstName: 'Rasheed',
    lastName: 'Tosho',
    phoneNumber: '07454822494',
    email: 'azeez.omolara@yahoo.com',
    businessName: "Lara's Kitchen ltd",
    businessDescription: 'Food , Spot & Bar ',
    businessAddress: '11 Tavistock Pl, Hendon, Sunderland SR1 1PB, UK',
    estimatedDeliveryTime: '20',
    image:
      'https://quickfoods.lon1.digitaloceanspaces.com/quickfoods/a368c6d2-49f3-404d-ac62-2be9745a713d_1758035949445_image_picker_2F92A1BC-CF72-4BF4-9B3F-ED8A683AB982-6832-000000E98754DAA5.jpg',
    rating: {
      status: true,
      message: 'Average rating fetched successfully',
      averageRating: 0,
    },
  },
  {
    location: {
      latitude: 54.9089518,
      longitude: -1.4142755,
    },
    _id: '68bc35eea6290658782dbabe',
    firstName: 'Abayomi',
    lastName: 'Alabi',
    phoneNumber: '07424796437',
    email: 'ariyopluslimited@gmail.com',
    businessName: 'AriyoPlus limited ',
    businessDescription:
      'Call for your African- carribean food items...No.7 Saint Lukes Terrace, Sunderland, SR4 6NQ. 🙂😍',
    businessAddress: '7 St. Lukes Terrace, Sunderland SR4 6NQ, UK',
    estimatedDeliveryTime: '20',
    image:
      'https://quickfoods.lon1.digitaloceanspaces.com/quickfoods/2e135eec-5d95-48fd-bcbb-243b8290be27_1757165037566_IMG-20240205-WA0030.jpg',
    rating: {
      status: true,
      message: 'Average rating fetched successfully',
      averageRating: 0,
    },
  },
];
      
const categories = ['all', 'restaurants','grocery stores', 'groceries', 'food', 'extras']
const getTimeOfDay = () => {
  const hour = new Date().getHours(); // 0 - 23

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};
const Home = () => {
  const timeOfDay = getTimeOfDay();
  const router = useRouter();
  const drawer = useDrawer(); 

  const {data: popStores = [],loading:popLoad,error:popError,refetch: loadPopStores,} = useFetch(() => fetchPopularStores(), false);
  useEffect(() => {
    loadPopStores();
    drawer.close()
  }, []);
  const {data: popDishes = [],loading:popDLoad,error:popDError,refetch: loadpopDishes,} = useFetch(() => fetchPopularDishes(), false);
  useEffect(() => {
    loadpopDishes();
  }, []);

  const renderFeaturedItems = ({ item }) => (
    <Image source={featured} style={{width:260, height:160, borderRadius:12, marginBottom:8}} />
  );

  
  // const { user, logout, biometricLogin } = useAuth();
  // useEffect(() => {
  //   // Try biometric login on app start
  //   biometricLogin();
  // }, []);



  return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header section */}
          <View style={styles.headerCont}>
            <View style={{flexDirection:'row', alignItems:'center', gap:16}}>
              <Avatar.Image size={48} source={require('@/assets/images/avatar.png')} />
              <View>
                <Text style={{fontSize:12}}>Good {timeOfDay} 👋</Text>
                <Text style={{fontWeight:700, fontSize:18}}>Kayode Agboola</Text>
              </View>
            </View>
            <View style={{flexDirection:'row', alignItems:'center', gap:16}}>
                <Link href='/notifications' >
                  <View style={{position:'relative'}}>
                    <Ionicons name="notifications" size={24} color={Colors.primary} />
                    <View style={{position:'absolute', top:0, right:0, padding:1.5, backgroundColor:'white', borderRadius:12}}>
                      <View name="circle" style={{width:12,overflow:'hidden',flexDirection:'col',justifyContent:'center',alignItems:'center', borderRadius:12,height:12,backgroundColor:Colors.red}}>
                        <Text style={{color:'white', fontSize:8,fontWeight:600 }}>3</Text>
                      </View>
                    </View>
                  </View>
                </Link>
                <Pressable onPress={drawer.toggle}>
                  <AntDesign name="menu" size={24} color="black" />
                </Pressable>
            </View>
          </View>

          {/* Notification test */}
          {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>Your Expo Push Token:</Text>
              <Text>{expoPushToken}</Text>
        
              <Button
                title="Send Test Local Notification"
                onPress={async () => {
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'Hello! 👋',
                      body: 'This is a test notification',
                    },
                    trigger: { seconds: 5 },
                  });
                }}
              />
          </View> */}


          {/* Featured section */}
          <View style={styles.featuredCont}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <Text style={{fontWeight:700, fontSize:16}}>Featured</Text>
              <Text style={{ fontSize:14,color:Colors.green, fontWeight:600}}>See All</Text>
            </View>
            <FlatList
                horizontal={true}
                data={[1,2,3,4]}
                renderItem={renderFeaturedItems}
                keyExtractor={(item)=>item.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap:12}}
              />
          </View>
          {/* Category Section */}
          <View style={styles.categoryCont}>
            <Text style={{fontWeight:700, fontSize:16}}>Categories</Text>
            <ScrollView
                horizontal={true} 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{marginTop:10, flexDirection:'row', alignItems:'center'}}
              >
                {categories.map((cat, index) => (
                  <Button 
                    key={index}
                    style={{borderColor: Colors.primary, marginRight: 10}}
                    mode={index===0?"contained": "outlined"}
                    textColor={index===0?'white':Colors.primary}
                    buttonColor={index===0?Colors.primary:null}
                    background={Colors.primary}
                    labelStyle={{fontWeight:'600', textTransform:'capitalize'}}
                    rippleColor="rgba(255, 255, 255, 0.32)"
                    onPress={() => cat==='all'?router.push('/stores'):router.push(`/stores/${cat.replace(/ /g, "-")}`)}>
                      {cat}
                    </Button>
                  ))}
              </ScrollView>
          </View> 
          {/* Popular Dishes section */}
          <View style={styles.popularCont}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <Text style={{fontWeight:700, fontSize:16}}>Popular Dishes</Text>
              <Link href='/stores/food' asChild>
                <TouchableOpacity>
                  <Text style={{ fontSize:14,color:Colors.green, fontWeight:600}}>See All</Text>
              </TouchableOpacity>
              </Link>
            </View>
            <FlatList
                horizontal={true}
                data={popDishes}
                renderItem = {({item}) => <ItemCard data={item} storeType={item?.categoryId?.name?.toLowerCase()||'groceries'}/>}
                keyExtractor={(item)=>item._id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap:12, paddingVertical:10}}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                ListHeaderComponent={
                <View style={{paddingVertical:30}}>
                    {popDLoad && (
                      <ActivityIndicator
                        size="large"
                        color={Colors.primary}
                        style={{marginVertical:10, marginStart:60}}
                      />
                    )}
                    {popDError && (
                      <Text style={{textAlign:'center',fontWeight:500,color:'red',paddingHorizontal:10}}>
                        Error: {popDError.message}
                      </Text>
                    )}
                  </View>
                }
              />
          </View>   
          {/* Popular Restaurants section */}
          <View style={styles.popularCont}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <Text style={{fontWeight:700, fontSize:16}}>Popular Stores</Text>
                  <Link href='/stores' asChild>
                    <TouchableOpacity >
              <Text style={{ fontSize:14,color:Colors.green, fontWeight:600}}>See All</Text>
              </TouchableOpacity>
              </Link>
            </View>
            <FlatList
                horizontal={true}
                data={stores}
                renderItem = {({item}) => <ItemCard data={item} storeType={'restaurants'}/>}
                keyExtractor={(item)=>item._id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap:12, paddingVertical:10}}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                ListHeaderComponent={
                  <View style={{paddingVertical:30}}>
                    {popLoad && (
                      <ActivityIndicator
                        size="large"
                        color={Colors.primary}
                        style={{marginVertical:10, marginStart:60}}
                      />
                    )}
                    {popError && (
                      <Text style={{textAlign:'center',fontWeight:500,color:'red',paddingHorizontal:10}}>
                        Error: {popError.message}
                      </Text>
                    )}
                  </View>
                }
              />
          </View>  
        </ScrollView>
      </SafeAreaView>
    // </AnimatedDrawer>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  headerCont:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E2E2',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  featuredCont:{
    marginTop: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1, 
    paddingBottom: 18,
    borderBottomColor: '#E2E2E2',
  },
  categoryCont:{
    marginTop: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1, 
    paddingBottom: 14,
    borderBottomColor: '#E2E2E2',
  },
  popularCont:{
    marginVertical: 20,
    paddingHorizontal: 20,
  },
    overlayStyle:{
    position: 'absolute', top: 0, left: 260, bottom: 0, right: 0 }
  // side === 'left'
  //   ? { position: 'absolute', top: 0, left: DRAWER_WIDTH, bottom: 0, right: 0 }
  //   : { position: 'absolute', top: 0, left: 0, bottom: 0, right: DRAWER_WIDTH }

});

