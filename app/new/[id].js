import { Modal, View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useState, useEffect } from "react";
import { SimpleLineIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter, Stack } from "expo-router";
import { TransitionPresets } from "@react-navigation/stack";

const EntryPicker = () => {
    const router = useRouter();
    const date = new Date()
    const hours = date.getHours()
    const data = [
        {
            id: "spotify",
            message: "sometimes words aren't enough. choose a song on Spotify.",
            path: "/music/",
        },
        {
            id: "camera",
            message: "a picture is worth 1000 words or so they say.",
            path: "/camera/",
        },
        { id: "pencil-alt", message: "words are cool too i guess", path: "/note/" },
        {
            id: "microphone",
            message: "too lazy to type? record a voice memo.",
            path: "/voice/",
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
                            {hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening'} Salvina.
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
                                router.push(item.path + "4");
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
                        marginTop: 50
                    }}
                >
                    {message}
                </Text>
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
