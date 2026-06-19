// ══════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN — edita estos dos valores
// ══════════════════════════════════════════════════════════════════
// Tu App ID registrado en developers.deriv.com (Dashboard -> tu app)
const CLIENT_ID = "33AAhTttdb54bShIXnfqZ"; // <-- mismo DEFAULT_APP_ID del bot

// Se calcula solo, no lo edites: usa el dominio donde quede publicado
// este sitio en bolt.new (https://tu-proyecto.netlify.app o similar)
const REDIRECT_URI = `${window.location.origin}/callback.html`;

const AUTH_URL = "https://auth.deriv.com/oauth2/auth";

// ══════════════════════════════════════════════════════════════════

function randomString(len) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

async function sha256Base64Url(input) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  let str = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const statusBox = document.getElementById("statusBox");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", async () => {
  loginBtn.disabled = true;
  statusBox.className = "status wait";
  statusBox.textContent = "⏳ Preparando inicio de sesión seguro…";

  try {
    const codeVerifier = randomString(64);
    const codeChallenge = await sha256Base64Url(codeVerifier);
    const state = randomString(24);

    sessionStorage.setItem("dako_code_verifier", codeVerifier);
    sessionStorage.setItem("dako_oauth_state", state);

    const url = new URL(AUTH_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("scope", "trade account_manage");
    url.searchParams.set("state", state);
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");

    window.location.href = url.toString();
  } catch (e) {
    statusBox.className = "status err";
    statusBox.textContent = "❌ No se pudo iniciar el login: " + e.message;
    loginBtn.disabled = false;
  }
});
