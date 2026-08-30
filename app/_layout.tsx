import BottomNavBar from "@/components/BottomNavBar";
import "@/styles/global.css";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
    const [loaded] = useFonts({
        'Inter': require('../assets/fonts/Inter-Variable.ttf'),
    });
    
    return <View className="flex-1">
        <Stack
            screenOptions={{
                headerShown: false
            }}
        />
        <BottomNavBar />
    </View>;
}
