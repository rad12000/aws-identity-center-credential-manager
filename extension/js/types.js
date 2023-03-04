/**
 * @typedef {object} AppInstanceProfile
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} url
 * @property {string} protocol
 * @property {null | string} relayState
 */

/**
 * @typedef {object} SearchMetadata
 * @property {string} AccountId
 * @property {string} AccountName
 * @property {string} AccountEmail
 */

/**
 * @typedef {object} AppInstance
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} applicationId
 * @property {string} applicationName
 * @property {string} icon
 * @property {SearchMetadata} searchMetadata
 * @property {AppInstanceProfile[]} profiles
 */

/**
 * @typedef {AppInstance[]} GetProfilesResponse
 */
