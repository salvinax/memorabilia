import { Text, View, SafeAreaView, TextInput, StyleSheet, ScrollView, TouchableOpacity, Keyboard } from "react-native"
import { Stack } from 'expo-router'
import { API, graphqlOperation } from 'aws-amplify'
import { useEffect, useState } from "react"
import * as mutations from '../../src/graphql/mutations'
import * as queries from '../../src/graphql/queries'
import { Auth } from 'aws-amplify';


const Note = () => {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]
    const d = new Date();
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')

    const addEntry = async () => {

        let yourDate = new Date()
        let entryDate = yourDate.toISOString().split('T')[0]

        try {
            const response = await API.graphql({
                query: mutations.createEntry,
                variables: { input: { date: entryDate, type: "entry", contentType: "Text", text: text, titleText: title } }

            })
            console.log(response)

        } catch (error) {
            console.log('Not able to Create Post: ', error)
        }

    }


    // const query = mutations.createUser

    // const requestOptions = {
    //     method: 'POST',
    //     headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ query, variables }),
    // };

    // try {
    //     console.log('we trying')
    //     const response = await fetch(endpoint, requestOptions);
    //     // const data = await response.json();
    //     // Process the response data
    //     console.log(response)
    // } catch (error) {
    //     console.log(error)
    //     // Handle any errors
    // }

    return (

        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <Stack.Screen options={{
                headerStyle: { backgroundColor: 'black' }, headerRight: () => (<TouchableOpacity style={styles.doneBtn} onPress={() => { Keyboard.dismiss() }} />
                ), headerTitle: () => (<TouchableOpacity style={styles.doneBtn} onPress={addEntry} />), headerShadowVisible: false
            }} />
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