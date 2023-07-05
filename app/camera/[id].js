import { TouchableOpacity, View, Text, Button, SafeAreaView, StyleSheet, ScrollView, Image, FlatList } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Stack } from 'expo-router'
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library'
import * as VideoThumbnails from 'expo-video-thumbnails';
import { TransitionPresets } from '@react-navigation/stack';
import { API, Auth, Storage } from 'aws-amplify'
import * as mutations from '../../src/graphql/mutations'
import { ENDPOINT_TEMP_STORE, ENDPOINT_TEMP } from '@env';

const Video = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraRef, setCameraRef] = useState(null)
    const [type, setType] = useState(CameraType.back);
    const [recording, setRecording] = useState(false)
    const [activeButton, setActiveButton] = useState('picture');
    const [firstImg, setFirstImg] = useState()
    const [id, setID] = useState("")

    useEffect(() => {
        Auth.currentUserInfo().then((user) => {
            setID(user.attributes.sub)

        }).catch((error) => {
            console.log('Auth Error', error)
        })


    }, [])

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

        setRecording(false);
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
            addEntry(result.assets[0].uri);
        }
    }


    const addEntry = async (localUri) => {

        // let yourDate = new Date()
        // let entryDate = yourDate.toISOString().split('T')[0]

        let dates = '2020-12-26'

        const key = id + '-' + dates

        // const file = 'C:/Users/salvi/Downloads/videoplayback.mp4'
        const file = localUri.uri

        console.log(localUri.uri)

        // try {
        //     const store = await Storage.put(key, file)
        //     console.log(store)
        //     const response = await API.graphql({
        //         query: mutations.createEntry,
        //         variables: { input: { date: dates, type: "entry", contentType: activeButton, mediaLink: { bucket: "memos3", region: "us-east-1", key: key } } },
        //     })
        //     console.log(response)

        // } catch (error) {
        //     console.log('Not able to Create Post: ', error)
        // }

        const session = await Auth.currentSession();
        const accessToken = session.getAccessToken().getJwtToken();

        const query = mutations.createEntry
        const endpoint = ENDPOINT_TEMP + '/graphql'
        const variables = { input: { date: dates, type: "entry", contentType: activeButton, mediaLink: { bucket: "memos3", region: "us-east-1", key: key } } }

        const requestOptions = {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        };

        const request1Options = {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: file,
        };



        try {
            // const store = await Storage.put(key, localUri.uri)
            // console.log(store)
            const store = await fetch(`${ENDPOINT_TEMP_STORE}/public/${key}`, request1Options);
            console.log(JSON.stringify(store))
            const query = await fetch(endpoint, requestOptions);
            console.log(JSON.stringify(query))
            // const data = await response.json();
            // console.log(data)
            // console.log(response)
        } catch (error) {
            console.log(error)
            // Handle any errors
        }

    }



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>

            <Stack.Screen options={{
                headerStyle: { backgroundColor: 'black' }, title: '', header: () => (
                    <View style={activeButton === "picture" ? styles.headerPicture : styles.headerVideo}></View>
                ), ...TransitionPresets.ModalSlideFromBottomIOS,
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
                                addEntry(photo)
                            } else if (cameraRef && activeButton == "video") {
                                if (!recording) {
                                    setRecording(true);
                                    let video = await cameraRef.recordAsync();
                                    addEntry(video)
                                    console.log('we finished recording')
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