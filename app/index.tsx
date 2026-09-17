import { Redirect, useLocalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function Index() {
    const params = useLocalSearchParams<{ target: string }>();
    const targetRoute = params.target || "/startup";

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return <Redirect href={targetRoute as any} />;
}
