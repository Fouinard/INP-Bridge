import { StorageManager } from "@/shared/services/storage/storage";
import colors from "@/styles/colors";
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";

export function EditLoginsScreen() {

    const [username, setUsername] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);

    const usernameInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const init = async () => {
            const storedUsername = await StorageManager.Secure.get("username");
            const storedPassword = await StorageManager.Secure.get("password");
            setUsername(storedUsername);
            setPassword(storedPassword);
            usernameInputRef.current?.setNativeProps({ text: storedUsername || "" });
            passwordInputRef.current?.setNativeProps({ text: storedPassword || "" });
        }
        init();
    }, [])

    useEffect(() => {
        const init = async () => {
            if (username && password) {
                await StorageManager.Secure.set("username", username);
                await StorageManager.Secure.set("password", password);
            }
        }

        init();
    }, [username, password])

    return (
        <View className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold h-20">
                Modifier vos identifiants
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
            </View>
        </View>
    )
}