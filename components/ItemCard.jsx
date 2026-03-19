import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from 'react-native'
import ShimmerExpoImage from '@/components/ShimmerImg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Colors } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from "expo-router";
import { Card, } from 'react-native-paper';
import { priceFormat } from '@/utils/misc';

const { width } = Dimensions.get('window')

  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
  });
  

export const ItemCard = ({data, storeType}) => {
  // console.log('jkljk',storeType)
  const isStore= data?.businessName ?true:false
  const url= storeType?`/stores/${storeType}/${data._id}`:`/stores/${data._id}`
  return (
    <Link href={url} asChild>
      <TouchableOpacity>
        <View style={{ flexDirection:'column', borderRadius:12, backgroundColor:'#F5F5F5', overflow:'hidden', width:width*0.44,   shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,}}>
          <ShimmerExpoImage uri={data.image} width={220} height={140} accessibilityLabel={data.itemName} styles={{borderTopLeftRadius:12, borderTopRightRadius:12}} />
          <View style={{borderWidth:1, borderColor:'#E0E0E0', paddingHorizontal:12, paddingVertical:18, paddingBottom:8, gap:4,}}>
            <Text numberOfLines={2} style={{fontSize:14, fontWeight:'700'}}>{data.itemName||data.businessName||data.vendorId.businessName}</Text>
            {data?.vendorId?.businessName&&<Text numberOfLines={2} style={{fontSize:14, color:'#687076'}}>{data?.vendor?.businessName||data?.vendorId?.businessName}</Text>}
            {data?.businessAddress&&<View style={{flexDirection:'row', alignItems:'center', gap:4,  }}>
              <Ionicons name="location-sharp" size={16} color={Colors.green} />
              <Text numberOfLines={1} style={{fontSize:12,color:'#687076', marginRight:18}}>{data.businessAddress}</Text>
            </View>}
            {((data?.estimatedDeliveryTime||data?.vendor?.estimatedDeliveryTime)&&!isStore)&&(<View style={{flexDirection:'row', marginRight:18, marginVertical:8}}>
                <MaterialCommunityIcons style={{borderRadius:12}} name="clock" size={20} color={Colors.green} />
                  <Text style={{fontSize:14,alignSelf:'center',color:Colors.green, fontWeight:'500'}}>{data?.vendor?.estimatedDeliveryTime||data?.estimatedDeliveryTime} minutes</Text>
              </View>)}
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
              {isStore?(<Text style={{ alignSelf:'flex-end', paddingBottom:4}}>⭐ 4.5 (97)</Text>):
              <Text style={{ alignSelf:'flex-end', paddingBottom:4}}>From <Text style={{ fontWeight: "bold" }}>{priceFormat(data?.price)}</Text></Text>}
              <View style={{backgroundColor:Colors.primary, padding:2, borderRadius:8}}>
                <MaterialCommunityIcons style={{borderRadius:12}} name="arrow-right" size={24} color="white" />
              </View>
            </View>     
          </View>
        </View> 
      </TouchableOpacity>
    </Link>
  )
}
export const StoreCard = ({data, storeType}) => {
  const url= storeType?`/stores/${storeType}/${data._id}`:`/stores/${data._id}`
  return (
    <Link href={url} asChild >
      <TouchableOpacity >
        <Card style={styles.card} elevation={3}>
          <View style={styles.row}>
            <ShimmerExpoImage uri={data.image}  width={width*0.44} height={140} accessibilityLabel={data.itemName} styles={{borderTopLeftRadius:12, borderBottomLeftRadius:12}} />
            <View style={styles.textCont}>
              <Text numberOfLines={2} style={{fontSize:14, fontWeight:'700'}}>{data.businessName}</Text>
              <View style={{flexDirection:'row',  alignItems:'center', gap:4, marginTop:4 }}>
                <Ionicons name="location-sharp" size={16} color={Colors.green} />
                <Text style={{fontSize:12,color:'#687076', marginRight:18,}}>{data?.businessAddress}</Text>
              </View>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:12}}>
                <Text style={{ alignSelf:'flex-end', paddingBottom:4}}>⭐ 4.5 (97)</Text>
                <View style={{flexDirection:'row', marginRight:18}}>
                  <MaterialCommunityIcons style={{borderRadius:12}} name="clock" size={20} color={Colors.primary} />
                  <Text style={{fontSize:14,alignSelf:'center'}}>25min</Text>
                </View>
              </View>     
            </View>
          </View>
        </Card> 
      </TouchableOpacity>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:'white',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom:12,
    elevation: 3, // shadow for Android
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row', // horizontal layout
  },
  textCont:{
    flex:1,
    paddingHorizontal:8, 
    paddingVertical:18, 
    paddingBottom:8, 
    gap:4, 
    // width:'100%',
  }
});

