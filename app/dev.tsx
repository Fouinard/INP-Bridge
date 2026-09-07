import { StorageManager } from "@/services/storage";
import { Link, router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function () {
    return (
        <View className="flex-1 justify-center items-center bg-bg">
            <Text className="text-text">Edit app/index.tsx to edit this screen.</Text>
            <Link href="/dev/test1">
                <Text className="text-text">Test1</Text>
            </Link>
            <Link href="/dev/test2">
                <Text className="text-text">Test2</Text>
            </Link>
            <Link href="/startup">
                <Text className="text-text">Startup</Text>
            </Link>
            <Link href="/(options)/adetreescreen">
                <Text className="text-text">AdetreeScreen</Text>
            </Link>
            <Pressable onPress={async () => {
                await StorageManager.Secure.remove("username");
                await StorageManager.Secure.remove("password");
                router.replace("/startup");
            }}>
                <Text className="text-text">Logout</Text>
            </Pressable>
        </View>
    )
}