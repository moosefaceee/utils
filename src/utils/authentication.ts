import { TOKEN_STORAGE_KEY } from "../constants/auth";

/**
 * Gets JWT of authenticatedUser from either sessionStorage or localStorage
 */
export const fetchJwt = (): string | null => {
  try {
    const data = sessionStorage.getItem(TOKEN_STORAGE_KEY);

    if (!data) {
      return null;
    }

    const result = JSON.parse(data);

    if (result && typeof result === "object" && "state" in result) {
      return result.state.tokenSession;
    }
  } catch (error) {
    // TOD: Handle JSON parsing error
  }

  return null;
};
