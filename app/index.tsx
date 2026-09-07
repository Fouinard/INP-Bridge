import { StorageManager } from "@/services/storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        const checkLogins = async () => {
            const username = await StorageManager.Secure.get("username");
            const password = await StorageManager.Secure.get("password");
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