import { StorageManager } from "@/services/storage";
import colors from "@/styles/colors";
import { Checkbox } from "expo-checkbox";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";

export default function () {

    const router = useRouter();

    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <ScrollView className="flex-1 pt-16 bg-bg px-5">
            <Text className="text-text text-3xl font-semibold h-32">
                Connectez-vous à l'INP via vos identifiants Agalan
            </Text>
            <View className="flex flex-col gap-4">
                <View className="flex flex-col gap-2">
                    <Text className="text-text text-xl">
                        Nom d'utilisateur
                    </Text>
                    <TextInput
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
                        placeholder="••••••••••••••"
                        onChangeText={setPassword}
                        className="text-text border border-text p-2 rounded-md"
                        placeholderTextColor={colors.grey}
                        secureTextEntry
                    />
                </View>
                <Pressable
                    onPress={() => setPrivacyChecked(!privacyChecked)}
                    className="flex-row items-center gap-3 mt-5"
                >
                    <Checkbox
                        value={privacyChecked}
                        onValueChange={setPrivacyChecked}
                        color={privacyChecked ? colors.accent : undefined}
                    />
                    <Text className="text-text flex-1">
                        J'ai lu et pris connaissance de la politique de confidentialité
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setTermsChecked(!termsChecked)}
                    className="flex-row items-center gap-3"
                >
                    <Checkbox
                        value={termsChecked}
                        onValueChange={setTermsChecked}
                        color={termsChecked ? colors.accent : undefined}
                    />
                    <Text className="text-text flex-1">
                        J'ai lu et pris connaissance des conditions d'utilisations
                    </Text>
                </Pressable>
            </View>
            <Pressable className="mt-10 p-2 border border-text rounded-md w-1/2 self-center" onPress={async () => {
                if(!privacyChecked) {
                    return Toast.show({
                        type: 'error',
                        text2: 'Vous devez accepter la politique de confidentialité pour continuer.',
                        position: 'bottom',
                    })
                }
                if(!termsChecked) {
                    return Toast.show({
                        type: 'error',
                        text2: 'Vous devez accepter les conditions d\'utilisation pour continuer.',
                        position: 'bottom',
                    })
                }
                Toast.hide()
                if(Platform.OS === "web") {
                    localStorage.setItem('logins', btoa(`${username}:${password}`));
                } else {
                    await StorageManager.Secure.set('username', username);
                    await StorageManager.Secure.set('password', password);
                }
                Toast.show({
                    type: 'success',
                    text2: `Identifiants enregistrés avec succès !`,
                    position: 'bottom',
                })
                router.push("/schedule")
            }}>
                <Text className="text-text text-center">
                    Se connecter
                </Text>
            </Pressable>
        </ScrollView>
    );
}