import { View, Image, StyleSheet, Dimensions } from 'react-native'
import React from 'react'

const { width } = Dimensions.get('window')

export default function StackedBackground({ children }) {
  return (
    <View style={styles.container}>
      {/* Background stack */}
      <View style={styles.backgroundContainer}>
        <Image
          source={require('../assets/images/onboardingBg.webp')}
          style={styles.square}
        />
        <Image
          source={require('../assets/images/onboardingBg.webp')}
          style={styles.square}
        />
      </View>

      {/* Foreground content */}
      <View style={styles.childrenContainer}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0, // background behind
  },
  square: {
    width: width,
    height: width, // square
    contentFit: 'cover',
  },
  childrenContainer: {
    flex: 1,
    zIndex: 1, 
    alignItems: 'center'
  },
})
