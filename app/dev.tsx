import { Link, router } from "expo-router";
import { View, Text, Pressable } from "react-native";
import * as SecureStore from 'expo-secure-store';

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
            <Pressable onPress={async () => {
                await SecureStore.deleteItemAsync("username");
                await SecureStore.deleteItemAsync("password");
                router.replace("/startup");
            }}>
                <Text className="text-text">Logout</Text>
            </Pressable>
        </View>
    )
}