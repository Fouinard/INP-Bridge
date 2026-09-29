// import { formatTime, getDurationFormatted } from "@/utils/Time";
import { Lesson } from "@/services/ade/schedule/Schedule";
import { formatTime } from "@/utils/Time";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface MultipleLessonsData {
    startDate: Date,
    endDate: Date,
    lessons: Lesson[]
}

export default function ({ startDate, endDate }: MultipleLessonsData) {
    return (
        <Pressable className="w-full h-32" onPress={() => {
            router.push({
                pathname: "/(schedule)/multipleLessons"
            })
        }}>
            <View className="flex flex-row w-full gap-4 h-32">
                <View className="flex flex-col items-end w-1/5 h-full">
                    <Text className="text-primary font-inter font-medium text-xl">{formatTime(startDate)}</Text>
                    <Text className="text-primary font-inter font-extralight text-base">{formatTime(endDate)}</Text>
                </View>
                <View className="flex-1 gap-3 flex-row rounded-[20px] h-full p-3" style={{ backgroundColor: "#ffffff73" }}>
                    <View className="h-full w-[6px] rounded-full" style={{ backgroundColor: "#ffffffff" }}></View>
                    <View className="flex-1 h-full flex-col justify-center">
                        <Text className="text-text text-lg">Plusieurs cours</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}