import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { API, Auth } from "aws-amplify";
import * as mutations from "../../src/graphql/mutations";
import { useRouter } from "expo-router";

const SongItem = ({ data, prefix }) => {
  const [artistList, setArtistList] = useState("");

  const router = useRouter();
  let track;

  // If it's a search result being displayed
  if (prefix) {
    track = data;
  } else {
    // If it's a recently played song
    track = data.track;
  }

  useEffect(() => {
    let artistArr = [];
    track.artists.map((item) => {
      artistArr.push(item.name);
    });

    setArtistList(artistArr.join(", "));
  }, []);

  // Add Song Journal Entry to Calendar
  const addEntry = async () => {
    let yourDate = new Date();
    // let entryDate = yourDate.toISOString().split("T")[0];
    let entryDate = "2023-07-11";

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
      // Add modal that alerts user
    }

    router.replace("/");
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
