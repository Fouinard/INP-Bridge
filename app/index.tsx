import { Button, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
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
        </View>
    );
}
