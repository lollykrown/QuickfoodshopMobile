import { Colors } from "@/constants/colors";
import Entypo from "@expo/vector-icons/Entypo";
import { useRouter } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";


const EmptyState = ({text,buttonText='order now', url='/search', icon}) => {

    const router = useRouter();

    return(
      <View style={{ flex: 1 , paddingHorizontal:24, paddingVertical:28}}>
        <View style={{ flex: 1, justifyContent:'center', alignItems:'center'}}>
          {icon||<Entypo name="shopping-bag" size={120} color="#C4C4C4" />}
          <Text style={{fontSize:26, color:'#C4C4C4', marginTop:24, fontWeight:'700'}}>{text}</Text>
        </View>
        <Pressable
          style={styles.button}
          onPress={()=>router.push(url)}
        >
          <Text style={styles.buttonText}>
            {buttonText}
          </Text>
        </Pressable>
      </View>)
  }
export default EmptyState

const styles = StyleSheet.create({
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