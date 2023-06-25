
import { Text, View, SafeAreaView } from 'react-native'
import { Stack } from 'expo-router'
import SearchBar from '../../components/music/searchBar'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'



const musicSearch = () => {
    const [tracks, setTracks] = useState([])

    const retrieveTokens = async (name) => {

        try {
            const data = await AsyncStorage.getItem(name)

            return data

            //if you can't retrieve data then login again??

        } catch (error) {
            //was not able to retrieve data

        }

    }


    const getTracks = async () => {

        const token = await retrieveTokens('token')

        const tracks = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {

            headers: {
                Authorization: 'Bearer ' + token
            }
        })

        if (!tracks.ok) {
            console.log(tracks)
            console.log('no data')
        } else {
            const songData = await tracks.json()
            setTracks(songData)
            console.log('songdata')
            // songData.items.map((item) => {
            //     console.log(item.name)
            // })
        }
    }

    useEffect(() => {
        getTracks()

    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <Stack.Screen options={{ headerShown: false }} />

            <SearchBar data={tracks} />



        </SafeAreaView>


    )
}


export default musicSearch;