
import { Text, SafeAreaView, View, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Pressable, Touchable } from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { FontAwesome5 } from "@expo/vector-icons";
import { Video, ResizeMode, Audio } from 'expo-av';
import CircularProgress from 'react-native-circular-progress-indicator';
import { icons } from '../../constants';
import { useState, useRef, useEffect } from "react"
import { TransitionPresets } from '@react-navigation/stack';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';


const oldEntry = () => {
    const router = useRouter()
    const item = useLocalSearchParams();
    const video = useRef(null);
    const [status, setStatus] = useState({});
    const progressRef = useRef(null);
    const [pause, setPause] = useState(true)
    const [finish, setFinish] = useState(false)
    const [sound, setSound] = useState();
    const [soundTime, setSoundTime] = useState()
    const first = true

    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);



    useEffect(() => {
        if (item.contentType == "audio") {
            loadRecording()
        }

    }, [])

    const playBack = async () => {

        // if (first) {
        //     playRecording()
        // }

        if (!pause && !finish) {
            //pause sound currently playing
            await sound.pauseAsync()
            progressRef.current.pause();
            setPause(true)
        } else if (pause && !finish) {
            //track is paused and we want to continue
            await sound.playAsync()
            progressRef.current.play();
            setPause(false)
        } else if (pause && finish) {
            //restart sound when it ends 
            await sound.replayAsync()
            setFinish(false)
            setPause(false)
            progressRef.current.reAnimate();

        }
    }


    const loadRecording = async (uri) => {
        //function that playback
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync({ uri: 'http://codeskulptor-demos.commondatastorage.googleapis.com/descent/gotitem.mp3' })
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(sound);
        const { durationMillis } = await sound.getStatusAsync();
        setSoundTime(durationMillis);
        progressRef.current.pause();
        setPause(true);
    }

    const onPlaybackStatusUpdate = async (playbackStatus) => {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
            console.log('sound is done playing')
            setFinish(true)
            setPause(true)
        }

    }

    const updateStatus = async (status) => {
        setStatus(() => status)
        if (status.positionMillis === status.durationMillis && video.current) {
            video.current.pauseAsync()
        }
    }





    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
            <Stack.Screen
                options={{
                    headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS
                }}
            />
            {/* for notes */}
            <View style={{ alignSelf: 'center' }}>
                <Pressable onPress={() => { router.push('/') }}>
                    <MaterialIcons
                        name="keyboard-arrow-down"
                        size={40}
                        color="white"
                    />
                </Pressable>
            </View>
            {item?.contentType == "Text" && <ScrollView style={styles.container}>
                <Text style={styles.titleText}>{item.titleText}</Text>
                <Text style={styles.contentText}>{item.text}</Text>
            </ScrollView>}





            {item?.contentType == 'song' && (<View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 100, rowGap: 15 }}>
                <Image style={{ height: 300, width: 300, borderRadius: 20 }} source={{ uri: "https://images.genius.com/3d7f4ece5c38275f6d91a75e31a88992.1000x1000x1.png" }} />
                <Text style={{ color: 'white', fontFamily: 'InterMedium', fontSize: 19 }}>{item.name}</Text>

                <Text style={{ color: "#E6D9D9", fontFamily: 'InterMedium', fontSize: 16, marginBottom: 40 }}>{item.artists}</Text>
                <TouchableOpacity onPress={() => { Linking.openURL('spotify:track:' + item.songLink) }}><FontAwesome5 name="spotify" size={80} color="#F8F8F8" /></TouchableOpacity>
            </View>)}


            {item?.contentType == 'picture' && <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Image style={{ width: '90%', height: "90%", borderRadius: 50 }} resizeMode='cover' source={{ uri: "https://i.pinimg.com/474x/32/9c/8a/329c8abaa2935b0bd1a286a210ab058d.jpg" }} />
            </View>}


            {
                item?.contentType == 'video' &&
                <View style={{ width: 390, height: 700, overflow: 'hidden', borderRadius: 50, alignSelf: 'center', alignItems: 'center', marginTop: 20, justifyContent: 'center' }}>
                    <Video
                        ref={video}
                        style={styles.video}
                        source={
                            require('C:/Users/salvi/repos/memorabilia-app/memorabilia/assets/vid.mp4')
                        }
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        onPlaybackStatusUpdate={updateStatus}
                    />

                    <Pressable onPress={() => status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()} style={{ position: 'absolute' }}>
                        <Ionicons name={status.isPlaying ? 'pause' : 'play'} size={50} color="white" />
                    </Pressable>




                </View>
            }


            {
                item?.contentType == "audio" && sound
                &&
                <View style={styles.open}>
                    <CircularProgress
                        ref={progressRef}
                        value={100}
                        radius={150}
                        duration={soundTime}
                        activeStrokeColor='white'
                        showProgressValue={false}
                        inActiveStrokeWidth={15}
                        activeStrokeWidth={15}
                        inActiveStrokeColor="grey"
                        inActiveStrokeOpacity={0.3}
                    />
                    <TouchableOpacity onPress={playBack} style={styles.test}>
                        <Ionicons name={pause ? 'play' : 'pause'} size={50} color="white" />
                    </TouchableOpacity>

                </View>


            }
        </SafeAreaView >

    )
}

export default oldEntry

const styles = StyleSheet.create({
    video: {
        width: 400,
        height: 700,


    },
    container: {
        flexDirection: 'column',
        rowGap: 5,
        paddingLeft: 5,
        paddingRight: 5,
        marginTop: 60
    },
    titleText: {
        color: 'white',
        width: "100%",
        paddingLeft: 10,
        fontSize: 30,
        fontFamily: 'InterMedium',
        marginBottom: 10

    },

    contentText: {
        color: 'white',
        height: 20,
        width: "100%",
        fontSize: 17,
        fontFamily: 'InterRegular',
        minHeight: 500,
        paddingLeft: 10,
    },


    text: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'InterMedium',
        marginTop: 60,
        textAlign: 'center'
    },
    test: {
        width: 50,
        height: 50,
        position: 'absolute'


    },
    open: {
        height: "90%",
        justifyContent: 'center',
        alignItems: 'center',
    },


})