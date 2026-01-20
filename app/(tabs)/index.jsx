import { View, Text, StyleSheet, Image, FlatList, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { Avatar, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Colors } from '@/constants/colors';
import featured from '@/assets/images/featured.png'

const categories = ['all', 'restaurant', 'groceries', 'food', 'extras']
const getTimeOfDay = () => {
  const hour = new Date().getHours(); // 0 - 23

  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const Home = () => {
  const timeOfDay = getTimeOfDay();

  const renderFeaturedItems = ({ item }) => (
    <Image source={featured} style={{width:260, height:160, borderRadius:12, marginBottom:8}} />
  );

  const renderPopularDishes = ({ item }) => (
    <View style={{ flexDirection:'column', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius:12, backgroundColor:'#F5F5F5', overflow:'hidden', width:220,}}>
      <Image style={{width: 220, height: 140, borderTopLeftRadius:12, borderTopRightRadius:12}} 
      source={{ uri: 'https://picsum.photos/600' }} />
      <View style={{borderWidth:1, borderColor:'#E0E0E0', paddingHorizontal:12, paddingVertical:18, paddingBottom:8, gap:4,}}>
        <Text style={{fontSize:14, fontWeight:700}}>Jollof Rice with Assorted Meat and Fish </Text>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:8}}>
          <Text style={{ alignSelf:'flex-end', paddingBottom:4}}>From £200</Text>
          <View style={{backgroundColor:Colors.primary, padding:2, borderRadius:8}}>
            <MaterialCommunityIcons style={{borderRadius:12}} name="arrow-right" size={24} color="white" />
          </View>
        </View>     
      </View>
    </View>  
  );
  const renderPopularRestaurants = ({ item }) => (
    <View style={{ flexDirection:'column', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius:12, backgroundColor:'#F5F5F5', overflow:'hidden', width:220,}}>
      <Image style={{width: 220, height: 140, borderTopLeftRadius:12, borderTopRightRadius:12}} 
      source={{ uri: 'https://picsum.photos/500' }} />
      <View style={{borderWidth:1, borderColor:'#E0E0E0', paddingHorizontal:12, paddingVertical:18, paddingBottom:8, gap:4,}}>
        <Text style={{fontSize:14, fontWeight:700}}>Open Sea Restaurant </Text>
        <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
          <Ionicons name="location-sharp" size={16} color={Colors.green.green900} />
          <Text style={{fontSize:12, color:'#687076'}}>Buckingham  LN</Text>
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-between', marginVertical:8}}>
          <Text style={{ alignSelf:'flex-end', paddingBottom:4}}>⭐ 4.5 (97)</Text>
          <View style={{backgroundColor:Colors.primary, padding:2, borderRadius:8}}>
            <MaterialCommunityIcons style={{borderRadius:12}} name="arrow-right" size={24} color="white" />
          </View>
        </View>     
      </View>
    </View>  
  );

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
                    <FontAwesome name="circle" size={10} color={Colors.red} />
                  </View>
                </View>
              </Link>
              <AntDesign name="menu" size={24} color="black" />
          </View>
        </View>
        {/* Featured section */}
        <View style={styles.featuredCont}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
            <Text style={{fontWeight:700, fontSize:16}}>Featured</Text>
            <Text style={{ fontSize:14,color:Colors.green.green900, fontWeight:600}}>See All</Text>
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
          <Text style={{fontWeight:700, fontSize:16}}>Category</Text>
          <ScrollView
              horizontal={true} 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{marginTop:10, flexDirection:'row', alignItems:'center'}}
            >
              {categories.map((category, index) => (
                <Button 
                  key={index}
                  style={{borderColor: Colors.primary, marginRight: 10}}
                  mode={index===0?"contained": "outlined"}
                  textColor={index===0?'white':Colors.primary}
                  buttonColor={index===0?Colors.primary:null}
                  background={Colors.primary}
                  labelStyle={{fontWeight:'600', textTransform:'capitalize'}}
                  rippleColor="rgba(255, 255, 255, 0.32)"
                  onPress={() => console.log('Pressed')}>
                    {category}
                  </Button>
                ))}
            </ScrollView>
        </View> 
        {/* Popular Dishes section */}
        <View style={styles.popularCont}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
            <Text style={{fontWeight:700, fontSize:16}}>Popular Dishes</Text>
            <Text style={{ fontSize:14,color:Colors.green.green900, fontWeight:600}}>See All</Text>
          </View>
          <FlatList
              horizontal={true}
              data={[1,2,3,4]}
              renderItem={renderPopularDishes}
              keyExtractor={(item)=>item.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap:12, paddingVertical:10}}
            />
        </View>   
        {/* Popular Restaurants section */}
        <View style={styles.popularCont}>
          <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
            <Text style={{fontWeight:700, fontSize:16}}>Popular Restaurants</Text>
            <Text style={{ fontSize:14,color:Colors.green.green900, fontWeight:600}}>See All</Text>
          </View>
          <FlatList
              horizontal={true}
              data={[1,2,3,4]}
              renderItem={renderPopularRestaurants}
              keyExtractor={(item)=>item.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap:12, paddingVertical:10}}
            />
        </View>  
      </ScrollView>
    </SafeAreaView>

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
});
