import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useCallback } from "react";
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync(); //loading 
const Layout = () => {
    const [fontsLoaded] = useFonts({
        InterRegular: require('../assets/fonts/Inter-Regular.ttf'),
        InterMedium: require('../assets/fonts/Inter-Medium.ttf')
    })

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            //only show if fonts loaded
            await SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) return null;

    return <Stack onLayout={onLayoutRootView} />
}

export default Layout;