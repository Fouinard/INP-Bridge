import formatTime from "@/utils/formatTime";
import { ColorValue, Text, View } from "react-native";

interface ClassData {
    startDate: Date,
    endDate: Date,
    teacher: string,
    subject: string,
    room: string
}

interface ClassProps {
    classData: ClassData,
    backgroundColor: ColorValue,
    accentColor: ColorValue
}

export default function(props: ClassProps) {
    return (
        <View className="flex flex-row">
            <View className="flex flex-col items-end w-1/5 height-full">
                <Text className="font-inter font-medium text-xl">{formatTime(props.classData.startDate)}</Text>
                <Text className="font-inter font-extralight text-base">{formatTime(props.classData.endDate)}</Text>
            </View>
            <View className="min-h-0 grow-1 rounded-[20px] height-full" style={{ backgroundColor: props.backgroundColor }}>
                
            </View>
        </View>
    )
}