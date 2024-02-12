import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { TransitionPresets } from "@react-navigation/stack";
import { useAuthRequest } from "expo-auth-session";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } from "@env";
import { encode as btoa } from "base-64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Auth } from "aws-amplify";

//https://developer.spotify.com/documentation/web-api/tutorials/code-flow

// endpoints
const discovery = {
    authorizationEndpoint: "https://accounts.spotify.com/authorize",
    tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const EntryPicker = () => {
    const router = useRouter();
    const date = new Date();
    const hours = date.getHours();
    const { width } = Dimensions.get("window");
    const username = useLocalSearchParams();

    const data = [
        {
            id: "spotify",
            message: "sometimes words aren't enough. choose a song on Spotify.",
            path: "/new/song",
        },
        {
            id: "camera",
            message: "a picture is worth 1000 words or so they say.",
            path: "/new/camera",
        },
        {
            id: "pencil-alt",
            message: "words are cool too i guess",
            path: "/new/note",
        },
        {
            id: "microphone",
            message: "too lazy to type? record a voice memo.",
            path: "/new/voice",
        },
    ];

    const [message, setMessage] = useState(data[0].message);

    const changeMessage = (index) => {
        setMessage(data[index].message);
    };

    // Sign out -> Log off and redirect user to Log In page
    async function signOut() {
        try {
            await Auth.signOut({ global: true });
            // keys = await AsyncStorage.getAllKeys() - read storage
            await AsyncStorage.clear();
            router.replace("/logIn");
        } catch (error) {
            console.log("Error signing out: ", error);
        }
    }

    // Define useAuthRequest Hook
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: SPOTIFY_CLIENT_ID,
            scopes: ["user-read-recently-played", "playlist-modify-public"],
            usePKCE: false,
            redirectUri: REDIRECT_URI,
        },
        discovery
    );

    // Use Authentication Code to generate tokens 
    useEffect(() => {
        (async () => {
            if (response?.type === "success") {

                const { code } = response.params;

                try {
                    const credsB64 = btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET);
                    const res = await fetch("https://accounts.spotify.com/api/token", {
                        method: "POST",
                        headers: {
                            Authorization: `Basic ${credsB64}`,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: `grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`,
                    });


                    if (!res.ok) {
                        throw new Error(res.status)
                    }

                    const resJson = await res.json();
                    const {
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        expires_in: expiresIn,
                    } = resJson;

                    const expTime = new Date().getTime() + expiresIn * 1000;
                    //do a function for async storate try and catch errors
                    await AsyncStorage.setItem("token", accessToken);
                    await AsyncStorage.setItem("refreshToken", refreshToken);
                    await AsyncStorage.setItem("expirationToken", expTime.toString());
                    router.push("/new/song");

                } catch (err) {
                    console.log('ERROR WITH OAuth Spotify', err);
                    router.back()
                }
            }
        })()
    }, [response]);



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <Stack.Screen
                options={{
                    headerShown: false,
                    ...TransitionPresets.ModalSlideFromBottomIOS,
                }}
            />
            <View style={styles.modalContent}>
                <View style={{ width: "95%", alignSelf: "center" }}>
                    <View
                        style={{ flexDirection: "row", justifyContent: "space-between" }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontFamily: "InterSemiBold",
                                fontSize: 35,
                                width: "80%",
                            }}
                        >
                            {hours < 12
                                ? "Good Morning " + username.name
                                : hours < 18
                                    ? "Good Afternoon " + username.name
                                    : "Good Evening " + username.name}
                            .
                        </Text>
                        <Pressable
                            onPress={() => {
                                router.push('/');
                            }}
                        >
                            <MaterialIcons
                                name="keyboard-arrow-down"
                                size={40}
                                color="white"
                            />
                        </Pressable>
                    </View>

                    <Text
                        style={{
                            color: "#acacac",
                            fontFamily: "InterMedium",
                            fontSize: 25,
                            marginTop: 60,
                            marginBottom: 20,
                            width: "100%",
                            textAlign: "center",
                        }}
                    >
                        how do you want to journal today?
                    </Text>
                </View>

                <Carousel
                    style={{
                        width: width,
                        height: 330,
                        justifyContent: "center",
                    }}
                    loop
                    width={340}
                    height={340}
                    autoPlay={false}
                    data={data}
                    mode="parallax"
                    scrollAnimationDuration={1000}
                    onSnapToItem={changeMessage}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#181818",
                                width: 300,
                                height: 300,
                                borderRadius: 50,
                                justifyContent: "center",
                                alignItems: "center",
                                alignSelf: "center",
                            }}
                            onPress={() => {
                                if (item.id == "spotify") {
                                    promptAsync();
                                } else {
                                    router.push(item.path);
                                }
                            }}
                        >
                            <FontAwesome5 name={item.id} size={200} color="#F8F8F8" />
                        </TouchableOpacity>
                    )}
                />

                <Text
                    style={{
                        color: "white",
                        fontFamily: "InterMedium",
                        fontSize: 20,
                        alignSelf: "center",
                        width: "80%",
                        textAlign: "center",
                        marginTop: 20,
                    }}
                >
                    {message}
                </Text>
                <TouchableOpacity onPress={signOut}>
                    <Text
                        style={{
                            color: "white",
                            fontSize: 20,
                            textAlign: "center",
                            marginTop: 100,
                        }}
                    >
                        sign out
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        height: "100%",
        width: "100%",
        backgroundColor: "black",
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
        position: "absolute",
        bottom: 0,
    },
    titleContainer: {
        height: "10%",
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 30,
    },

    pickerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 50,
        paddingVertical: 20,
    },
});

export default EntryPicker;
