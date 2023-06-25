import { Text, View, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Audio } from 'expo-av'
import { Stack, useRouter } from 'expo-router';
import { Linking } from 'react-native';
import CircularProgress, { ProgressRef } from 'react-native-circular-progress-indicator';
// import RNFS from 'react-native-fs'
import { icons } from '../../constants';



const Voice = () => {
    const router = useRouter()
    const [recording, setRecording] = useState();
    const [duration, setDuration] = useState(0);
    const [sound, setSound] = useState();
    const [soundTime, setSoundTime] = useState()
    const [pause, setPause] = useState(true)
    const progressRef = useRef(null);
    const [finish, setFinish] = useState(false)


    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);




    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            const { status } = await Audio.requestPermissionsAsync();

            //if permission not granted -- ask user to change settings
            if (status !== "granted") {
                Linking.openSettings();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });




            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setDuration(0);


            recording.setOnRecordingStatusUpdate((update) => {
                setDuration(update.durationMillis)
            })


            await recording.startAsync();

            console.log('Recording started');

        } catch (err) {
            console.log('Failed to Record', err)
        }
    }

    const playRecording = async (uri) => {
        //function that playback
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync({ uri: uri })
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        setSound(sound);
        const { durationMillis } = await sound.getStatusAsync();
        setSoundTime(durationMillis);
        setPause(false);
        console.log('Playing Sound')
        await sound.playAsync();
    }

    const onPlaybackStatusUpdate = async (playbackStatus) => {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
            console.log('sound is done playing')
            setFinish(true)
            setPause(true)
        }

    }




    const stopRecording = async () => {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        playRecording(uri);
    }

    const formatTime = (msec) => {
        const seconds = Math.floor(msec / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const playBack = async () => {
        //if track is currently playing
        if (!pause && !finish) {
            await sound.pauseAsync()
            progressRef.current.pause();
            setPause(true)
        } else if (pause && !finish) {
            //track is paused and we want to continue
            await sound.playAsync()
            progressRef.current.play();
            setPause(false)
        } else if (pause && finish) {
            await sound.replayAsync()
            setFinish(false)
            setPause(false)
            progressRef.current.reAnimate();

        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black', alignItems: 'center' }}>
            <Stack.Screen options={{
                headerShown: false
            }} />

            <Text style={styles.text}>{formatTime(duration)}</Text>
            <TouchableOpacity onPress={recording ? stopRecording : startRecording}><Text style={styles.text}>{recording ? 'stop' : 'start'}</Text></TouchableOpacity>

            {sound ? <View >
                <View style={styles.open}>
                    <CircularProgress
                        ref={progressRef}
                        value={100}
                        radius={120}
                        duration={soundTime}
                        activeStrokeColor='white'
                        showProgressValue={false}
                        inActiveStrokeWidth={15}
                        activeStrokeWidth={15}
                        inActiveStrokeColor="grey"
                        inActiveStrokeOpacity={0.3}
                    />
                    <TouchableOpacity onPress={playBack} style={styles.test}>
                        <Image style={styles.pause} source={pause ? icons.play : icons.pause} /></TouchableOpacity>
                </View>
                <View>
                    <TouchableOpacity><Text style={styles.text}>add</Text></TouchableOpacity>
                    {/* button to add to database */}
                </View>
            </View>
                : null}
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({

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
        justifyContent: 'center',
        alignItems: 'center'
    },

    pause: {
        width: 50,
        height: 50
    }

})
export default Voice