
export function saveAuth({ accessToken, expiresAt }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("expiresAt", expiresAt);
}

export function clearAuth() {
  localStorage.clear();
}

export function isLoggedIn() {
  return !!localStorage.getItem("accessToken");
}
