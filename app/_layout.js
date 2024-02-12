import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import { useCallback } from "react";
import * as SplashScreen from 'expo-splash-screen'

const Layout = () => {

    SplashScreen.preventAutoHideAsync()

    const [fontsLoaded] = useFonts({
        InterRegular: require('../assets/fonts/Inter-Regular.ttf'),
        InterMedium: require('../assets/fonts/Inter-Medium.ttf'),
        InterSemiBold: require('../assets/fonts/Inter-SemiBold.ttf'),
        InterBold: require('../assets/fonts/Inter-Bold.ttf')
    })

    const onLayoutRootView = useCallback(async () => {

        if (fontsLoaded) {
            await new Promise(resolve => setTimeout(resolve, 300));

            await SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) return null;

    return <Stack onLayout={onLayoutRootView} />
}

export default Layout;
