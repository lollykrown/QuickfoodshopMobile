import  { useEffect } from 'react';

import { StyleSheet,Dimensions } from 'react-native';
import { Image } from 'expo-image';
import StackedBackground from '@/components/StackedBG';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { height } = Dimensions.get('window')

export default function LoginForm() {
  const {role, prev}= useLocalSearchParams()

  const router = useRouter()

    useEffect(() => {
      router.replace(`/modal?role=${role}&prev=${prev}`);
    }, []);

  return (
    <StackedBackground style={styles.container} >
      <Image
        source={require('../../../assets/images/onboarding3.webp')}
        width={'100%'}
        height={height*0.6}
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
});
