import { Button, Text, View } from "react-native";
import BottomNavBar from "@/components/BottomNavBar";
import { Link } from "expo-router";

export default function Index() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Edit app/index.tsx to edit this screen.</Text>
            <Link href="/dev/test1" style={{}}>
               Test1
            </Link>
            <Link href="/dev/test2" style={{}}>
               Test2
            </Link>
            <BottomNavBar />
        </View>
    );
}
