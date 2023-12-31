import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { icons } from "../../constants";

import { API, Auth } from "aws-amplify";
import * as mutations from "../../src/graphql/mutations";
import { ENDPOINT_TEMP, ENDPOINT_TEMP_STORE } from "@env";

import { useRouter } from "expo-router";

const SongItem = ({ data, prefix }) => {
  const [artistList, setArtistList] = useState("");
  const [id, setID] = useState("");
  const router = useRouter();
  const [track, setTrack] = useState(() => {
    if (prefix) {
      //if it's a search result
      return data;
    } else {
      //if its recently played songs
      return data.track;
    }
  });

  useEffect(() => {
    Auth.currentUserInfo()
      .then((user) => {
        setID(user.attributes.sub);
      })
      .catch((error) => {
        console.log("Auth Error", error);
      });
  }, []);

  useEffect(() => {
    let artistArr = [];
    track.artists.map((item) => {
      artistArr.push(item.name);
    });
    setArtistList(artistArr.join(", "));
  }, []);

  const addEntry = async () => {
    let yourDate = new Date();
    let entryDate = yourDate.toISOString().split("T")[0];

    let pictureLink = track.album.images[0].url;
    pictureLink = pictureLink.substring(8);

    try {
      const response = await API.graphql({
        query: mutations.createEntry,
        variables: {
          input: {
            date: entryDate,
            type: "entry",
            contentType: "song",
            songID: track.id,
            songName: track.name,
            artists: artistList,
            albumLink: pictureLink,
          },
        },
      });

      console.log(response);
    } catch (error) {
      console.log("Not able to Create Entry: ", error);
    }
    router.push("/");

    // console.log(pictureLink);
    // console.log(artistList);
    // console.log(track.name);
    // console.log(track.id);
  };

  return (
    <TouchableOpacity onPress={addEntry} style={styles.track}>
      <Image
        style={styles.trackImg}
        source={{ uri: track.album.images[0].url }}
      />
      <View style={{ width: 260 }}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.trackTitle}>
          {track.name}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.trackArtists}
        >
          {artistList}
        </Text>
      </View>
    </TouchableOpacity>
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
  },
  recentTitle: {
    color: "white",
    fontSize: 17,
    fontFamily: "InterMedium",
    marginTop: 20,
    marginBottom: 7,
  },

  track: {
    width: "100%",
    flexDirection: "row",
  },
  trackImg: {
    width: 70,
    height: 70,
    marginRight: 15,
    borderRadius: 4,
  },
  trackTitle: {
    color: "white",
    fontFamily: "InterMedium",
    fontSize: 14,
    marginTop: 13,
    marginBottom: 6,
  },
  trackArtists: {
    color: "#E6D9D9",
    fontFamily: "InterRegular",
    fontSize: 13,
  },
  spotifyIcon: {
    height: 30,
    width: 30,
    marginTop: 13,
  },
});

export default SongItem;
