import { InMemoryCache } from "./cache.js";

export class AwsPortalService {
  static #baseUrl = "https://portal.sso.us-east-1.amazonaws.com";
  #jwt = "";

  constructor(jwt) {
    this.#jwt = jwt;
  }

  /**
   * @param {string} accountId
   * @param {string} roleName
   * @returns {Promise<RoleCredentials>}
   */
  async getAwsCredentials(accountId, roleName) {
    const url = new URL(AwsPortalService.#baseUrl);
    url.pathname = "federation/credentials";
    url.searchParams.append("account_id", accountId);
    url.searchParams.append("role_name", roleName);
    const headers = await this.#defaultHeaders();

    const response = await fetchWithRetries(url.toString(), 3, {
      headers,
      method: "GET",
    });

    if (!response.ok) {
      throw "Failed!";
    }

    /**
     * @type {GetCredentialsResponse}
     */
    const json = await response.json();
    return json.roleCredentials;
  }

  /**
   * @returns {Promise<GetAppInstancesResponse>}
   */
  async getAppInstances() {
    const url = new URL(AwsPortalService.#baseUrl);
    url.pathname = "instance/appinstances";
    const headers = await this.#defaultHeaders();

    const response = await fetchWithRetries(url.toString(), 3, {
      headers,
      method: "GET",
    });

    if (!response.ok) {
      throw "Failed!";
    }

    return await response.json();
  }

  /**
   * @returns {Promise<GetAppInstanceProfilesResponse>}
   */
  async getAppInstanceProfiles(instanceId) {
    const url = new URL(AwsPortalService.#baseUrl);
    url.pathname = `instance/appinstance/${instanceId}/profiles`;
    const headers = await this.#defaultHeaders();

    const response = await fetchWithRetries(url.toString(), 3, {
      headers,
      method: "GET",
    });

    if (!response.ok) {
      throw "Failed!";
    }

    return await response.json();
  }

  async #defaultHeaders() {
    return {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "x-amz-sso_bearer_token": this.#jwt,
    };
  }
}

const cache = new InMemoryCache();
const cacheEntryTTLSeconds = (() => {
  try {
    const ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS, 10);
    if (isNaN(ttlSeconds)) {
      throw "NaN";
    }

    console.info("using cache ttl of", ttlSeconds, "seconds");
    return ttlSeconds;
  } catch (e) {
    console.info("using default cache ttl of 1 minute");
    return 60;
  }
})();
/**
 * @param {string} url
 * @param {number} retryCount
 * @param {any} requestOptions
 * @param {{cache: boolean}} options
 * @returns {Promise<{ok: boolean; json(): Promise<any>;}>}
 */
async function fetchWithRetries(url, retryCount, requestOptions) {
  const useCache = cacheEntryTTLSeconds > 0;
  try {
    if (useCache) {
      const [found, value] = cache.get(url);
      if (found) {
        console.debug("using cached response for url", url);
        return value;
      }
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      console.error(
        "got error response",
        JSON.stringify(
          {
            status: response.status,
            url,
            body: await response.text(),
          },
          null,
          3
        )
      );
      return { ok: false };
    }

    const json = await response.json();
    const res = {
      ok: true,
      json: () => Promise.resolve(json),
      status: response.status,
    };

    if (useCache) {
      console.debug("caching response for url", url);
      cache.set(url, res, { ttlSeconds: cacheEntryTTLSeconds });
    }

    return res;
  } catch (e) {
    if (retryCount > 0) {
      console.log(`fetch ${url} failed. Retrying...`);
      return fetchWithRetries(url, --retryCount, requestOptions);
    }

    throw e;
  }
}
