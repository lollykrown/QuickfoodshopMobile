import { View, Text, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, } from 'react-native'
import { Link, useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Appbar, Divider } from 'react-native-paper';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import { useAuth } from "@/contexts/authContext";
import { useState } from 'react';
import Svg, { Line } from 'react-native-svg';
import DottedLines from '@/components/DottedLines';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FormInput from '@/components/FormInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';


const order = 
  {
    id: 11,
    orderNumber: '3378',
    code: '2139',
    date: 'Mar 12, 2025',
    vendor: 'Open Sea Restaurant',
    status: 'Completed',
    deliveryCode:2139,
    items:[
      { name:'Jollof rice and chicken', quantity:1 },
      { name:'Fried rice and chicken', quantity:1 },
      { name:'Spagetti Bolognes', quantity:3 },
    ],
    extras:[
      { name:'Orange juice', quantity:1 },
      { name:'water 50cl', quantity:1 },
      { name:'Coca cola', quantity:3 },
    ],
  };

const OrderDetails = () => {
    const router = useRouter();
    const drawer = useDrawer(); 
    const { logout, loading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(z.object({lastName: z.string().min(2, 'Last name is required')})),
    defaultValues: {
      email: '',
      password: '',
    },
  });

    return (
        
        <ScrollView style={styles.container}>
            <Appbar.Header style={{backgroundColor:'#F8F8F8', paddingEnd:16}}>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title="Order Details" variant="titleMedium" titleStyle={{fontWeight:'700'}} />
                <Pressable onPress={drawer.toggle}>
                <AntDesign name="menu" size={24} color="black" />
                </Pressable>
            </Appbar.Header>  
            <View style={styles.card}>        
                <View style={styles.cardHeader}>
                    <Text style={{ fontWeight: 600 }}>Order: <Text style={{ fontWeight: 300 }}>5678</Text> </Text>
                    <Text style={{ color:Colors.grey}}>Delivery Code: <Text style={{fontWeight:600,color:'black'}}>98776</Text></Text>
                </View>
                <Divider bold style={{ marginVertical: 12 }} />
                <DottedLines styles={{paddingHorizontal: 12,}}/>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom:20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
                    <Text style={{ marginHorizontal: 8, color: Colors.grey  }}>DETAILS</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border  }} />
                </View>
            </View>
            <View style={styles.card}>        
                <View style={styles.row}>
                    <Text style={{ fontWeight: 600 }}>Date:</Text>
                    <Text style={{ fontWeight: 400, color:Colors.grey }}>{order.date}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={{ fontWeight: 600 }}>Vendor:</Text>
                    <Text style={{ fontWeight: 400, color:Colors.grey }}>{order.vendor}</Text>
                </View>
                    <View style={styles.row}>
                        <Text style={{ fontWeight: 600 }}>Item</Text>
                        <Text style={{ fontWeight: 600 }}>Qty</Text>
                    </View>
                    <View>
                        {order.items.map((i,index) => (
                            <View style={styles.column} key={`${i.name}+${index}`}>
                                <Text style={{fontWeight: 600, marginStart:6, color:Colors.grey }}>{`\u29BF ${i.name}`}</Text>
                                <Text style={{fontWeight: 400, color:Colors.grey,marginEnd:8,}}>{i.quantity}</Text>
                            </View>
                          ))}
                    </View>
                    <View style={styles.row}>
                            <Text style={{ fontWeight: 600 }}>Extras</Text>
                            <Text style={{ fontWeight: 600 }}>Qty</Text>
                    </View>
                    <View>
                        {order.extras.map((i,index) => (
                            <View style={styles.column} key={`${i.name}+${index}`}>
                                <Text style={{fontWeight: 600, marginStart:6, color:Colors.grey }}>{`\u29BF ${i.name}`}</Text>
                                <Text style={{fontWeight: 400, color:Colors.grey,marginEnd:8,}}>{i.quantity}</Text>
                            </View>
                        ))}
                    </View>
            </View>
            <View style={styles.card}>    
                <Text style={{ fontWeight: 600,paddingHorizontal: 12, fontSize:18, marginBottom:12 }}>Payment Summary</Text>    
                <View style={styles.row}>
                    <Text style={{ fontWeight: 600 }}>Subtotal</Text>
                    <Text style={{ fontWeight: 500 }}>$300</Text>
                </View>
                <View style={styles.row}>
                    <Text style={{ fontWeight: 600 }}>Est. Tax</Text>
                    <Text style={{ fontWeight: 500 }}>$2.00</Text>
                </View>        
                <View style={styles.row}>
                    <Text style={{ fontWeight: 600 }}>Delivery</Text>
                    <Text style={{ fontWeight: 500 }}>Free</Text>
                </View>  
                <View style={{margin:12}}>
                    <Svg width="100%" height={2} >
                    <Line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="#ccc"
                        strokeWidth={1.5}
                        strokeDasharray="8 6" 
                    />
                    </Svg>
                </View>         
                <View style={styles.row}>
                    <Text style={{ fontWeight: 600, fontSize:20 }}>Total</Text>
                    <Text style={{ fontWeight: 600, fontSize:20 }}>$302.00</Text>
                </View>   
            </View>            
            <View style={styles.card}>  
                <Text style={{ fontWeight: 600,paddingHorizontal: 12, fontSize:18, marginBottom:12 }}>Payment Method</Text> 
                <View style={{flexDirection:'row', justifyContent:'space-between',paddingHorizontal: 12}}>
                    <Text style={{ fontWeight: 600,color:Colors.grey, fontSize:16 }}>Card **** **** **** 2346</Text>
                    <FontAwesome5 name="cc-mastercard" size={24} color="black" />
                </View>   
            </View>
            <KeyboardAvoidingView
                  style={styles.container}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >

            
            <FormInput
                control={control}
                name='feedback'
                label='feedback'
                contStyles={{marginHorizontal:20,marginVertical:8, borderRadius:16}}
                textInputStyles={{borderRadius:28, textAlignVertical: 'top',minHeight: 80,}}
                labelStyles={{marginHorizontal:20,fontSize:16,fontWeight: 600,marginTop:12}}
                placeholder='I love the service, and the items were fairly priced'
                error={errors?.['feedback']?.message}
                autoCapitalize="none"
                numberOfLines={4}
                multiline={true}/>
            </KeyboardAvoidingView>
        </ScrollView>  
        
    )
}

export default OrderDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
card: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    marginHorizontal:20,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: 12,
  },
    column: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
})