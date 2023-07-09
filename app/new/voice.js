import { Text, View, Image, TouchableOpacity, StyleSheet, SafeAreaView, Pressable } from 'react-native'
import { useState, useEffect, useRef } from 'react'
import { Audio } from 'expo-av'
import { Stack, useRouter } from 'expo-router';
import { Linking } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { icons } from '../../constants';
import { Auth, Storage, API } from "aws-amplify"
import * as mutations from '../../src/graphql/mutations'
import { ENDPOINT_TEMP, ENDPOINT_TEMP_STORE } from '@env';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TransitionPresets } from '@react-navigation/stack';





const Voice = () => {
    const router = useRouter()
    const [recording, setRecording] = useState();
    const [duration, setDuration] = useState(0);
    const [sound, setSound] = useState();
    const [soundTime, setSoundTime] = useState()

    const [id, setID] = useState("")


    useEffect(() => {
        Auth.currentUserInfo().then((user) => {
            setID(user.attributes.sub)

        }).catch((error) => {
            console.log('Auth Error', error)
        })


    }, [])




    const addEntry = async () => {

        // let yourDate = new Date()
        // let entryDate = yourDate.toISOString().split('T')[0]
        console.log('we here')
        router.push('/')

        // let dates = '2020-02-01'

        // const key = id + '-' + dates

        // const file = uri
        // console.log(file)

        // const session = await Auth.currentSession();
        // const accessToken = session.getAccessToken().getJwtToken();

        // const query = mutations.createEntry
        // const endpoint = ENDPOINT_TEMP + '/graphql'
        // const variables = { input: { date: dates, type: "entry", contentType: 'audio', mediaLink: { bucket: "memos3", region: "us-east-1", key: key } } }

        // const requestOptions = {
        //     method: 'POST',
        //     headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ query, variables }),
        // };

        // const request1Options = {
        //     method: 'POST',
        //     headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        //     body: file,
        // };


        // try {
        //     // const store = await Storage.put(key, localUri.uri)
        //     // console.log(store)
        //     const store = await fetch(`${ENDPOINT_TEMP_STORE}/public/${key}`, request1Options);
        //     console.log(JSON.stringify(store))
        //     const query = await fetch(endpoint, requestOptions);
        //     console.log(JSON.stringify(query))
        //     // const data = await response.json();
        //     // console.log(data)
        //     // console.log(response)
        // } catch (error) {
        //     console.log(error)
        //     // Handle any errors
        // }






        // try {
        //     const store = await Storage.put(key, file)
        //     console.log(store)
        //     const response = await API.graphql({
        //         query: mutations.createEntry,
        //         variables: { input: { date: dates, type: "entry", contentType: "Audio", mediaLink: { bucket: "memos3", region: "us-east-1", key: key } } },
        //     })
        //     console.log(response)

        // } catch (error) {
        //     console.log('Not able to Create Post: ', error)
        // }

    }


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




    const stopRecording = async () => {
        console.log('Stopping recording..');

        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        addEntry(uri)
        setRecording(undefined);
    }

    const formatTime = (msec) => {
        const seconds = Math.floor(msec / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black', alignItems: 'center' }}>
            <Stack.Screen options={{
                headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS,
            }} />


            <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                <Pressable onPress={() => { router.push('/new') }}>

                    <MaterialIcons
                        name="keyboard-arrow-down"
                        size={40}
                        color="white"
                    />


                </Pressable>




                <View style={{ marginTop: 200 }}>
                    <Text style={styles.text}>{formatTime(duration)}</Text>
                    <Image style={{ height: 180, width: 180, marginTop: 20, marginBottom: 20 }} source={icons.waves} />
                    <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
                        <Text style={styles.text}>{recording ? 'stop' : 'start'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({

    text: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'InterMedium',
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