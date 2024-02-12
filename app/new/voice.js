import {
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Pressable,
    Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Stack, useRouter } from "expo-router";
import { icons } from "../../constants";
import { Auth, Storage, API } from "aws-amplify";
import * as mutations from "../../src/graphql/mutations";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TransitionPresets } from "@react-navigation/stack";


// Create an Audio Journal Entry 

const Voice = () => {
    const router = useRouter();
    const [recording, setRecording] = useState();
    const [duration, setDuration] = useState(0);
    const [id, setID] = useState("");

    // Get user ID to store multimedia file in cloud
    useEffect(() => {
        Auth.currentUserInfo()
            .then((user) => {
                setID(user.attributes.sub);
            })
            .catch((error) => {
                console.log("Auth Error", error);
            });
    }, []);

    // Add Audio Journal Entry to Cloud
    const addEntry = async (audioUri) => {
        let yourDate = new Date();
        // let entryDate = yourDate.toISOString().split("T")[0];
        let entryDate = '2023-07-15'
        const imageExt = audioUri.split(".").pop();
        const audioMime = `audio/${imageExt}`;

        const key = id + "-" + entryDate + "." + imageExt;

        let audio = await fetch(audioUri);
        audio = await audio.blob();
        const audioData = new File([audio], `${key}.${imageExt}`);

        try {
            const store = await Storage.put(key, audioData, {
                contentType: audioMime,
            });

            console.log(store);
            const response = await API.graphql({
                query: mutations.createEntry,
                variables: {
                    input: {
                        date: entryDate,
                        type: "entry",
                        contentType: "audio",
                        mediaLink: { bucket: "memos3", region: "us-east-1", key: key },
                    },
                },
            });

            console.log(response);
        } catch (error) {
            console.log("Not able to Create Entry: ", error);
            // Use modal to let user know about error
        }
        router.replace("/");
    };

    // Request Microphone Permissions and Start Recording
    const startRecording = async () => {
        try {
            console.log("Requesting permissions..");
            const { status } = await Audio.requestPermissionsAsync();

            //if permission not granted -- ask user to change settings
            if (status !== "granted") {
                Linking.openSettings();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log("Starting recording..");

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);

            recording.setOnRecordingStatusUpdate((update) => {
                setDuration(update.durationMillis);
            });

            await recording.startAsync();

            console.log("Recording started");
        } catch (err) {
            console.log("Failed to Record", err);
            router.back();
        }
    };

    // Stop Recording
    const stopRecording = async () => {
        console.log("Stopping recording..");

        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        addEntry(uri);
        setRecording(null);
    };

    // Display recording time
    const formatTime = (msec) => {
        const seconds = Math.floor(msec / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""
            }${remainingSeconds}`;
    };

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "black", alignItems: "center" }}
        >
            <Stack.Screen
                options={{
                    headerShown: false,
                    ...TransitionPresets.ModalSlideFromBottomIOS,
                }}
            />

            <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Pressable
                    onPress={() => {
                        router.back();
                    }}
                >
                    <MaterialIcons name="keyboard-arrow-down" size={40} color="white" />
                </Pressable>

                <View style={{ marginTop: 200 }}>
                    <Text style={styles.text}>{formatTime(duration)}</Text>
                    <Image
                        style={{ height: 180, width: 180, marginTop: 20, marginBottom: 20 }}
                        source={icons.waves}
                    />
                    <TouchableOpacity
                        onPress={recording ? stopRecording : startRecording}
                    >
                        <Text style={styles.text}>{recording ? "stop" : "start"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    text: {
        color: "white",
        fontSize: 30,
        fontFamily: "InterMedium",
        textAlign: "center",
    },
    test: {
        width: 50,
        height: 50,
        position: "absolute",
    },
    open: {
        justifyContent: "center",
        alignItems: "center",
    },

    pause: {
        width: 50,
        height: 50,
    },
});
export default Voice;
