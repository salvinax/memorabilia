import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { icons } from "../../constants";

const SongItem = ({ data, prefix }) => {
  const [artistList, setArtistList] = useState("");
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
    let artistArr = [];
    track.artists.map((item) => {
      artistArr.push(item.name);
    });
    setArtistList(artistArr.join(", "));
  }, []);

  return (
    <TouchableOpacity style={styles.track}>
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
      <Image style={styles.spotifyIcon} source={icons.spotify} />
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
  searchImg: {
    width: 30,
    height: "100%",
    marginLeft: 3,
  },
  track: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
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
