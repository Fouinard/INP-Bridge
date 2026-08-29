import { View, Text } from "react-native";
import { Calendar, TextBubble, Gears } from "@getpapillon/papicons"

export default function() {
    return (
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
            <View>
                <Calendar size={24} />
                <Text className="text-2xl">Cours</Text>
            </View>
            <View>
                <TextBubble size={24} />
                <Text>Messages</Text>
            </View>
            <View>
                <Gears size={24} />
                <Text>Options</Text>
            </View>
        </View>
    )
}