import { Button, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
    return (
        <View className="flex-1 justify-center items-center bg-gray-800">
            <Text className="text-white">Edit app/index.tsx to edit this screen.</Text>
            <Link href="/dev/test1" className="text-white">
               Test1
            </Link>
            <Link href="/dev/test2" className="text-white">
               Test2
            </Link>
        </View>
    );
}
