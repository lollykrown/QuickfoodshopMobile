import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  UIManager,
  LayoutAnimation,
  Platform,
  FlatList,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Divider } from 'react-native-paper';
import { Colors } from '@/constants/colors';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SLIDE_DISTANCE = 50;

const Accordion = ({ item, isExpanded, onToggle }) => {
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(-SLIDE_DISTANCE);
  const opacity = useSharedValue(0);

  // Animate arrow & slide
  useEffect(() => {
    rotation.value = withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 200 });
    translateX.value = withSpring(isExpanded ? 0 : -SLIDE_DISTANCE, { damping: 20, stiffness: 200 });
    opacity.value = withSpring(isExpanded ? 1 : 0, { damping: 20, stiffness: 200 });

    // Animate height expansion
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isExpanded]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={{ fontWeight: 600 }}>
            Order: <Text style={{ fontWeight: 300 }}>{item.orderNumber}</Text>
            </Text>
            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',gap:12}}>            
                <Text style={{ color:Colors.grey}}>Delivery Code: <Text style={{fontWeight:600,color:'black'}}>{item.deliveryCode}</Text></Text>
                <TouchableOpacity onPress={onToggle}>
                    <Animated.View style={arrowStyle}>
                        <MaterialIcons  name="keyboard-arrow-down" size={26} color="black" />
                    </Animated.View>
            </TouchableOpacity>
            </View>
        </View>

      {isExpanded && (
        <Animated.View style={[styles.hiddenContent, contentStyle]}>
          <Divider bold style={{ marginBottom: 12 }} />
          <View style={styles.row}>
            <Text style={{ fontWeight: 600 }}>Date:</Text>
            <Text style={{ fontWeight: 400, color:Colors.grey }}>{item.date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontWeight: 600 }}>Vendor:</Text>
            <Text style={{ fontWeight: 400, color:Colors.grey }}>{item.vendor}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ fontWeight: 600 }}>Status:</Text>
            <Text style={{ fontWeight: 400, color:Colors.grey}}>{item.status}</Text>
          </View>
        <View style={styles.row}>
            <Text style={{ fontWeight: 600 }}>Item</Text>
            <Text style={{ fontWeight: 400, color:Colors.grey}}>Qty</Text>
          </View>
        <FlatList
          data={[
            { key: 'Tokyo' },
            { key: 'Delhi' },
            { key: 'Shanghai' },
            { key: 'Sao Paolo' },
          ]}
          renderItem={({ item }) => {
            return (
                <View style={styles.row}>
                <Text style={{fontWeight: 600, marginStart:6, color:Colors.grey }}>{`\u29BF ${item.key}`}</Text>
                <Text style={{fontWeight: 400, color:Colors.grey,marginEnd:8,}}>2</Text>
              </View>
            );
          }}
        />
        </Animated.View>
      )}
    </View>
  );
};

export default Accordion;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hiddenContent: {
    marginTop: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});