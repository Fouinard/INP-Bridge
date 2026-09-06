import BottomNavBar from "@/components/BottomNavBar";
import "@/styles/global.css";
import { toastConfig } from "@/styles/ToastsStyle";
import { useFonts } from 'expo-font';
import { Stack, useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export default function RootLayout() {
    const [ready, setReady] = useState(false);
    const router = useRouter();
    const [loaded] = useFonts({
        'Inter': require('../assets/fonts/Inter-Variable.ttf'),
    });

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const username = await SecureStore.getItemAsync("username");
                const password = await SecureStore.getItemAsync("password");

                if (username && password) {
                    router.replace("/schedule");
                } else {
                    router.replace("/startup");
                }
            } catch (error) {
                console.error(error);
                router.replace("/startup");
            } finally {
                setReady(true);
                await SplashScreen.hideAsync();
            }
        };

        checkLogin();
    }, []);

    if (!ready) {
        return null;
    }

    return <View className="flex-1 max-w-screen">
        <Stack
            screenOptions={{
                headerShown: false
            }}
        />
        <BottomNavBar />
        <Toast config={toastConfig} />
    </View>;
}
