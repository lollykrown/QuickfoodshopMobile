import featured from '@/assets/images/featured.webp';
import featured2 from '@/assets/images/featured2.webp';
import featured3 from '@/assets/images/featured3.webp';
import { ItemCard } from '@/components/ItemCard';
import RipplePressable from '@/components/RipplePressable';
import SearchBar from '@/components/SearchBar';
import { Colors } from '@/constants/colors';
import { useDrawer } from '@/contexts/DrawerProvider';
import useFetch from '@/hooks/usefetch';
import { fetchAllData } from '@/services/api';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { Appbar } from 'react-native-paper';

const feat = [featured3, featured2, featured];
const feat2 = [featured2, featured, featured3];

const renderFeaturedItems = ({ item }) => (
  <Image
    source={item}
    style={{ width: 260, height: 160, borderRadius: 12, marginBottom: 8 }}
  />
);
const categories = [
  'amala',
  'milo',
  'ofada',
  'jollof rice',
  'small chops',
  'fried rice',
  'moi moi',
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const drawer = useDrawer();

  const {
    data: items = [],
    loading,
    error,
    refetch: loadData,
    reset,
  } = useFetch(() => fetchAllData({ query: searchQuery }), false);
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadData();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#F8F8F8', paddingEnd: 16 }}>
        <Appbar.BackAction color="black" onPress={() => router.back()} />
        <Appbar.Content
          title="Search"
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
          marginBottom: 8,
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
        numColumns={2}
        data={items}
        style={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <ItemCard
            data={item}
            storeType={item?.categoryId?.name?.toLowerCase() || 'groceries'}
          />
        )}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 18,
        }}
        keyExtractor={(item) => item._id.toString()}
        ListHeaderComponent={
          <View style={{ paddingBottom: 30 }}>
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
            {/* Popular searches section */}
            {searchQuery && (
              <View style={styles.featuredCont}>
                <Text style={{ fontWeight: 700, fontSize: 16 }}>
                  Popular Searches
                </Text>
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
                    <RipplePressable
                      key={index}
                      style={[
                        styles.catStyle,
                        cat === searchQuery && styles.categoryActive,
                      ]}
                      rippleColor={
                        cat === searchQuery
                          ? 'rgba(255, 255, 255, 0.32)'
                          : 'rgba(0, 102, 52,0.15)'
                      }
                      onPress={() => setSearchQuery(cat)}
                    >
                      <Text
                        style={[
                          {
                            color:
                              cat === searchQuery ? 'white' : Colors.primary,
                            fontSize: 16,
                            fontWeight: '600',
                            textTransform: 'capitalize',
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                      <FontAwesome
                        style={[
                          {
                            color:
                              cat === searchQuery ? 'white' : Colors.primary,
                            marginStart: 4,
                          },
                        ]}
                        name="search"
                        size={16}
                        color={Colors.primary}
                      />
                    </RipplePressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {!loading && !error && searchQuery.trim() && items?.length > 0 && (
              <Text style={{ fontSize: 20, fontWeight: 600, marginTop: 12 }}>
                Showing search Results for{' '}
                <Text
                  style={{ color: Colors.primary, textTransform: 'capitalize' }}
                >
                  {searchQuery}
                </Text>
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View style={{ marginTop: 10, gap: 20 }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: 'gray',
                  paddingHorizontal: 10,
                  paddingBottom: 14,
                }}
                numberOfLines={2}
              >
                {searchQuery.trim()
                  ? `No groceries, food or restaurants found with by the word ${searchQuery}`
                  : 'Start typing in the search box above to search for groceries or food items'}
              </Text>
              {/* Popular searches section */}
              {!searchQuery.trim() && (
                <View style={styles.featuredCont}>
                  <Text style={{ fontWeight: 700, fontSize: 16 }}>
                    Popular Searches
                  </Text>
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
                      <RipplePressable
                        key={index}
                        style={[
                          styles.catStyle,
                          cat === searchQuery && styles.categoryActive,
                        ]}
                        rippleColor={
                          cat === searchQuery
                            ? 'rgba(255, 255, 255, 0.32)'
                            : 'rgba(0,0,0,0.15)'
                        }
                        onPress={() => setSearchQuery(cat)}
                      >
                        <Text
                          style={[
                            {
                              color:
                                cat === searchQuery ? 'white' : Colors.primary,
                              fontSize: 16,
                              fontWeight: '600',
                              textTransform: 'capitalize',
                            },
                          ]}
                        >
                          {cat}
                        </Text>
                        <FontAwesome
                          style={[
                            {
                              color:
                                cat === searchQuery ? 'white' : Colors.primary,
                              marginStart: 4,
                            },
                          ]}
                          name="search"
                          size={16}
                          color={Colors.primary}
                        />
                      </RipplePressable>
                    ))}
                  </ScrollView>
                </View>
              )}
              {/* Featured section */}
              <View style={styles.featuredCont}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: 700, fontSize: 16 }}>
                    Featured
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.green,
                      fontWeight: 600,
                    }}
                  >
                    See All
                  </Text>
                </View>
                <FlatList
                  horizontal={true}
                  data={feat}
                  renderItem={renderFeaturedItems}
                  keyExtractor={(item) => item.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                />
              </View>
              <View style={styles.featuredCont}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: 700, fontSize: 16 }}>
                    Featured
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.green,
                      fontWeight: 600,
                    }}
                  >
                    See All
                  </Text>
                </View>
                <FlatList
                  horizontal={true}
                  data={feat2}
                  renderItem={renderFeaturedItems}
                  keyExtractor={(item) => item.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                />
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F8F8',
  },
  featuredCont: {
    marginTop: 20,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingBottom: 18,
    borderBottomColor: '#E2E2E2',
  },
  catStyle: {
    borderColor: Colors.primary,
    marginRight: 10,
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  categoryActive: {
    backgroundColor: Colors.primary,
  },
});
