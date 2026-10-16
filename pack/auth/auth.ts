const CERT_SERVICE_URL = "http://192.168.76.96:5173"; // сменить после релиза

export function redirectToCertService() {
  const returnUrl = window.location.href;
  window.location.href = `${CERT_SERVICE_URL}/?returnUrl=${encodeURIComponent(returnUrl)}`;
}

export function consumeTokenFromUrl() {
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");
  if (!token) return null;

  localStorage.setItem("accessToken", token);

  url.searchParams.delete("token");
  window.history.replaceState({}, "", url.toString());

  return token;
}