import { Text, View } from "react-native";
import BottomNavBar from "@/components/BottomNavBar";

export default function TestPage1() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text>Page de tests (composants etc)</Text>
        </View>
    );
}
