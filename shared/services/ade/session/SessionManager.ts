import { StorageManager } from '@/shared/services/storage/storage';
import { CookieDict, findCookie } from '@/utils/cookies';
import { ExpandableNodeTypes } from '../../../../features/tree/types';
import { ADE_DEFAULTS } from '../api/constants';
import { createSession, valiateSession } from '../api/sessionEndpoints';
import { expandTreeNode, selectTreeNode } from '../api/treeEndpoints';
import { ADESessionParams } from '../types/session.types';

export class SessionManager {
    private static instance: SessionManager | null = null;

    private cookies: CookieDict = {};

    private loginPromise: Promise<void> | null = null;

    private constructor() { }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public async login(): Promise<void> {
        if (this.loginPromise) {
            return this.loginPromise;
        }

        this.loginPromise = (async () => {
            try {
                const username = await StorageManager.Secure.get("username");
                const password = await StorageManager.Secure.get("password");
                if (!username || !password) {
                    throw new Error("Missing login credentials.");
                }
                await this.createSession({ username, password });
                const hasClassSelected = await StorageManager.Default.get<string[][]>("ADEClassTreeList");
                if (hasClassSelected) {
                    await this.selectClass(hasClassSelected);
                }
            } finally {
                this.loginPromise = null;
            }
        })();

        return this.loginPromise;
    }

    public async getFormattedCredentials(): Promise<string> {
        const password = await StorageManager.Secure.get("password");
        const username = await StorageManager.Secure.get("username");
        return btoa(`${username}:${password}`);
    }

    public getSessionCookies() {
        return Object.entries(this.cookies).map(([name, cookie]) => `${cookie.value}`).join("; ");
    }

    public async createSession(credentials: { username: string, password: string }) {
        const creds = btoa(`${credentials.username}:${credentials.password}`);
        try {
            this.cookies = { ...this.cookies, ...await createSession({ credentials: creds }) };
        } catch (error) {
            throw new Error(`Failed to login: ${error}`);
        }

        try {
            this.cookies = { ...this.cookies, ...await valiateSession({ credentials: creds, cookieString: this.getSessionCookies() }) };
        } catch (error) {
            throw new Error(`Failed to validate session: ${error}`);
        }
    }

    public async selectClass(nodeListOverride?: string[][]) {
        const creds = await this.getFormattedCredentials();

        const nodeList = nodeListOverride || await StorageManager.Default.get<string[][]>("ADEClassTreeList");

        if (!nodeList) {
            throw new Error("No class tree list found");
        }

        let referer = `https://${ADE_DEFAULTS.endpoint}/${ADE_DEFAULTS.year}/${ADE_DEFAULTS.location}/${ADE_DEFAULTS.type}/jsp/standard/gui/tree.jsp?forceLoad=false&isDirect=true`
        for (const treeNode of nodeList) {
            if (treeNode[0] == "select") {
                referer = (await selectTreeNode({ credentials: creds, nodeId: treeNode[1], cookieString: this.getSessionCookies(), referer: referer })).currentUrl;
            } else {
                referer = (await expandTreeNode({ credentials: creds, nodeType: treeNode[0] as ExpandableNodeTypes, nodeId: treeNode[1], cookieString: this.getSessionCookies(), referer: referer })).currentUrl;
            }
        }
    }

    public clearSession() {
        this.cookies = {};
    }

    public async generateFreshSession() {
        this.clearSession();
        await this.login();
    }

    public async authenticatedRequest<
        F extends (params: any) => Promise<any>,
        T = Awaited<ReturnType<F>>,
        ExtraParams = Omit<Parameters<F>[0], keyof ADESessionParams>
    >(
        apiFunction: F,
        ...[extraParams]: keyof ExtraParams extends never ? [] : [params: ExtraParams]
    ): Promise<T> {
        if (!findCookie(this.cookies, "jsessionid")) {
            this.clearSession();
            await this.login();
        }

        try {
            // console.log("authenticated request");
            return await apiFunction({
                credentials: await this.getFormattedCredentials(),
                cookieString: this.getSessionCookies(),
                ...(extraParams as any),
            });
        } catch (error) {
            // console.log(error);
            // console.log("failed authenticated request, retrying...");

            this.clearSession();
            await this.login();

            return await apiFunction({
                credentials: await this.getFormattedCredentials(),
                cookieString: this.getSessionCookies(),
                ...(extraParams as any),
            });
        }
    }
}
