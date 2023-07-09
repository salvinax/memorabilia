import { Text, View, SafeAreaView, TextInput, StyleSheet, ScrollView, TouchableOpacity, Keyboard, Pressable } from "react-native"
import { Stack, useRouter } from 'expo-router'
import { API, graphqlOperation, Auth } from 'aws-amplify'
import { useEffect, useState } from "react"
import * as mutations from '../../src/graphql/mutations'
import { ENDPOINT_TEMP } from '@env';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TransitionPresets } from '@react-navigation/stack';



const Note = () => {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    const d = new Date();
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')

    const router = useRouter()

    const addEntry = async () => {

        // let yourDate = new Date()
        // let entryDate = yourDate.toISOString().split('T')[0]

        // try {
        //     const response = await API.graphql({
        //         query: mutations.createEntry,
        //         variables: { input: { date: entryDate, type: "entry", contentType: "Text", text: text, titleText: title } }

        //     })
        //     console.log(response)

        // } catch (error) {
        //     console.log('Not able to Create Post: ', error)
        // }

        // }


        //ran into issue: local api did not want to connect to expo server on ios device - conflict between emulator localhost and server localhost getting network error
        //could not call locally hosted server from expo
        //solution instead of using API function from aws amplify use fetch instead, and set up a tunnel using ngrok were exposing server on localhost to the web where
        //expo can access it ngrok http 192.168.56.1:20002 => get a link to use as fetch endpoint
        //then i was getting a 404 error i added /graphql to the url and the request went through 

        const session = await Auth.currentSession();
        const accessToken = session.getAccessToken().getJwtToken();


        const query = mutations.createEntry
        const endpoint = ENDPOINT_TEMP + '/graphql'
        const variables = { input: { date: '2020-06-07', type: "entry", contentType: "text", text: text, titleText: title } }

        const requestOptions = {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        };

        try {
            console.log('we trying')
            const response = await fetch(endpoint, requestOptions);
            console.log(JSON.stringify(response))
        } catch (error) {
            console.log(error)
            // Handle any errors
        }

        router.push('/')
    }
    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <Stack.Screen options={{
                headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS,
            }} />
            <View style={{ width: "90%", justifyContent: 'space-between', flexDirection: 'row', alignSelf: 'center', marginTop: 10 }}>
                <TouchableOpacity onPress={addEntry} ><Text style={{ color: 'white', fontFamily: 'InterMedium', fontSize: 20, marginTop: 5 }}>save</Text></TouchableOpacity>
                <Pressable onPress={() => { router.push('/new') }}>

                    <MaterialIcons
                        name="keyboard-arrow-down"
                        size={40}
                        color="white"
                    />
                </Pressable>

            </View>
            <ScrollView style={styles.container}>
                <Text style={styles.dateCtn}>{months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + ' @ ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <TextInput multiline={true} placeholderTextColor={'#808080'} placeholder="your title here..." style={styles.titleInput} value={title} onChangeText={setTitle} />
                <TextInput multiline={true} placeholderTextColor={'#808080'} placeholder="what happened today?" style={styles.textInput} value={text} onChangeText={setText} />
            </ScrollView>
        </SafeAreaView>
    )
}



const styles = StyleSheet.create({

    container: {
        flexDirection: 'column',
        rowGap: 5,
        paddingLeft: 5,
        paddingRight: 5
    },

    titleInput: {
        color: 'white',
        width: "100%",
        paddingLeft: 10,
        fontSize: 30,
        fontFamily: 'InterMedium',
        marginBottom: 10
    },

    textInput: {
        color: 'white',
        height: 20,
        width: "100%",
        fontSize: 15,
        fontFamily: 'InterRegular',
        minHeight: 500,
        paddingLeft: 10,
    },
    dateCtn: {
        color: '#808080',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 15
    },
    doneBtn: {
        color: 'white',
        backgroundColor: 'white',
        height: 20,
        width: 20
    }
})

export default Note