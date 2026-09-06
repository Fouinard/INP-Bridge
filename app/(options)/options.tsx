import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from "react";
import colors from "@/styles/colors";
import { router } from "expo-router";
import { Host, DropdownMenu, DropdownMenuItem, OutlinedButton, Icon, } from '@expo/ui/jetpack-compose';

export default function Index() {
    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [classroom, setClassroom] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const usernameInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const init = async () => {
            const storedUsername = await SecureStore.getItemAsync("username");
            const storedPassword = await SecureStore.getItemAsync("password");
            setUsername(storedUsername);
            setPassword(storedPassword);
            usernameInputRef.current?.setNativeProps({ text: storedUsername || "" });
            passwordInputRef.current?.setNativeProps({ text: storedPassword || "" });

            const storedClassroom = await AsyncStorage.getItem("classroom");
            setClassroom(storedClassroom);
        }
        init();
    }, [])

    useEffect(() => {
        if (username && password) {
            SecureStore.setItemAsync("username", username);
            SecureStore.setItemAsync("password", password);
        }
    }, [username, password])

    return (
        <ScrollView className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold h-20">
                Options
            </Text>
            <View className="flex flex-col gap-4">
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
                    {/* <Pressable className="p-2 border border-text rounded-md w-full" onPress={() => {
                        router.push("/classSelection");
                    }}>
                        <Text className="text-text text-center">
                            Modifier la classe
                        </Text>
                    </Pressable> */}
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

                </View>
            </View>
        </ScrollView>
    );
}