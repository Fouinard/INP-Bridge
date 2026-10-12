import OptionsLink from "@/features/components/OptionsLink";
import colors from "@/styles/colors";
import { GraduationHat, Lock } from "@getpapillon/papicons";
import { ScrollView, Text } from "react-native";


export default function OptionsScreen() {

    return (
        <ScrollView className="flex-1 pt-16 bg-bg">
            <Text className="text-text text-3xl font-semibold h-20 px-5">
                Options
            </Text>
            <OptionsLink href="/(options)/editlogins" mainText="Identifiants" description="Modifier vos identifiants Agalan" icon={<Lock color={colors.text} className="size-[17px]"/>}/>
            <OptionsLink href="/(options)/treeselector" mainText="Classe" description="Modifier votre classe" icon={<GraduationHat color={colors.text} className="size-[17px]"/>}/>
        </ScrollView>
    );
}