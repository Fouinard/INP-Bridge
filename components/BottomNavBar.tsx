import { View, Text, Pressable } from "react-native";
import { Calendar, TextBubble, Gears, Home } from "@getpapillon/papicons"
import { Link, RelativePathString, usePathname } from "expo-router";

export default function () {
    const pathname = usePathname();
    const navBar = [
        {
            icon: Home,
            text: "Home",
            open: "/"
        }, {
            icon: Calendar,
            text: "Cours",
            open: "/schedule"
        }, {
        //     icon: TextBubble,
        //     text: "Messages",
        //     open: "/messages"
        // }, {
            icon: Gears,
            text: "Options",
            open: "/options"
        }
    ]
    return (
        <View className="w-full flex-row justify-center items-center">
            <View className="flex-row w-4/5 justify-around p-2 bg-black rounded-[36px] absolute bottom-[4.5rem]">
                {navBar.map((item, index) => {
                    return (
                        <Link href={item.open as RelativePathString} key={index} asChild>
                            <Pressable className={`flex-1 flex-col items-center rounded-[28px] pt-2 pb-1 ${item.open == pathname ? "bg-gray-700" : ""}`}>
                                <item.icon size={30} color={item.open == pathname ? "#F0436E" : "white"} />
                                <Text className={`text-white ${item.open == pathname ? "text-[#F0436E]" : ""} text-base font-semibold`}>
                                    {item.text}
                                </Text>
                            </Pressable>
                        </Link>
                    );
                })}
            </View>
        </View>
    )
}