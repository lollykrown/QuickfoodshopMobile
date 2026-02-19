import { ItemCard, StoreCard } from '@/components/ItemCard';
import SearchBar from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import useFetch from '@/hooks/usefetch';
import {
  fetchAllStores,
  fetchFood,
  fetchFoodExtras,
  fetchGroceries,
  fetchGroceriesStores,
  fetchRestaurants,
} from '@/services/api';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Appbar, Button } from 'react-native-paper';

const categories = [
  'All',
  'Condiments',
  'Meats, Fishes and Seafoods',
  'Fruits and Vegetables',
  'Grains and Flours',
  'Drinks and Beverages',
  'Oils',
  'Health and Beauty',
  'Snacks',
  'Others',
  'Soup Ingredients',
  'Spices',
];

const Category = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // const [filtered, setFiltered] = useState([])
  const router = useRouter();
  const params = useLocalSearchParams();
  const drawer = useDrawer();

  const fnChoice = useCallback(() => {
    return params.category === 'restaurants'
      ? fetchRestaurants
      : params.category === 'grocery-stores'
        ? fetchGroceriesStores
        : params.category === 'groceries'
          ? fetchGroceries
          : params.category === 'food'
            ? fetchFood
            : params.category === 'extras'
              ? fetchFoodExtras
              : fetchAllStores;
  }, [params.category]);

  const fetchFn = useCallback(
    () => fnChoice()({ searchQuery }),
    [fnChoice, searchQuery],
  );
  const text =
    params.category === 'all'
      ? 'All Stores'
      : params.category.replace(/-/g, ' ');
  const {
    data: items = [],
    loading,
    error,
    refetch: loadData,
  } = useFetch(() => fetchFn(), false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title={text}
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', textTransform: 'capitalize' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>

      {/* Searchbar */}
      {params.category === 'groceries' ? (
        <View style={styles.categoryCont}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {categories.map((cat, index) => (
              <Button
                key={index}
                style={{ borderColor: Colors.primary, marginRight: 10 }}
                mode={index === 0 ? 'contained' : 'outlined'}
                textColor={index === 0 ? 'white' : Colors.primary}
                buttonColor={index === 0 ? Colors.primary : null}
                background={Colors.primary}
                labelStyle={{ fontWeight: '600', textTransform: 'capitalize' }}
                rippleColor="rgba(255, 255, 255, 0.32)"
                // onPress={() => cat==='all'?router.push('/stores/groceries'):router.push(`/stores/?filter=${cat.replace(/ /g, "-")}`)}
              >
                {cat}
              </Button>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View
          style={{
            marginBottom: 12,
            paddingHorizontal: 16,
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          <SearchBar
            placeholder="Search Food and Restaurants"
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
          <Pressable onPress={() => Keyboard.dismiss()}>
            <View
              style={{
                backgroundColor: Colors.primary,
                alignSelf: 'center',
                padding: 10,
                borderRadius: 12,
              }}
            >
              <Fontisto
                style={{ transform: 'rotate(90deg)' }}
                name="equalizer"
                size={18}
                color="white"
              />
            </View>
          </Pressable>
        </View>
      )}
      {params.category === 'restaurants' ||
      params.category === 'grocery-stores' ? (
        <FlatList
          data={items}
          style={{ flex: 1, paddingHorizontal: 12, gap: 12 }}
          renderItem={({ item }) => (
            <StoreCard data={item} storeType={params.category} />
          )}
          keyExtractor={(item) => item._id.toString()}
          ListHeaderComponent={
            <View style={{ paddingVertical: 30 }}>
              {loading && (
                <ActivityIndicator
                  size="large"
                  color={Colors.primary}
                  style={{ marginVertical: 40 }}
                />
              )}

              {error && (
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: 500,
                    color: 'red',
                    paddingHorizontal: 10,
                  }}
                >
                  Error: {error.message}
                </Text>
              )}

              {!loading &&
                !error &&
                searchQuery.trim() &&
                items?.length > 0 && (
                  <Text style={{ fontSize: 24, fontWeight: 600 }}>
                    Search Results for{' '}
                    <Text
                      style={{
                        color: Colors.primary,
                        textTransform: 'capitalize',
                      }}
                    >
                      {searchQuery}
                    </Text>
                  </Text>
                )}
            </View>
          }
          // ListEmptyComponent={
          //   !loading && !error ? (
          //     <View style={{marginTop:10, padding:8}}>
          //       <Text style={{textAlign:'center', fontSize:16, color:'gray',paddingHorizontal:10}} numberOfLines={2}>
          //         {(searchQuery.trim()&&filtered.length===0)
          //           ? `No groceries, food or restaurants found with by the word ${searchQuery}`
          //           : "Start typing in the search box above to search for groceries or food items"}
          //       </Text>
          //     </View>
          //   ) : null
          // }
        />
      ) : (
        <FlatList
          numColumns={2}
          data={items}
          style={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <ItemCard data={item} storeType={params.category} />
          )}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 18,
          }}
          keyExtractor={(item) => item._id.toString()}
          // ListHeaderComponent={
          //   <View style={{paddingVertical:30}}>
          //     {loading && (
          //       <ActivityIndicator
          //         size="large"
          //         color={Colors.primary}
          //         style={{marginVertical:40}}
          //       />
          //     )}

          //     {error && (
          //       <Text style={{textAlign:'center',fontWeight:500,color:'red',paddingHorizontal:10}}>
          //         Error: {error.message}
          //       </Text>
          //     )}

          //     {!loading &&
          //       !error &&
          //       searchQuery.trim() &&
          //       items?.length > 0 && (
          //         <Text style={{fontSize:24, fontWeight:600}}>
          //           Search Results for{" "}
          //           <Text style={{color:Colors.primary, textTransform:'capitalize'}}>{searchQuery}</Text>
          //         </Text>
          //       )}
          //   </View>
          // }
          // ListEmptyComponent={
          //   !loading && !error ? (
          //     <View style={{marginTop:10, padding:8}}>
          //       <Text style={{textAlign:'center', fontSize:16, color:'gray',paddingHorizontal:10}} numberOfLines={2}>
          //         {searchQuery.trim()
          //           ? `No groceries, food or restaurants found with by the word ${searchQuery}`
          //           : "Start typing in the search box above to search for groceries or food items"}
          //       </Text>
          //     </View>
          //   ) : null
          // }
        />
      )}
    </View>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  categoryCont: {
    marginTop: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    paddingBottom: 14,
    borderBottomColor: '#E2E2E2',
  },
});
