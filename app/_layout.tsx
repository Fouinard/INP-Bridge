import "@/styles/global.css";
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";

export default function RootLayout() {
    const [loaded] = useFonts({
        'Inter': require('../assets/fonts/Inter-Variable.ttf'),
    });
    
    return <Stack
        screenOptions={{
            headerShown: false
        }}
    />;
}
