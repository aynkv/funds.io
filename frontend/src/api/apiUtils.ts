/**
 * Returns the configuration object for axios requests with the authorization header.
 * @param token - The authentication token.
 * @returns The configuration object.
 */
export const getConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});
