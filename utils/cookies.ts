export interface CookieData {
  value: string;
  params: string;
}

export type CookieDict = Record<string, CookieData>;

export function getCookies(response: Response): CookieDict {
  const cookieDict: CookieDict = {};
  let rawCookies: string[] = [];

  if (typeof response.headers.getSetCookie === 'function') {
    rawCookies = response.headers.getSetCookie();
  } else {
    const headerStr = response.headers.get('set-cookie');
    if (headerStr) {
      rawCookies = headerStr.split(/,\s*(?=[a-zA-Z0-9_\-~]+=)/);
    }
  }

  for (const cookieStr of rawCookies) {
    const parts = cookieStr.split(';');
    const firstPart = parts[0].trim();
    const equalIndex = firstPart.indexOf('=');

    if (equalIndex !== -1) {
      const name = firstPart.slice(0, equalIndex).trim();
      const key = name.toLowerCase();
      const params = parts.slice(1).map(p => p.trim()).join('; ');

      cookieDict[key] = {
        value: firstPart,
        params: params,
      };
    }
  }

  return cookieDict;
}

interface FindCookieOptions {
  exact?: boolean;
}

export function findCookie(
  cookies: CookieDict,
  query: string | RegExp,
  options: FindCookieOptions = { exact: false }
): CookieData | null {
  const keys = Object.keys(cookies);

  if (query instanceof RegExp) {
    const matchingKey = keys.find((key) => query.test(key));
    return matchingKey ? cookies[matchingKey] : null;
  }

  const normalizedQuery = query.toLowerCase();

  const matchingKey = keys.find((key) => {
    if (options.exact) {
      return key === normalizedQuery;
    }
    return key.includes(normalizedQuery);
  });

  return matchingKey ? cookies[matchingKey] : null;
}
