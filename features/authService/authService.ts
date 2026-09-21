import { ADEApi } from "@/shared/services/ade/adeApi";

export const AuthService = {
    async validateCredentials(username: string, password: string): Promise<void> {
        return await ADEApi.Auth.createSession({ username, password });
    }
}