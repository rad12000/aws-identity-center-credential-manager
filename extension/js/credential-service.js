export class CredentialService {
  static #url = "http://localhost:50173";

  /**
   * @param {string} jwt
   * @returns {Promise<GetProfilesResponse>}
   */
  static async getAwsProfiles(jwt) {
    const response = await fetch(`${this.#url}/profiles`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    });

    const json = await response.json();
    if (!response.ok) {
      console.log(json);
      throw new Error("Failed to load aws profiles!");
    }

    return json;
  }

  static async putAwsCredentials(jwt, creds) {
    const response = await fetch(`${this.#url}/credentials`, {
      method: "PUT",
      body: JSON.stringify(creds),
      headers: {
        authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to PUT aws credentials!");
    }
  }
}
