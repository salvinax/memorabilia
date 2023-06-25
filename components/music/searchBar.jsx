import {
  View,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

import { icons } from "../../constants";
import SongItem from "./songItem";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchBar = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  //   useEffect(() => {
  //     fetchData();
  //   }, []);

  const retrieveTokens = async (name) => {
    try {
      const data = await AsyncStorage.getItem(name);

      return data;

      //if you can't retrieve data then login again??
    } catch (error) {
      //was not able to retrieve data
    }
  };

  useEffect(() => {
    console.log(data);
    const fetchData = async () => {
      if (searchTerm.length > 0) {
        const token = await retrieveTokens("token");
        const search = await fetch(
          `https://api.spotify.com/v1/search?q=${searchTerm}&type=track&market=CA&limit=10&offset=0`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (!search.ok) {
          console.log(search);
          console.log("no data");
        } else {
          const songData = await search.json();
          setSearchResult(songData);

          //   console.log(songData.tracks.items);
        }
      }
    };

    fetchData();
  }, [searchTerm]);

  return (
    <View style={styles.container}>
      <Text style={styles.searchTitle}>Search</Text>
      <TextInput
        style={styles.searchBar}
        placeholderTextColor={"grey"}
        placeholder="Find a song on Spotify."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {/* <Image style={styles.searchImg} source={icons.search} /> */}

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

      {/* <Text>here</Text>
      <Text style={{ color: "white" }}>
        {searchResult ? searchResult.tracks.items[0].name : "nothing here"}
      </Text> */}
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
