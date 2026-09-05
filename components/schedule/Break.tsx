import colors from "@/styles/colors";
import { getHueFromString, getHueStyle } from "@/utils/RandomColor";
import { formatTime, getDurationFormatted } from "@/utils/Time";
import { Clock, MapPin, User } from "@getpapillon/papicons";
import { useState } from "react";
import { ColorValue, ScrollView, Text, View } from "react-native";

interface BreakData {
    startDate: Date,
    endDate: Date,
}

export default function ({ startDate, endDate }: BreakData) {
    const time = getDurationFormatted(startDate, endDate);
    return (
        <View className="flex flex-row w-full h-16 gap-4">
            <View className="flex flex-col items-end w-1/5 h-full">
                {/* <Text className="text-primary font-inter font-medium text-xl">{formatTime(props.breakData.startDate)}</Text>
                <Text className="text-primary font-inter font-extralight text-base">{formatTime(props.breakData.endDate)}</Text> */}
                <Text className="text-primary font-inter font-extralight text-xl">{time.heures}:{time.minutes}</Text>
            </View>
            <View className="flex-1 gap-3 flex-row rounded-[20px] h-full p-3" style={{ backgroundColor:  "#9e9e9e73" }}>
                <View className="h-full w-[6px] rounded-full" style={{ backgroundColor:  "#9e9e9eff" }}></View>
                <View className="flex-1 h-full flex-col justify-center">
                    <Text className="text-text text-lg">Pause</Text>
                </View>
            </View>
        </View>
    )
}