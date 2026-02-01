# Camaral Chatbot

## Descripción general
Camaral Chatbot es un MVP de calidad productiva que responde preguntas de ventas y soporte usando una base de conocimiento (KB) curada. Está construido con Next.js App Router, TypeScript, Tailwind y la API de Gemini. Todas las llamadas al modelo ocurren solo en el servidor.

## Arquitectura (alto nivel)
```
[Navegador]
   |  /chat (UI)
   v
[Next.js App Router]
   |  /api/chat (POST)
   v
[API de Gemini]
   |  Contexto KB (archivo local)
   v
[Documentos KB]
```

## Configuración

### 1) Instalar dependencias
```bash
npm install
```

### 2) Configurar variables de entorno
Crea `.env.local` (o `.env`) con:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (opcional, por defecto `gemini-2.5-flash`)

Opcional (rate limiting en serverless):
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### 3) Preparar la KB
Asegúrate de que exista `kb/camaral.md` (o agrega archivos bajo `kb/`). No se requiere subida.

### 4) Ejecutar en local
```bash
npm run dev
```

## Cómo actualizar la KB
Edita `kb/camaral.md` (o agrega archivos bajo `kb/`). Los cambios se reflejan en la siguiente solicitud.

## Seguridad

### OWASP Top 10 (2025) — alineación (resumen)
- **Validación de entrada**: validación con Zod y límites de tamaño.
- **Rate limiting**: 20 solicitudes / 5 minutos por IP.
- **Manejo seguro de errores**: mensajes genéricos al cliente; logging limitado en producción.
- **Gestión de secretos**: claves solo en variables de entorno del servidor.
- **Headers de seguridad**: CSP, nosniff, Referrer‑Policy, Permissions‑Policy; HSTS opcional.

### OWASP LLM Top 10 (puntos clave)
- **Defensas contra prompt injection**: reglas del sistema instruyen ignorar intentos de override.
- **Manejo inseguro de salida**: respuestas renderizadas como texto plano; sin HTML.
- **Protecciones DoS**: límite de tamaño, límite de mensajes, rate limiting y bloqueo de repetidos.

### Headers de seguridad
- **CSP**: `default-src 'self'`; `object-src 'none'`; `frame-ancestors 'none'`.
- **X-Content-Type-Options**: `nosniff`.
- **Referrer-Policy**: `no-referrer`.
- **Permissions-Policy**: desactiva cámara/micrófono/geolocalización.
- **HSTS**: habilitado solo cuando `ENABLE_HSTS=true` en producción con HTTPS.

> **Nota:** CSP permite `unsafe-eval` en desarrollo para tooling de Next.js; retirar en producción.

## Checklist de seguridad (pre‑release)
```bash
# Vulnerabilidades en dependencias
npm audit

# Verificar variables de entorno requeridas
node -e "['GEMINI_API_KEY'].forEach(k=>{if(!process.env[k]){console.error('Missing',k);process.exit(1)}})"

# Verificar headers de seguridad en local (después de npm run dev)
curl -I http://localhost:3000/ | sed -n '1,20p'
```
