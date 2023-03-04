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

    const response = await fetch(url.toString(), {
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

    const response = await fetch(url.toString(), {
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

    const response = await fetch(url.toString(), {
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
