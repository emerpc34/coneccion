const statusBox = document.getElementById("statusBox");
const content = document.getElementById("content");

function setStatus(type, html) {
  statusBox.className = "status " + type;
  statusBox.innerHTML = html;
}

async function run() {
  const params = new URLSearchParams(window.location.search);

  // Caso 1: Deriv devolvió un error
  if (params.has("error")) {
    const desc = params.get("error_description") || params.get("error");
    setStatus("err", "❌ Deriv devolvió un error:<br><b>" + desc + "</b>");
    return;
  }

  const code = params.get("code");
  const returnedState = params.get("state");

  if (!code) {
    setStatus(
      "wait",
      "⚠ No se encontró un código de autorización en esta URL. " +
        "Esta página debe abrirse automáticamente después de iniciar sesión " +
        "en Deriv, no visitarse directamente."
    );
    return;
  }

  // Verificar CSRF state
  const savedState = sessionStorage.getItem("dako_oauth_state");
  const codeVerifier = sessionStorage.getItem("dako_code_verifier");

  if (!codeVerifier || !savedState) {
    setStatus(
      "err",
      "❌ No se encontró la sesión de login original en este navegador. " +
        "Vuelve a iniciar el login desde la página principal (no recargues " +
        "esta página ni la abras en otra pestaña)."
    );
    return;
  }

  if (returnedState !== savedState) {
    setStatus(
      "err",
      "❌ El parámetro 'state' no coincide. Por seguridad se detuvo el " +
        "proceso. Vuelve a intentar el login desde el inicio."
    );
    return;
  }

  setStatus("wait", "⏳ Canjeando el código por tu token de acceso…");

  try {
    const resp = await fetch("/api/exchange-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        redirect_uri: `${window.location.origin}/callback.html`,
      }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.access_token) {
      throw new Error(data.error_description || data.error || "Respuesta inválida del canje de token");
    }

    // Limpiar datos de un solo uso
    sessionStorage.removeItem("dako_code_verifier");
    sessionStorage.removeItem("dako_oauth_state");

    const token = data.access_token;
    setStatus("ok", "✔ Login completado. Copia tu token y pégalo en DAKO-BOT.");

    content.innerHTML = `
      <div class="hint" style="margin-top:0;">
        Token de acceso de Deriv. Cópialo y pégalo en tu bot DAKO-BOT,
        pestaña <b>Conexión</b> → campo <b>API Token</b> → botón <b>Conectar</b>
        (no uses el botón de login con OAuth, usa este token directamente).
      </div>
      <div class="copybox">
        <input type="text" readonly value="${token}" id="urlBox" />
        <button id="copyBtn">Copiar</button>
      </div>
      <div class="hint">
        Por seguridad, este token no se guarda en ningún servidor — solo
        vive en esta página mientras la tengas abierta. Si recargas o
        cierras la pestaña, tendrás que iniciar sesión de nuevo.
      </div>
    `;

    document.getElementById("copyBtn").addEventListener("click", () => {
      const box = document.getElementById("urlBox");
      box.select();
      navigator.clipboard.writeText(box.value).then(() => {
        const btn = document.getElementById("copyBtn");
        btn.textContent = "✔ Copiado";
        setTimeout(() => (btn.textContent = "Copiar"), 1500);
      });
    });
  } catch (e) {
    setStatus(
      "err",
      "❌ No se pudo canjear el código por un token: " + e.message
    );
  }
}

run();
