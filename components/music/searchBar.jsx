import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";

import SongItem from "./songItem";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

const SearchBar = ({ data }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // Retrieve Search Results from Spotify API
  useEffect(() => {
    (async () => {
      try {
        if (searchTerm.length > 0) {
          // Retrieve token in Local Storage
          const token = await AsyncStorage.getItem("token");

          const search = await fetch(
            `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&market=CA&limit=10&offset=0`,
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );

          if (!search.ok) {
            throw new Error(search.status);
          }

          const songData = await search.json();
          setSearchResult(songData);
        }
      } catch (e) {
        console.log("Error: No Search Results", e);
      }
    })();
  }, [searchTerm]);

  return (
    <View style={styles.container}>
      <Pressable
        style={{ alignSelf: "center" }}
        onPress={() => {
          router.back();
        }}
      >
        <MaterialIcons name="keyboard-arrow-down" size={40} color="white" />
      </Pressable>
      <TextInput
        style={styles.searchBar}
        placeholderTextColor={"grey"}
        placeholder="Find a song on Spotify."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <FlatList
        ListHeaderComponent={
          searchTerm.length == 0 && (
            <Text style={styles.recentTitle}>Recently Played</Text>
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ rowGap: 13 }}
        style={styles.list}
        data={
          Object.keys(searchResult).length > 0 && searchTerm.length > 0
            ? searchResult.tracks.items
            : data.items
        }
        renderItem={({ item }) => (
          <SongItem
            data={item}
            prefix={
              Object.keys(searchResult).length > 0 && searchTerm.length > 0
                ? true
                : false
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchTitle: {
    color: "white",
    fontSize: 25,
    fontFamily: "InterMedium",
    marginTop: 20,
  },
  container: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  searchBar: {
    marginTop: 10,
    backgroundColor: "white",
    width: "100%",
    height: 35,
    borderRadius: 5,
    marginBottom: 15,
    color: "black",
    fontFamily: "InterMedium",
    paddingLeft: 10,
  },
  recentTitle: {
    color: "white",
    fontSize: 17,
    fontFamily: "InterMedium",
  },

  searchImg: {
    width: 30,
    height: "100%",
    marginLeft: 3,
  },
  track: {
    width: "100%",
    height: 100,
    backgroundColor: "transparent",
  },
  trackImg: {
    width: 100,
    height: "100%",
  },
  trackTitle: {
    color: "white",
    fontFamily: "InterMedium",
    fontSize: 13,
  },
  trackArtists: {
    color: "grey",
    fontFamily: "InterMedium",
    fontSize: 13,
  },
  spotifyIcon: {
    heigth: "100%",
    width: 40,
  },
});

export default SearchBar;
