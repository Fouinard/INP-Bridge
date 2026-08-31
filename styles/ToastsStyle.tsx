import { BaseToast } from "react-native-toast-message";
import colors from "@/styles/colors";

export const toastConfig = {
    error: (props: any) => (
        <BaseToast
            {...props}
            style={{
                backgroundColor: colors.active,
                minHeight: 60,
                height: "auto",
            }}
            text1="Erreur"
            text1Style={{
                color: colors.text,
            }}
            text2Style={{
                color: colors.text,
                flexWrap: "wrap",
            }}
            text2NumberOfLines={0}
        />
    ),
};