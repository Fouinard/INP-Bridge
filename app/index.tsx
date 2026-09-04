import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { useEffect } from "react";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const checkLogins = async () => {
            const username = await SecureStore.getItemAsync("username");
            const password = await SecureStore.getItemAsync("password");
            if (!username || !password) {
                router.replace("/startup");
            } else {
                router.replace("/schedule");
            }
        }
        checkLogins();
    }, [])

    return (
        <View className="flex-1 justify-center items-center bg-bg">
            <Text className="text-text">Chargement</Text>
        </View>
    );
}