import {
    TouchableOpacity,
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Image,
    Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, CameraType } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import * as VideoThumbnails from "expo-video-thumbnails";
import { TransitionPresets } from "@react-navigation/stack";
import { API, Auth, Storage } from "aws-amplify";
import * as mutations from "../../src/graphql/mutations";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Video = () => {
    const router = useRouter();
    const [cameraRef, setCameraRef] = useState(null);
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [recording, setRecording] = useState(false);
    const [activeButton, setActiveButton] = useState("picture"); // or video mode
    const [firstImg, setFirstImg] = useState();
    const [id, setID] = useState("");

    // Retrieve Cognito user ID
    useEffect(() => {
        Auth.currentUserInfo()
            .then((user) => {
                setID(user.attributes.sub);
            })
            .catch((error) => {
                console.log("Auth Error", error);
            });
    }, []);

    // Retrieves a screenshot of first picture/video in camera roll
    useEffect(() => {
        (async () => {
            try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status) {

                    const { assets } = await MediaLibrary.getAssetsAsync({
                        first: 1,
                        mediaType: ["photo", "video"],
                        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                    });

                    if (assets.length > 0) {
                        const media = assets[0];

                        if (media.mediaType == "photo") {
                            setFirstImg(media.uri);
                        } else if (media.mediaType == "video") {
                            const fileUri = await MediaLibrary.getAssetInfoAsync(media.id);
                            generateThumbnail(fileUri.localUri);
                        } else {
                            console.log("No media found in camera roll");
                        }
                    }
                }
            } catch (e) {
                console.log('Error with MediaLibrary', e)
            }

        })();
    }, []);


    // Create video thumbnail that will be shown in bottom left corner
    const generateThumbnail = async (uriVid) => {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(uriVid, {
                time: 100,
            });
            setFirstImg(uri);
        } catch (e) {
            console.warn(e);
        }
    };

    // Change camera orientation
    const toggleCamera = async () => {
        setType((current) =>
            current === CameraType.back ? CameraType.front : CameraType.back
        );

        setRecording(false);
    };

    // Open user's camera roll and allow them to pick an image/video for their daily entry
    const pickMedia = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: false,
            // aspect: [5, 3],
            quality: 1,
        });

        if (!result.canceled) {
            addEntry(result.assets[0].uri);
        }
    };


    // Add video/camera entry to calendar
    const addEntry = async (imagePath) => {
        let yourDate = new Date();
        let entryDate = yourDate.toISOString().split("T")[0];

        // Extract file extension
        const imageExt = imagePath.split(".").pop();

        // Determine Media Type
        let type = "";
        if (activeButton == "picture") {
            type = "image";
        } else {
            type = "video";
        }

        const imageMime = `${type}/${imageExt}`;

        try {
            let picture = await fetch(imagePath);
            picture = await picture.blob();
            const imageData = new File([picture], `${key}.${imageExt}`);

            const key = id + "-" + entryDate + "." + imageExt;

            const store = await Storage.put(key, imageData, {
                contentType: imageMime,
            });

            const response = await API.graphql({
                query: mutations.createEntry,
                variables: {
                    input: {
                        date: entryDate,
                        type: "entry",
                        contentType: activeButton,
                        mediaLink: { bucket: "memos3", region: "us-east-1", key: key },
                    },
                },
            });

            console.log(response);
        } catch (error) {
            console.log("Not able to Create Entry: ", error);
            // Create modal to let user know there was a failure
        }

        // Either way return to homepage
        router.replace("/");
    };


    // Check for Camera permissions, if user did not press allow -> 
    // Redirect user to settings to enable camera and media permissions 
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <Stack.Screen
                options={{
                    headerStyle: { backgroundColor: "black" },
                    title: "",
                    header: () => (
                        <View
                            style={
                                activeButton === "picture"
                                    ? styles.headerPicture
                                    : styles.headerVideo
                            }
                        >
                            <Pressable
                                onPress={() => {
                                    router.back()
                                }}
                            >
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={40}
                                    color="white"
                                />
                            </Pressable>
                        </View>
                    ),
                    ...TransitionPresets.ModalSlideFromBottomIOS,
                }}
            />

            {!permission?.granted ?
                <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
                    <Text style={styles.textCamera}>Camera Permissions Not Granted</Text>
                    <TouchableOpacity style={styles.errorBtn} onPress={requestPermission}><Text>Request Permission</Text></TouchableOpacity>
                </View> :

                <View style={{ flex: 1, flexDirection: "column" }}>
                    <Camera
                        style={
                            activeButton === "picture"
                                ? styles.cameraLengthPic
                                : styles.cameraLengthVid
                        }
                        type={type}
                        ref={(ref) => {
                            setCameraRef(ref);
                        }}
                    ></Camera>

                    <View
                        style={
                            activeButton === "video" ? styles.videoBottom : styles.pictureBottom
                        }
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                columnGap: 30,
                                marginTop: 20,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setActiveButton("picture");
                                }}
                            >
                                <Text
                                    style={
                                        activeButton === "picture"
                                            ? styles.activeButton
                                            : styles.normalButton
                                    }
                                >
                                    PICTURE
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setActiveButton("video");
                                }}
                            >
                                <Text
                                    style={
                                        activeButton === "video"
                                            ? styles.activeButton
                                            : styles.normalButton
                                    }
                                >
                                    VIDEO
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                width: "95%",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 20,
                            }}
                        >
                            <TouchableOpacity onPress={pickMedia}>
                                {firstImg && (
                                    <Image
                                        source={{ uri: firstImg }}
                                        style={{ width: 50, height: 50, borderRadius: 10 }}
                                    />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ alignSelf: "center" }}
                                onPress={async () => {
                                    if (cameraRef && activeButton == "picture") {
                                        let photo = await cameraRef.takePictureAsync();
                                        addEntry(photo.uri);
                                    } else if (cameraRef && activeButton == "video") {
                                        if (!recording) {
                                            setRecording(true);
                                            let video = await cameraRef.recordAsync();
                                            addEntry(video.uri);
                                            console.log("Recording Stopped");
                                        } else {
                                            setRecording(false);
                                            cameraRef.stopRecording();
                                        }
                                    }
                                }}
                            >
                                <View style={styles.recordButtonOutline}>
                                    <View
                                        style={
                                            activeButton === "picture"
                                                ? styles.picButton
                                                : recording
                                                    ? styles.recButton
                                                    : styles.vidButton
                                        }
                                    ></View>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={toggleCamera}>
                                <Ionicons name="ios-camera-reverse" size={45} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    videoBottom: {
        backgroundColor: "transparent",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    pictureBottom: {
        backgroundColor: "black",
        alignItems: "center",
    },
    activeButton: {
        color: "orange",
    },
    normalButton: {
        color: "white",
    },

    picButton: {
        borderWidth: 2,
        borderRadius: "100%",
        borderColor: "white",
        height: 50,
        width: 50,
        backgroundColor: "white",
    },

    vidButton: {
        borderWidth: 2,
        borderRadius: "100%",
        borderColor: "red",
        height: 50,
        width: 50,
        backgroundColor: "red",
    },

    recButton: {
        borderWidth: 2,
        borderRadius: 10,
        borderColor: "red",
        height: 30,
        width: 30,
        backgroundColor: "red",
    },

    recordButtonOutline: {
        borderWidth: 2,
        borderRadius: "50%",
        borderColor: "white",
        height: 70,
        width: 70,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },

    cameraLengthPic: {
        height: 550,
    },

    cameraLengthVid: {
        height: 700,
    },

    headerVideo: {
        backgroundColor: "black",
        height: 100,
        justifyContent: "center",
        alignItems: "center",
    },

    headerPicture: {
        backgroundColor: "black",
        height: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    textCamera: {
        color: "white",
        fontFamily: "InterMedium",
        fontSize: 18,
    },
    errorBtn: {
        backgroundColor: "white",
        height: "5%",
        width: "50%",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 150,
        fontFamily: "InterMedium",
        fontSize: 18,
    }

});

export default Video;
