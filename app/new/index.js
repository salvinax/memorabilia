import { Modal, View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useState, useEffect } from "react";
import { SimpleLineIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { TransitionPresets } from "@react-navigation/stack";
import * as WebBrowser from 'expo-web-browser'
import { useAuthRequest } from 'expo-auth-session';
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } from '@env';
import { encode as btoa } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Auth } from 'aws-amplify'



WebBrowser.maybeCompleteAuthSession(); //only for web doesn't do anything in native
//https://developer.spotify.com/documentation/web-api/tutorials/code-flow


//endpoint
const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};


const EntryPicker = () => {
    const router = useRouter();
    const date = new Date()
    const hours = date.getHours()
    const userName = useLocalSearchParams()

    console.log(userName)
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
        { id: "pencil-alt", message: "words are cool too i guess", path: "/new/note" },
        {
            id: "microphone",
            message: "too lazy to type? record a voice memo.",
            path: "/new/voice",
        },
    ];
    const { width } = Dimensions.get("window");
    const [message, setMessage] = useState();

    useEffect(() => {
        setMessage(data[0].message);
    }, []);

    const changeMessage = (index) => {
        setMessage(data[index].message);
    };

    async function signOut() {
        try {
            await Auth.signOut();
            router.replace('/logIn')

        } catch (error) {
            console.log('Error signing out: ', error);
        }
    }



    // const generateAuthorizationUrl = () => {
    //     const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
    //     const redirectUri = encodeURIComponent('YOUR_REDIRECT_URI');
    //     const scopes = 'YOUR_SCOPES'; // e.g., 'user-read-private user-read-email'
    //     const authorizationEndpoint = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=token`;

    //     return authorizationEndpoint;
    // };

    const [request, response, promptAsync] = useAuthRequest({
        clientId: SPOTIFY_CLIENT_ID,
        scopes: ['user-read-recently-played', 'playlist-modify-public'],
        usePKCE: false,
        redirectUri: REDIRECT_URI

        //authorization code received
        //to do: get tokens access and refresh

    }, discovery);

    useEffect(() => {
        if (response?.type === 'success') {
            const { code } = response.params;
            getToken(code);
            router.push("/music/" + "4");
        }
    }, [response]);




    const getToken = async (authCode) => {

        try {

            const credsB64 = btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET);

            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${credsB64}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${REDIRECT_URI}`,
            })
            //buffer.toString('base64')

            if (!res.ok) {
                console.log('ERROR')
            } else {

                const resJson = await res.json()

                const {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    expires_in: expiresIn,
                } = resJson;



                const expTime = new Date().getTime() + expiresIn * 1000
                console.log(accessToken)

                //do a function for async storate try and catch errors
                await setTokens('token', accessToken)
                await setTokens('refreshToken', refreshToken)
                await setTokens('expirationToken', expTime.toString())

            }



        } catch (err) {
            console.log(err)

        }
    }

    const setTokens = async (name, value) => {

        try {
            await AsyncStorage.setItem(name, value)

        } catch (error) {
            //was not able to save in async storage
            console.log(error)
        }
    }


    const retrieveTokens = async (name) => {

        try {
            const data = await AsyncStorage.getItem(name)

            return data

            //if you can't retrieve data then login again??

        } catch (error) {
            //was not able to retrieve data

        }

    }





















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
                            {hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon ' + userName.name : 'Good Evening ' + userName.name}.
                        </Text>
                        <Pressable onPress={() => { router.push('/') }}>
                            {/* <SimpleLineIcons name="arrow-down" size={30} color="white" /> */}
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
                    //   modeConfig={{
                    //     parallaxScrollingScale: 0.6,
                    //     parallaxScrollingOffset: 50,
                    //   }}
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
                                if (item.id == 'spotify') {
                                    promptAsync()
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
                        marginTop: 20
                    }}
                >
                    {message}
                </Text>
                <TouchableOpacity onPress={signOut}><Text style={{ color: 'white', fontSize: 20, textAlign: 'center', marginTop: 100 }}>sign out</Text></TouchableOpacity>
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
