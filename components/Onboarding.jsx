import { View, Text, StyleSheet, ImageBackground, Dimensions, Image, TouchableOpacity, Animated } from 'react-native'
import { useRef, useState } from 'react'
import { Colors } from '@/constants/colors'
import GetStartedScreen from '@/components/OnbdLastScreen'
import * as Haptics from 'expo-haptics'
import StackedBackground from './StackedBG'


const { width, height } = Dimensions.get('window')

const parseYellow = (text) => {
  return text.split("**").map((part, index) => (
    <Text key={index} style={index % 2 ? styles.yellow : null}>
      {part}
    </Text>
  ));
};
const slides = [
  {
    id: '1',
    title: 'Enjoy Food at Your **Convenience** anytime',
    desc: 'Quick delivery to your doostep as soon as possble. Quick delivery ',
    image: require('../assets/images/onboarding1.webp'),
  },
  {
    id: '2',
    title: 'Local Delivery',
    desc: 'Get your food delivered quickly and safely.',
    image: require('../assets/images/onboarding2.webp'),
  },
  {
    id: '3',
    title: 'Quick **Delivery** at Your Doorstep',
    desc: 'Freshly cooked food delivered to your doorstep, wherever, whenever.',
    image: require('../assets/images/onboarding3.webp'),
  },
]

export default function Onboarding() {
  const flatListRef = useRef(null)
  const scrollX = useRef(new Animated.Value(0)).current
  const [index, setIndex] = useState(0)

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

  const next = () => {
    haptic()  
    if (index < slides.length - 1) {
      // Move to next slide in FlatList
      flatListRef.current.scrollToIndex({ index: index + 1 })
    } else {
      // Last slide reached → show GetStartedScreen
      setIndex(slides.length) // <-- THIS LINE triggers the conditional rendering
    }
  }

  const skip = () => {
    setIndex(slides.length)
  }
  if (index >= slides.length) return <GetStartedScreen />

  return (
    <StackedBackground style={styles.container}>
      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onMomentumScrollEnd={e =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <ImageBackground style={{width:'100%', alignItems:'center', paddingTop:40}}  source={require('../assets/images/onboardingBg.webp')} contentFit="cover">
              <Image source={item.image} style={styles.image} />

            </ImageBackground>
            <View style={styles.lowerSect}>

            <View>
              <Text style={styles.title}>{parseYellow(item.title)}</Text>
              <Text style={styles.text}>{item.desc}</Text>
            </View>
            {/* Button */}
              <TouchableOpacity style={styles.nextBtn} onPress={next}>
                <Text style={styles.nextText}>
                  Next
                </Text>
              </TouchableOpacity>
              {/* Skip */}
              <TouchableOpacity style={styles.skipBtn} onPress={skip}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>
           </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, i) => {
          // Animate opacity
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.5, 1, 0.5], // optional: slightly fade inactive
            extrapolate: 'clamp',
          })

          // Animate background color
          const backgroundColor = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: ['#FFFFFF', '#F7C904', '#FFFFFF'], 
            extrapolate: 'clamp',
          })

          return (
            <Animated.View
              key={i}
              style={[styles.dot, { opacity, backgroundColor }]} // <-- add backgroundColor
            />
          )
        })}
      </View>

    </StackedBackground>
  )
}


  


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    justifyContent: 'space-evenly',
  },
  image: {
    width: width * 0.8,   
    height: height * 0.55,  
    contentFit: 'contain', 
  },
  lowerSect:{
    alignItems: 'center', 
    backgroundColor:Colors.primary,
    paddingTop:40,
    paddingHorizontal:20,
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
    height: height * 0.45,  
    paddingBottom:20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 20,
    color: 'white',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#f6f6f6',
    fontWeight: '300',
    marginHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position:'absolute',
    top: height * 0.63,
    width: '100%',
    // marginTop: 80,
  },
  dot: {
    height: 9,
    width: 9,
    borderRadius: 4,
    // backgroundColor: '#FF6600',
    marginHorizontal: 6,
  },
  nextBtn: {
    backgroundColor: '#F7C904',
    padding: 16,
    marginHorizontal: 'auto',
    borderRadius: 12,
    minWidth: '65%',
    alignItems: 'center',
    marginTop: 30,
  },
  nextText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  skipBtn: {
    padding: 20,
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  skipText: {
    color: '#F7C904',
    fontWeight: '600',
  },
  yellow:{
    color:'#F7C904'
  }
})
