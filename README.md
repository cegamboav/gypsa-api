# gypsa-api

API independiente de GYPSA.

## Objetivo del proyecto

En este primer sprint, `gypsa-api` tiene **un solo propósito**:

1. Recibir el formulario de contacto desde el sitio web (`gypsa.tech`)
2. Enviar un correo a `contacto@gypsa.tech` mediante Zoho SMTP

No es un CRM. No incluye base de datos, autenticación, calendario ni IA.

Este repositorio es **completamente independiente** de `gypsa.tech`.

## Estructura

```
src/
├── config/          # Variables de entorno e identidad de la app
├── controllers/     # Adaptadores HTTP (sin lógica SMTP)
├── middleware/      # Logger, validación, errores
├── routes/          # Rutas versionadas (/api/v1/...)
├── services/        # Lógica de negocio (EmailService + Nodemailer)
├── types/           # Schemas Zod + errores de dominio
├── app.ts           # Factory de Express
└── index.ts         # Arranque del servidor
```

**Regla:** el controlador **nunca** habla con SMTP. Todo el envío vive en `EmailService`.

## Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno | `development` |
| `PORT` | Puerto HTTP | `3001` |
| `CORS_ORIGIN` | Orígenes permitidos (coma) | `http://localhost:5173` |
| `CONTACT_TO_EMAIL` | Destinatario del formulario | `contacto@gypsa.tech` |
| `SMTP_HOST` | Host SMTP Zoho | `smtp.zoho.com` |
| `SMTP_PORT` | Puerto SMTP (`465` SSL o `587` STARTTLS) | `465` |
| `SMTP_USER` | Cuenta Zoho Mail | `contacto@gypsa.tech` |
| `SMTP_PASSWORD` | App Password de Zoho | *(secreto)* |

### Configurar Zoho SMTP

1. Inicia sesión en [Zoho Mail](https://mail.zoho.com) con la cuenta que enviará el correo.
2. Activa SMTP si tu plan lo requiere (Mail Admin Console → Email Routing / SMTP).
3. Genera un **Application-Specific Password** (Security → App Passwords). No uses la contraseña normal de la cuenta.
4. Completa `.env`:

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=contacto@gypsa.tech
SMTP_PASSWORD=tu_app_password_de_zoho
CONTACT_TO_EMAIL=contacto@gypsa.tech
```

Notas:

- Zoho USA: `smtp.zoho.com`
- Zoho Europe: `smtp.zoho.eu`
- Puerto `465` → SSL (`secure: true`)
- Puerto `587` → STARTTLS (`secure: false`)

## Cómo ejecutarlo

Requisitos: **Node.js 20+**.

```bash
cd gypsa-api
cp .env.example .env
# edita .env con tus credenciales Zoho
npm install
npm run dev
```

Servidor por defecto: `http://localhost:3001`

```bash
npm run typecheck
npm run build
npm start
```

## Endpoints disponibles

### `GET /health`

```json
{
  "status": "ok",
  "service": "gypsa-api",
  "version": "1.0.0"
}
```

### `POST /api/v1/contact`

**Body:**

```json
{
  "name": "Carlos Pérez",
  "email": "carlos@empresa.com",
  "company": "Empresa SA",
  "phone": "+52 55 1234 5678",
  "message": "Quisiera agendar una conversación."
}
```

| Campo | Requerido | Notas |
|-------|-----------|-------|
| `name` | sí | 1–120 caracteres |
| `email` | sí | email válido |
| `company` | no | máx. 160 |
| `phone` | no | máx. 40 |
| `message` | sí | 1–5000 caracteres |

**Éxito `200`:**

```json
{
  "success": true,
  "message": "Gracias por contactarnos. Hemos recibido tu mensaje."
}
```

**Asunto del correo:** `[GYPSA] Nuevo contacto - Carlos Pérez`

### Probar con curl

```bash
curl -X POST http://localhost:3001/api/v1/contact \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Carlos Pérez\",\"email\":\"carlos@empresa.com\",\"company\":\"Empresa SA\",\"phone\":\"+52 55 1234 5678\",\"message\":\"Hola, quiero más información.\"}"
```

### Probar con Postman

1. Method: `POST`
2. URL: `http://localhost:3001/api/v1/contact`
3. Headers: `Content-Type: application/json`
4. Body → raw → JSON (usa el ejemplo de arriba)
5. Send → verifica `200` y el correo en `contacto@gypsa.tech`

## Estado del sprint

| Pieza | Estado |
|-------|--------|
| Estructura | ✅ |
| Config / CORS / Helmet / logger / errores | ✅ |
| `GET /health` | ✅ |
| `POST /api/v1/contact` | ✅ |
| Zoho SMTP (`EmailService` + Nodemailer) | ✅ |
