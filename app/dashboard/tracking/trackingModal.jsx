import RipplePressable from '@/components/RipplePressable';
import { Colors } from '@/constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View,} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


export default function ModalScreen() {
  const router = useRouter();


  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={()=>router.back()}>
        <Ionicons
          style={{ textAlign: 'center', fontWeight: '700' }}
          name="close"
          size={19}
          color="black"
        />
      </Pressable>
      <RipplePressable style={{marginTop:32, padding:14,backgroundColor:'#f0fff0', flexDirection:'row',gap:8, borderRadius:20, borderWidth:1,borderColor:Colors.primary}}>            
        <Image
            style={{ width: 80, height: 80, marginTop: 8 }}
            source={require('../../../assets/images/logo_transparent.png')}
            contentFit='contain'
            />
        <View>
          <Text style={{fontSize:16, fontWeight:'600'}}>Meet your rider and say</Text>
          <Text style={{fontSize:40, fontWeight:'600', marginTop:12, color:Colors.grey}}>&quot;1339&quot;</Text>
        </View>
      </RipplePressable>
      <View style={{ marginTop:18, paddingBottom:30}}>
          <Text style={{fontSize:16, fontWeight:'600', }}>How it works:</Text>
          <View>
            <View style={{borderWidth:1,flexDirection:'row',marginVertical:8,gap:12,alignItems:'center', borderColor:Colors.border,borderRadius:24, paddingHorizontal:16, paddingVertical:22}}>
              <MaterialCommunityIcons name="numeric-1-circle" size={28} color={Colors.primary} />
              <Text style={{color:Colors.grey}}>Rider arives at your location</Text>
            </View>
            <View style={{borderWidth:1,flexDirection:'row',marginVertical:8,gap:12,alignItems:'center', borderColor:Colors.border,borderRadius:24, paddingHorizontal:16, paddingVertical:22}}>
              <MaterialCommunityIcons name="numeric-2-circle" size={28} color={Colors.primary} />
              <Text style={{color:Colors.grey}}>Meet your rider and say your code</Text>
            </View>
            <View style={{borderWidth:1,flexDirection:'row',marginVertical:8,gap:12,alignItems:'center', borderColor:Colors.border,borderRadius:24, paddingHorizontal:16, paddingVertical:22}}>
              <MaterialCommunityIcons name="numeric-3-circle" size={28} color={Colors.primary} />
              <Text style={{color:Colors.grey}}>Rider confirms that the code matches with theirs.</Text>
            </View>
            <View style={{borderWidth:1,flexDirection:'row',marginVertical:8,gap:12,alignItems:'center', borderColor:Colors.border,borderRadius:24, paddingHorizontal:16, paddingVertical:22}}>
              <MaterialCommunityIcons name="numeric-4-circle" size={28} color={Colors.primary} />
              <Text style={{color:Colors.grey}}>Rider confirms your delivery</Text>
            </View>
            <View style={{borderWidth:1,flexDirection:'row',marginVertical:8,gap:12,alignItems:'center', borderColor:Colors.border,borderRadius:24, paddingHorizontal:16, paddingVertical:22}}>
              <MaterialCommunityIcons name="numeric-5-circle" size={28} color={Colors.primary} />
              <Text style={{color:Colors.grey}}>Rider hands over package to you</Text>
            </View>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 7,
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

});
