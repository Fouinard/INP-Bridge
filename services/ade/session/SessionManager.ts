import { StorageManager } from '@/services/storage';
import { CookieDict, findCookie } from '@/utils/cookies';
import { ADE_DEFAULTS } from '../constants';
import { expandTreeNode, selectTreeNode } from '../tree/endpoints';
import { ExpandableNodeTypes } from '../tree/types';
import { createSession, valiateSession } from './endpoints';
import { ADESessionParams } from './types';

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
                await this.createSession();
                if (!(await StorageManager.Default.get<string[][]>("ADEClassTreeList"))) { return; }
                await this.selectClass();
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

    public async createSession() {
        const creds = await this.getFormattedCredentials();
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

    public async selectClass() {
        const creds = await this.getFormattedCredentials();

        const nodeList = await StorageManager.Default.get<string[][]>("ADEClassTreeList");

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
