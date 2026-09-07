import { StorageManager } from "@/services/storage";
import { DropdownMenu, DropdownMenuItem, Host, OutlinedButton } from '@expo/ui/jetpack-compose';
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";


export default function Index() {
    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [classroom, setClassroom] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // const [css, setCss] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const storedUsername = await StorageManager.Secure.get("username");
            const storedPassword = await StorageManager.Secure.get("password");
            setUsername(storedUsername);
            setPassword(storedPassword);
        }
        init();
    }, [])

    return (
        <ScrollView className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold h-20">
                Sélectionnez votre classe
            </Text>
            <Host matchContents>
                <DropdownMenu expanded={isExpanded} onDismissRequest={() => setIsExpanded(false)}>
                    <DropdownMenu.Trigger>
                        <OutlinedButton onClick={() => setIsExpanded(true)}>
                            <Text>Show menu</Text>
                        </OutlinedButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Items>
                        <DropdownMenuItem onClick={() => { setIsExpanded(false) }}>
                            <DropdownMenuItem.Text>
                                <Text>Home</Text>
                            </DropdownMenuItem.Text>
                        </DropdownMenuItem>
                    </DropdownMenu.Items>
                </DropdownMenu>
            </Host>
            {/* <WebView source={{ uri: 'https://your-website.com/class-selection' }} /> */}
            {/* <View className="flex flex-col gap-4">
                <View className="flex flex-col gap-2">
                    <Text className="text-text text-xl">
                        Nom d'utilisateur
                    </Text>
                    <TextInput
                        ref={usernameInputRef}
                        placeholder="nomp"
                        className="text-text border border-text p-2 rounded-md"
                        placeholderTextColor={colors.grey}
                        onChangeText={setUsername}
                    />
                </View>
                <View className="flex flex-col gap-2">
                    <Text className="text-text text-xl">
                        Mot de passe
                    </Text>
                    <TextInput
                        ref={passwordInputRef}
                        placeholder="••••••••••••••"
                        onChangeText={setPassword}
                        className="text-text border border-text p-2 rounded-md"
                        placeholderTextColor={colors.grey}
                        secureTextEntry
                    />
                </View>
                <View className="flex flex-col gap-2">
                    <Text className="text-text text-xl">
                        Classe : {classroom || "Non définie"}
                    </Text>
                    <Pressable className="p-2 border border-text rounded-md w-full" onPress={() => {
                        router.push("/classSelection");
                    }}>
                        <Text className="text-text text-center">
                            Modifier la classe
                        </Text>
                    </Pressable>
                </View>
            </View> */}
        </ScrollView>
    );
}