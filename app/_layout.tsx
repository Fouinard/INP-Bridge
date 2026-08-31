import BottomNavBar from "@/components/BottomNavBar";
import "@/styles/global.css";
import { toastConfig } from "@/styles/ToastsStyle";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { View } from "react-native";
import Toast from "react-native-toast-message";

// export const unstable_settings = {
//     initialRouteName: "(schedule)/schedule",
// }

export default function RootLayout() {
    const [loaded] = useFonts({
        'Inter': require('../assets/fonts/Inter-Variable.ttf'),
    });
    
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
