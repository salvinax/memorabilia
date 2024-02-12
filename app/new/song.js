import { Text, View, SafeAreaView } from 'react-native'
import { Stack } from 'expo-router'
import SearchBar from '../../components/music/searchBar'
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TransitionPresets } from '@react-navigation/stack';

// Search Music on Spotify
const MusicSearch = () => {
    const [tracks, setTracks] = useState([])

    useEffect(() => {
        (async () => {

            try {
                const token = await AsyncStorage.getItem('token')
                const tracks = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })

                if (!tracks.ok) {
                    throw new Error(tracks.statusText)
                }

                const songData = await tracks.json()

                songData.items = songData.items.filter((item, index) => {
                    return index == songData.items.findIndex(obj => {
                        return obj.track.id === item.track.id
                    })
                })

                setTracks(songData)

            } catch (error) {
                console.log('ERROR retrieving recently played songs: ', error)
            }
        })()
    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
            <Stack.Screen options={{ headerShown: false, ...TransitionPresets.ModalSlideFromBottomIOS, }} />
            <SearchBar data={tracks} />
        </SafeAreaView>
    )
}


export default MusicSearch;