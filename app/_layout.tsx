import BottomNavBar from "@/components/BottomNavBar";
import { StartupProvider } from "@/components/contexts/StartupContext";
import { StorageManager } from "@/services/storage";
import "@/styles/global.css";
import { toastConfig } from "@/styles/ToastsStyle";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router"; // Import de Slot
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

// Garde l'écran natif figé
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [dbReady, setDbReady] = useState(false);
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    const [fontLoaded] = useFonts({
        'Inter': require('../assets/fonts/Inter-Variable.ttf'),
    });

    useEffect(() => {
        const prepareApp = async () => {
            try {
                const username = await StorageManager.Secure.get("username");
                const password = await StorageManager.Secure.get("password");
                const classId = await StorageManager.Default.get("ADEClassTreeList");
                if (!username && !password) {
                    setInitialRoute("startup");
                } else if (!classId) {
                    setInitialRoute("(options)/adetreescreen");
                } else {
                    setInitialRoute("(schedule)/schedule");
                }
            } catch (error) {
                console.error(error);
                setInitialRoute("startup");
            } finally {
                // setInitialRoute("startup");
                setDbReady(true);
            }
        };
        prepareApp();
    }, []);

    // TANT QUE CE N'EST PAS PRÊT : On renvoie "null", l'écran reste bloqué sur le Splash Screen natif
    if (!dbReady || !fontLoaded || !initialRoute) {
        return null;
    }

    return (
        <StartupProvider onReady={() => SplashScreen.hideAsync()}>
                <View className="flex-1 max-w-screen" style={{ backgroundColor: "#121212" }}>
                    <Stack 
                        initialRouteName={initialRoute}
                        screenOptions={{ 
                            headerShown: false,
                            contentStyle: { backgroundColor: "#121212" },
                        }}
                    />
                    <BottomNavBar />
                    <Toast config={toastConfig} />
                </View>
        </StartupProvider>
    );
}
