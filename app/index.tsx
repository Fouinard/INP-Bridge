import { Text, View } from "react-native";
import BottomNavBar from "@/components/BototmNavBar";

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
            <BottomNavBar />
        </View>
    );
}
