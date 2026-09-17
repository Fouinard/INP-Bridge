import { Redirect, useLocalSearchParams } from "expo-router";

export default function Index() {
    const params = useLocalSearchParams<{ target: string }>();
    const targetRoute = params.target || "/startup";

    return <Redirect href={targetRoute as any} />;
}
