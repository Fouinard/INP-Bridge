import { View, Text, Pressable } from "react-native";
import { Calendar, TextBubble, Gears } from "@getpapillon/papicons"
import { Link, RelativePathString } from "expo-router";

export default function () {
    const navBar = [
        {
            icon: Calendar,
            text: "Cours",
            open: "/schedule",
            selected: true
        }, {
            icon: TextBubble,
            text: "Messages",
            open: "/messages",
            selected: false
        }, {
            icon: Gears,
            text: "Options",
            open: "/options",
            selected: false
        }
    ]
    return (
        <View className="flex-row w-4/5 justify-around p-2 bg-black rounded-[36px] absolute bottom-20">
            {navBar.map((item, index) => {
                return (
                    <Link
                        href={item.open as RelativePathString}
                        key={index}
                        asChild
                    >
                        <Pressable
                            className={`flex-1 flex-col items-center rounded-[28px] pt-2 pb-1 ${item.selected ? "bg-gray-700" : ""
                                }`}
                        >
                            <item.icon
                                size={30}
                                color={item.selected ? "#F0436E" : "white"}
                            />

                            <Text
                                className={`text-white ${item.selected ? "text-[#F0436E]" : ""
                                    } text-base font-semibold`}
                            >
                                {item.text}
                            </Text>
                        </Pressable>
                    </Link>
                );
            })}
        </View>
    )
}