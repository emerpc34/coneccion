# DAKO-BOT — Puente de Login Deriv (para Netlify / bolt.new)

Resuelve el error **"Localhost URLs are not allowed in production"** que
da Deriv al intentar loguearte desde tu bot. Deriv exige que el
`redirect_uri` de OAuth sea una URL pública en HTTPS — `localhost` ya no
se acepta.

## Cómo funciona (versión simple)

1. Abres esta página pública (la que publiques en Netlify).
2. Pulsas "Iniciar sesión con Deriv" → te lleva a Deriv a loguearte.
3. Deriv te redirige de vuelta a `callback.html` con un código de
   autorización.
4. La página canjea ese código por un `access_token` (esto lo hace una
   función de backend, porque Deriv exige que el canje no se haga desde
   el navegador).
5. La página te **muestra el token en pantalla** con un botón "Copiar".
6. Copias ese token y lo pegas manualmente en tu bot DAKO-BOT → pestaña
   **Conexión** → campo **API Token** → botón **Conectar**.

No hay comunicación automática entre la página web y tu bot — es
copiar/pegar, simple y sin partes que puedan fallar por red.

## Pasos para publicarlo

### 1. Sube este proyecto a GitHub, y desde ahí a Netlify
(Si ya tienes el repo en GitHub, en netlify.com → "Add new site" →
"Import an existing project" → conecta GitHub → selecciona el repo.
Netlify detecta automáticamente `netlify.toml` y hace el build solo.)

Netlify te dará una URL pública, algo como:

```
https://dako-bot-bridge.netlify.app
```

### 2. Registra esa URL en Deriv
Ve a **developers.deriv.com → Dashboard → tu app (App ID
`33AAhTttdb54bShIXnfqZ`) → OAuth Details**, y en **Redirect URL** agrega
exactamente:

```
https://TU-DOMINIO.netlify.app/callback.html
```

Sin `localhost`, debe coincidir carácter por carácter con lo que la app
usa (incluido `https://`, sin barra final extra).

### 3. Si usas otro App ID
Si decides usar un App ID distinto al que ya está en el código
(`33AAhTttdb54bShIXnfqZ`), cámbialo en **dos archivos**:

- `main.js` → constante `CLIENT_ID`
- `netlify/functions/exchange-token.js` → constante `CLIENT_ID`

### 4. Prueba el flujo
1. Abre tu URL de Netlify.
2. Pulsa "Iniciar sesión con Deriv".
3. Inicia sesión / autoriza la app en Deriv.
4. Vuelve a `callback.html`, que canjea el código por el token.
5. Copia el token mostrado en pantalla.
6. Pégalo en tu bot DAKO-BOT (pestaña Conexión → API Token → Conectar).

## Nota sobre el token

El nuevo OAuth de Deriv entrega **un solo token** por sesión (a diferencia
del flujo viejo, que daba un token por cada cuenta demo/real). Si
necesitas alternar entre cuenta demo y cuenta real, repite el login para
cada una, o usa directamente un token manual desde
`app.deriv.com/account/api-token` para la cuenta que no estés usando vía
este login.
