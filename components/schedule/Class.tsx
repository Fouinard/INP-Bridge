import { getHueFromString, getHueStyle } from "@/utils/RandomColor";
import { formatTime, getDurationFormatted } from "@/utils/Time";
import { Clock, MapPin, User } from "@getpapillon/papicons";
import { useState } from "react";
import { ColorValue, ScrollView, Text, View } from "react-native";

interface ClassData {
    startDate: Date,
    endDate: Date,
    teacher: string,
    subject: string,
    room: string,
    classType?: "TD" | "CM" | "TP" | null
}

interface ClassProps {
    classData: ClassData,
    backgroundColor?: ColorValue,
    accentColor?: ColorValue
}

export default function (props: ClassProps) {

    const [hue] = useState(() => getHueFromString(props.classData.subject));
    const [duration] = useState(() => getDurationFormatted(props.classData.startDate, props.classData.endDate));


    return (
        <View className="flex flex-row w-full h-32 gap-4">
            <View className="flex flex-col items-end w-1/5 h-full">
                <Text className="text-primary font-inter font-medium text-xl">{formatTime(props.classData.startDate)}</Text>
                <Text className="text-primary font-inter font-extralight text-base">{formatTime(props.classData.endDate)}</Text>
            </View>
            <View className="bg-dynamic/33 flex-1 gap-3 flex-row rounded-[20px] h-full p-3" style={getHueStyle(hue)}>
                <View className="bg-dynamic h-full w-[6px] rounded-full"></View>
                <View className="flex-1 h-full flex-col justify-between">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Text numberOfLines={1} className="text-primary font-inter font-medium text-base">{props.classData.subject}</Text>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className=" flex flex-row items-center gap-1.5">
                            <MapPin className="fill-primary size-[17px]" color="white" />
                            <Text numberOfLines={1} className="text-primary font-inter font-medium text-base">{props.classData.room}</Text>
                        </View>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex flex-row items-center gap-1.5">
                            <User className="fill-primary size-[17px]" color="white" />
                            <Text numberOfLines={1} className="text-primary font-inter font-medium text-base">{props.classData.teacher}</Text>
                        </View>
                    </ScrollView>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex flex-row items-center gap-1.5">
                            <Clock className="fill-primary size-[17px]" color="white" />
                            <Text numberOfLines={1} className="text-primary font-inter font-medium text-base">{`${duration.heures}h${duration.minutes}`}</Text>
                        </View>
                    </ScrollView>
                    {props.classData.classType && <Text className="bg-primary text-black font-inter font-medium text-sm absolute top-3 right-3 px-2 py-1 rounded-full">{props.classData.classType}</Text>}
                </View>
            </View>
        </View>
    )
}