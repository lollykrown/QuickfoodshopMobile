import { Colors } from '@/constants/colors';
import Octicons from '@expo/vector-icons/Octicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useToast } from '@/hooks/useToast';


const { width } = Dimensions.get('window');
const options = ['browse store', 'customer', 'vendor', 'rider'];
const options2 = ['customer', 'vendor', 'rider'];

export default function OnbdOptions({auth}) {
  const router = useRouter();
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);
  const [authRoute, setAuthRoute] = useState(auth||'signup');
  const { show, Toast } = useToast();
  const o = auth === 'login' ? options2 : options;

  const onDismissSnackBar = () => setVisible(false);

  const animateButton = () => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const handleClick = (option) => {
    setSelected(option);
    // console.log('Selected option:', option);
    const opt = option === 'browse store'
      ? router.replace('/home')
      : router.push(`${option}/${authRoute}`);
      return opt;
  };

  const message = 'Please select an option above to continue';
  const continueHandler = () => {
    animateButton();
    if (selected === null) {
      show(message,'error')
      return;
    }
    return selected === 'browse store'
      ? router.replace('/home')
      : router.push(`${selected}/${authRoute}`);
  };

  return (
    <>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo_transparent.png')}
          style={{
            width: width * 0.9,
            zIndex: 50,
            height: 170,
            res: 'contain',
            marginVertical: 40,
          }}
        />

        <Text style={{ fontSize: 18, marginBottom: 40 }}>
          How do you want to {auth||'sign up'}?
        </Text>
        <View style={styles.buttonGroup}>
          {o.map((option, i) => {
            const isActive = selected === option;
            return (
              <Pressable
                onPress={() => handleClick(option)}
                key={i}
                style={[styles.btn, isActive && styles.activeBtn]}
              >
                <Text
                  style={[styles.btnText, isActive && styles.activeBtnText]}
                >
                  {option}
                </Text>
                <Octicons
                  style={{ alignSelf: 'center', marginEnd: 6 }}
                  name="check-circle-fill"
                  size={24}
                  color={isActive ? Colors.green : '#C4C4C4'}
                />
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          style={{ transform: [{ scale: buttonScale }], width: '100%' }}
        >
          <TouchableOpacity
            style={styles.animButton}
            onPress={() => continueHandler()}
            activeOpacity={0.8}
          >
            <Text style={styles.animButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  buttonGroup: {},
  btn: {
    borderColor: Colors.grey,
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 'auto',
    marginVertical: 8,
    width: '100%',
    borderRadius: 20,
  },
  activeBtn: {
    borderColor: Colors.green,
  },
  btnText: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
    textAlign: 'center',
    fontWeight: 600,
    color: Colors.grey,
    textTransform: 'capitalize',
  },
  activeBtnText: {
    color: Colors.green,
  },
  animButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginVertical: 20,
    marginHorizontal: 'auto',
    width: '100%',
  },
  animButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
});
