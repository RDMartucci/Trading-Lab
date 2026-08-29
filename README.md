# Trading Lab

Trading Lab es un proyecto de analítica y exploración de mercados financieros con una arquitectura monolítica modular orientada a servicios. La intención del proyecto es disponer de un backend para consultar datos de mercado, preparar indicadores y servicios de análisis, y un frontend para visualizar información y construir una experiencia de trading.

## Estado actual

El proyecto ya tiene la base funcional de una aplicación full-stack con:

- backend en Node.js + Express + TypeScript
- frontend en Next.js + React + TypeScript
- PostgreSQL como almacenamiento relacional
- conexión con Twelve Data para cotizaciones e historiales de mercado
- estructura preparada para crecer en módulos de señales, cartera, indicadores, noticias y backtesting

> El proyecto está en una etapa de base técnica y desarrollo inicial: el backend ya expone endpoints de salud y de mercado, y el frontend aún conserva la plantilla inicial de Next.js que luego se sustituirá por la experiencia de Trading Lab.

## Stack tecnológico

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: Node.js, Express 5, TypeScript, tsx
- Base de datos: PostgreSQL 17
- Infraestructura local: Docker Compose
- APIs externas: Twelve Data

## Requisitos previos

- Node.js 20+ o compatible con las versiones declaradas en los package.json
- npm
- Docker Desktop con Docker Compose
- Una clave API válida de Twelve Data para consumir datos reales de mercado

## Configuración de entorno

En la raíz del proyecto crea un archivo `.env` basado en el ejemplo disponible:

```env
POSTGRES_DB=trading_lab
POSTGRES_USER=trading_lab_user
POSTGRES_PASSWORD=tu_password_segura
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

API_KEY_TWELVEDATA=tu_clave_twelvedata
```

También puedes usar el archivo `.env.example` como referencia:

```bash
cp .env.example .env
```

## Iniciar el entorno

### 1) Levantar PostgreSQL

```bash
docker compose up -d postgres
```

PostgreSQL quedará disponible en:

- host: `localhost`
- puerto: `5432`
- base de datos: `trading_lab`

### 2) Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3) Ejecutar el backend

```bash
npm run dev
```

La API quedará levantada en:

- `http://localhost:4000`

Comprobar estado del servicio:

```bash
curl http://localhost:4000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "trading-lab-backend"
}
```

### 4) Instalar dependencias del frontend

En otra terminal:

```bash
cd frontend
npm install
```

### 5) Ejecutar el frontend

```bash
npm run dev
```

Abre la aplicación en:

- `http://localhost:3000`

## Endpoints actuales del backend

### Salud

```http
GET /api/health
```

### Cotización en tiempo real

```http
GET /api/market/quote/:symbol
```

Ejemplo:

```bash
curl "http://localhost:4000/api/market/quote/AAPL"
```

### Historial de precios

```http
GET /api/market/history/:symbol?interval=1day&outputsize=30
```

Ejemplo:

```bash
curl "http://localhost:4000/api/market/history/AAPL?interval=1day&outputsize=30"
```

## Scripts disponibles

### Backend

Desde `backend/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API en modo desarrollo con recarga automática. |
| `npm run build` | Compila la aplicación TypeScript. |
| `npm start` | Ejecuta la versión compilada. |
| `npm test` | Marcador temporal; aún no hay suite de pruebas configurada. |

### Frontend

Desde `frontend/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la app en modo desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm start` | Sirve la compilación de producción. |
| `npm run lint` | Ejecuta ESLint. |

## Estructura del proyecto

```text
Trading-Lab/
├── .env                     # Variables locales del entorno
├── .env.example            # Plantilla de configuración
├── compose.yaml            # Configuración de PostgreSQL con Docker Compose
├── README.md               # Documentación principal
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts          # Entrada principal de la API
│       ├── config/         # Configuración de entorno
│       ├── controllers/    # Controladores HTTP
│       ├── database/       # Pool de PostgreSQL
│       ├── market-data/    # Integración con Twelve Data
│       ├── middleware/     # Middleware de Express
│       ├── models/         # Modelos de negocio
│       ├── repositories/   # Acceso a datos
│       ├── routes/         # Definición de rutas
│       ├── services/       # Lógica de negocio
│       └── utils/          # Utilidades compartidas
├── database/               # Scripts, migraciones o recursos de BD
├── docker/                 # Configuración y utilidades Docker
├── docs/                   # Documentación del proyecto
├── frontend/
│   ├── app/                # Enrutado principal de Next.js
│   ├── public/             # Archivos estáticos
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── README.md           # README base generado por Next.js
└── .gitignore
```

## Gestión del entorno local

Detener PostgreSQL sin borrar datos persistidos:

```bash
docker compose stop postgres
```

Detener y eliminar el contenedor:

```bash
docker compose down
```

El volumen `trading_lab_postgres_data` conserva la información incluso si el contenedor se reinicia.

## Próximos pasos recomendados

- conectar y normalizar el acceso a PostgreSQL con modelos reales
- definir migraciones y esquema inicial para usuarios, cartera y señales
- ampliar la API con indicadores, noticias, portafolios y backtesting
- sustituir la pantalla inicial de Next.js por el dashboard de Trading Lab
- añadir pruebas automatizadas para backend y frontend
- separar servicios y rutas según dominio funcional

## Notas finales

Este repositorio está pensado como base para un entorno de trading con análisis técnico, datos de mercado y un flujo de trabajo propio para pruebas de estrategias. La estructura actual es funcional para arrancar, validar datos y preparar la capa de negocio que se desarrollará en las siguientes iteraciones.

