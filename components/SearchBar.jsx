import { View, TextInput } from "react-native";

import Ionicons from '@expo/vector-icons/Ionicons';

const SearchBar = ({ placeholder, value, onChangeText, onPress }) => {
  return (
    <View style={{flexDirection:'row',paddingVertical:4,width:'85%',paddingHorizontal:12,gap:4,alignItems:'center',borderRadius:16, backgroundColor:'white'}}>
      <Ionicons name="search-sharp" size={24} color="#C4C4C4" />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={{marginLeft:2, width:'100%'}}
        placeholderTextColor="#C4C4C4"
      />
    </View>
  );
};

export default SearchBar;
