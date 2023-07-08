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
    let dates = "2020-02-06";

    const key = id + "-" + dates;

    const file = track.album.images[0].url;

    const session = await Auth.currentSession();
    const accessToken = session.getAccessToken().getJwtToken();

    const query = mutations.createEntry;
    const endpoint = ENDPOINT_TEMP + "/graphql";
    const variables = {
      input: {
        date: dates,
        type: "entry",
        contentType: "song",
        songLink: track.external_urls.spotify,
        name: track.name,
        artists: artistList,
        mediaLink: { bucket: "memos3", region: "us-east-1", key: key },
      },
    };

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    };

    const request1Options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: file,
    };

    try {
      // const store = await Storage.put(key, localUri.uri)
      // console.log(store)
      const store = await fetch(
        `${ENDPOINT_TEMP_STORE}/public/${key}`,
        request1Options
      );
      console.log(JSON.stringify(store));
      const query = await fetch(endpoint, requestOptions);
      console.log(JSON.stringify(query));
      // const data = await response.json();
      // console.log(data)
      // console.log(response)
    } catch (error) {
      console.log(error);
      // Handle any errors
    }

    console.log(track.album.images[0].url);
    console.log(artistList);
    console.log(track.name);
    console.log(track.external_urls.spotify);

    router.push("/");
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
