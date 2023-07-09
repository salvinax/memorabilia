import { Text, View, SafeAreaView } from 'react-native'
import { Stack } from 'expo-router'
import SearchBar from '../../components/music/searchBar'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TransitionPresets } from '@react-navigation/stack';



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

    useEffect(() => {
        getTracks()
    }, [])







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


            // console.log(songData.items)
            // songData.items.map((item) => {
            //     console.log(item.track.id)
            // })

            songData.items = songData.items.filter((item, index) => {
                return index == songData.items.findIndex(obj => {
                    return obj.track.id === item.track.id
                })
            })
            //if indexes don't match up that means that there is already an occurence 


            setTracks(songData)


        }
    }


    //implement authorization code flow


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <Stack.Screen options={{ headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS, }} />

            <SearchBar data={tracks} />



        </SafeAreaView>


    )
}


export default musicSearch;