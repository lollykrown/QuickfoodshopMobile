import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import StackedBackground from '@/components/StackedBG';

const { height } = Dimensions.get('window')

export default function LoginForm() {
  const {role, prev}= useLocalSearchParams()

    const router = useRouter();
    useEffect(() => {
      router.replace(`/modal?role=${role}&prev=${prev}`);
    }, []);
  

  return (
    <StackedBackground style={styles.container}>
      {/* <Pressable style={styles.backBtn} onPress={()=>router.back()}>
        <MaterialIcons style={{textAlign:'center'}} name="arrow-back-ios-new" size={18} color="black" />
      </Pressable> */}

      <Image
        source={require('../../../assets/images/onboarding3.webp')}
        width={'100%'}
        height={height * 0.6}
      />

    </StackedBackground>
  );
}

/* -------- Styles -------- */
const styles = StyleSheet.create({
  container: {
    padding: 16,
    position:'relative'
  },
  backBtn:{
    backgroundColor:'white',
    borderRadius:12, 
    position:'absolute', 
    left:24, 
    top:54,
    zIndex:100,
    padding:6,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0f766e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    top: 50,
  },
});
