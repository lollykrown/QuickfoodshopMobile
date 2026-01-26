import { View, StyleSheet, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import ShimmerExpoImage from '@/components/ShimmerImg';
import { useAuth } from '@/contexts/authContext';
import { Image } from 'expo-image';

export default function NotFoundScreen() {
    const { avatar } = useAuth();
  
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={styles.container}>
        <Image style={{marginHorizontal:'auto', marginBottom:40}} contentFit='contain' source={require('../assets/images/logo.png')} width={'80%'} height={150} styles={{borderRadius:24}} />
        <Text style={{fontSize:16}}>The requested page is not available</Text>
        <Link href="/home" style={styles.button}>
          <Text>Go back to Home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:-150
  },

  button: {
    fontSize: 20,
    fontWeight:600,
    marginTop:20,
    color:'white',
    backgroundColor:Colors.primary,
    padding:16,
    borderRadius:12
  },
});
