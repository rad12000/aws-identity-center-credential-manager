/**
 * @typedef {object} GetAppInstancesResponse
 * @property {null | string} paginationToken
 * @property {object[]} result
 * @property {string} result.id
 * @property {string} result.name
 * @property {string} result.description
 * @property {string} result.applicationId
 * @property {"SonarQube Application" | "AWS Account"} result.applicationName
 * @property {string} result.icon
 * @property {object|null} result.searchMetadata
 * @property {string} result.searchMetadata.AccountId
 * @property {string} result.searchMetadata.AccountName
 * @property {string} result.searchMetadata.AccountEmail
 */

/**
 * @typedef {object} GetAppInstanceProfilesResponse
 * @property {null | string} paginationToken
 * @property {object[]} result
 * @property {string} result.id
 * @property {string} result.name
 * @property {string} result.description
 * @property {string} result.url
 * @property {string} result.protocol
 * @property {null | string} result.relayState
 */

/**
 * @typedef {object} RoleCredentials
 * @property {string} accessKeyId
 * @property {string} secretAccessKey
 * @property {string} sessionToken
 * @property {number} expiration
 */

/**
 * @typedef {object} GetCredentialsResponse
 * @property {RoleCredentials} roleCredentials
 */

/**
 * @typedef {CredentialDetails[]} PutCredentialsRequest
 */

/**
 * @typedef {object} CredentialDetails
 * @property {string} roleName
 * @property {string} alias
 * @property {string} accountId
 */
