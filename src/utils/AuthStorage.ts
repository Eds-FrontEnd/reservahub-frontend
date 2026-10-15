const AUTH_KEY = "isAuthenticated";
const USER_KEY = "authenticatedUser";
const TOKEN_KEY = "token";
const DISCOUNT_TRIGGER_KEY = "reservahub-show-discount-after-login";

export const AUTH_STORAGE_CHANGED_EVENT = "reservahub:auth-storage-changed";

export const clearAuthenticationStorage = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(DISCOUNT_TRIGGER_KEY);

  window.dispatchEvent(new Event(AUTH_STORAGE_CHANGED_EVENT));
};
