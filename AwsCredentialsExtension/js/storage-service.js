/**
 * @typedef {object} ProfileConfig
 * @property {string} id
 * @property {boolean} enabled
 * @property {string?} alias
 */

export class StorageService {
  /**
   * @param {string} id
   * @returns {ProfileConfig | null}
   */
  static getProfileConfigById(id) {
    const result = localStorage.getItem(`profile${id}`);
    if (!result) {
      return null;
    }

    return JSON.parse(result);
  }

  /**
   * @param {ProfileConfig} config
   */
  static putProfileConfig(config) {
    localStorage.setItem(`profile${config.id}`, JSON.stringify(config));
  }
}
