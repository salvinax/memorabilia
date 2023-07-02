import { TouchableOpacity, View, Text, Button, SafeAreaView, StyleSheet, ScrollView, Image, FlatList } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Stack } from 'expo-router'
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { backgroundColor } from 'react-native-calendars/src/style';
import * as MediaLibrary from 'expo-media-library'
import * as VideoThumbnails from 'expo-video-thumbnails';

import * as FileSystem from 'expo-file-system'




const Video = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraRef, setCameraRef] = useState(null)
    const [type, setType] = useState(CameraType.back);
    const [recording, setRecording] = useState(false)
    const [activeButton, setActiveButton] = useState('picture');
    const [firstImg, setFirstImg] = useState()

    const [media, setMedia] = useState()

    useEffect(() => {
        const getFirstImg = async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            const { assets } = await MediaLibrary.getAssetsAsync({ first: 1, mediaType: ['photo', 'video'], sortBy: [[MediaLibrary.SortBy.creationTime, false]] });

            if (assets.length > 0) {
                const media = assets[0]
                if (media.mediaType == 'photo') {
                    setFirstImg(media.uri)
                } else if (media.mediaType == 'video') {
                    const fileUri = await MediaLibrary.getAssetInfoAsync(media.id)
                    generateThumbnail(fileUri.localUri)
                } else {
                    console.log('no media found in camera roll')
                }

            }
        }
        getFirstImg()
    }, [])

    const generateThumbnail = async (uriVid) => {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(
                uriVid,
                {
                    time: 10,
                }
            );
            setFirstImg(uri);
        } catch (e) {
            console.warn(e);
        }
    };



    const toggleCamera = async () => {
        setType(current => current === CameraType.back
            ? CameraType.front
            : CameraType.back
        );
    }

    const pickMedia = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    }



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>

            <Stack.Screen options={{
                headerStyle: { backgroundColor: 'black' }, title: '', header: () => (
                    <View style={activeButton === "picture" ? styles.headerPicture : styles.headerVideo}></View>
                )
            }} />
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <Camera style={activeButton === "picture" ? styles.cameraLengthPic : styles.cameraLengthVid} type={type} ref={ref => {
                    setCameraRef(ref);
                }}>
                </Camera>

                <View style={activeButton === "video" ? styles.videoBottom : styles.pictureBottom}>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', columnGap: 30, marginTop: 20 }}>
                        <TouchableOpacity onPress={() => { setActiveButton('picture') }}><Text style={activeButton === "picture" ? styles.activeButton : styles.normalButton}>PICTURE</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { setActiveButton('video') }}><Text style={activeButton === "video" ? styles.activeButton : styles.normalButton}>VIDEO</Text></TouchableOpacity>
                    </View>

                    {/* style={[styles.button, activeButton === 'camera' && styles.activeButton]} */}


                    <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                        <TouchableOpacity onPress={pickMedia}>
                            {firstImg && <Image source={{ uri: firstImg }} style={{ width: 50, height: 50, borderRadius: 10 }} />}
                        </TouchableOpacity>


                        <TouchableOpacity style={{ alignSelf: 'center' }} onPress={async () => {
                            if (cameraRef && activeButton == "picture") {
                                let photo = await cameraRef.takePictureAsync();
                            } else if (cameraRef && activeButton == "video") {
                                if (!recording) {
                                    setRecording(true);
                                    let video = await cameraRef.recordAsync();
                                    console.log("video", video);
                                } else {
                                    setRecording(false);
                                    cameraRef.stopRecording();
                                }
                            }
                        }}>
                            <View style={styles.recordButtonOutline}
                            >
                                <View style={activeButton === "picture" ? styles.picButton : recording ? styles.recButton : styles.vidButton} >
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleCamera}>
                            <Ionicons name='ios-camera-reverse' size={45} color="white" />
                        </TouchableOpacity>
                    </View>

                </View>
            </View >
        </SafeAreaView >
    );



}

const styles = StyleSheet.create({
    videoBottom: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200
    },
    pictureBottom: {
        backgroundColor: 'black',
        alignItems: 'center'

    },
    activeButton: {
        color: 'orange',
    },
    normalButton: {
        color: 'white'
    },

    picButton: {
        borderWidth: 2,
        borderRadius: '100%',
        borderColor: 'white',
        height: 50,
        width: 50,
        backgroundColor: 'white'

    },

    vidButton: {
        borderWidth: 2,
        borderRadius: '100%',
        borderColor: 'red',
        height: 50,
        width: 50,
        backgroundColor: 'red'
    },

    recButton: {
        borderWidth: 2,
        borderRadius: 10,
        borderColor: 'red',
        height: 30,
        width: 30,
        backgroundColor: 'red'
    },

    recordButtonOutline: {

        borderWidth: 2,
        borderRadius: "50%",
        borderColor: 'white',
        height: 70,
        width: 70,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'


    },

    cameraLengthPic: {
        height: 550

    },

    cameraLengthVid: {
        height: 700

    },

    headerVideo: {
        backgroundColor: 'black',
        height: 100

    },

    headerPicture: {
        backgroundColor: 'black',
        height: 120

    }

})




export default Video