import { StoreCard } from '@/components/ItemCard';
import SearchBar from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import useFetch from '@/hooks/usefetch';
import { fetchAllStores } from '@/services/api';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';

const Stores = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // const [filtered, setFiltered] = useState([])
  const router = useRouter();
  const pathname = usePathname();
  const drawer = useDrawer();

  // console.log(pathname)
  // Memoize fetch function to prevent infinite re-render
  const fetchFn = useCallback(() => {
    return fetchAllStores({
      query: searchQuery.trim() || undefined,
      limit: 100, // optional
    });
  }, [searchQuery]);

  const {
    data: items = [],
    loading,
    error,
    refetch: loadData,
  } = useFetch(() => fetchFn(searchQuery), false);

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  // useEffect(() => {
  //   setFiltered(items);
  // }, [items]);

  // useEffect(() => {
  //   const timeoutId = setTimeout(async () => {
  //     await loadData();
  //   }, 700);
  //   return () => clearTimeout(timeoutId);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="All Stores"
          variant="titleMedium"
          titleStyle={{ fontWeight: '700', color: 'black' }}
        />
        <Pressable onPress={drawer.toggle}>
          <AntDesign name="menu" size={24} color="black" />
        </Pressable>
      </Appbar.Header>

      {/* Searchbar */}
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
      <FlatList
        data={items}
        style={{ flex: 1, paddingHorizontal: 12, gap: 12 }}
        renderItem={({ item }) => (
          <StoreCard data={item} storeType={'restaurants'} />
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

            {!loading && !error && searchQuery.trim() && items?.length > 0 && (
              <Text style={{ fontSize: 24, fontWeight: 600 }}>
                Search Results for{' '}
                <Text
                  style={{ color: Colors.primary, textTransform: 'capitalize' }}
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
    </View>
  );
};

export default Stores;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
});
