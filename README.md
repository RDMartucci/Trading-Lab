# Trading Lab

Trading Lab es un proyecto full-stack para análisis de mercado, visualización financiera y preparación de indicadores técnicos. La base actual ya incluye integración con datos reales de Twelve Data, persistencia en PostgreSQL y un dashboard funcional para consultar cotizaciones, sincronizar series históricas y evaluar señales técnicas.

## Estado actual

El proyecto ya está en una etapa funcional de prototipo/alpha con las siguientes capacidades implementadas:

- Backend en Node.js + Express + TypeScript
- Frontend en Next.js + React + TypeScript
- PostgreSQL como almacenamiento principal de precios y activos
- Integración con Twelve Data para cotizaciones y series históricas
- Persistencia automática de candles por símbolo e intervalo
- Dashboard de mercado con gráficos y indicadores técnicos
- Endpoints para activo, historial, sincronización y cálculo de indicadores
- Estructura preparada para ampliar módulos de señales, cartera, noticias y backtesting

> La aplicación ya no es solo una base técnica: el backend y el frontend cuentan con flujo real de carga de mercado, análisis técnico y visualización de datos.

## Stack tecnológico

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: Node.js, Express 5, TypeScript, tsx
- Base de datos: PostgreSQL 17
- Infraestructura local: Docker Compose
- APIs externas: Twelve Data

## Funcionalidades nuevas y ya disponibles

### 1) Consulta de mercado en tiempo real

- Cotización actual por símbolo
- Datos de mercado con nombre, exchange, moneda y variación diaria
- Soporte para distintos símbolos y endpoints con respuesta JSON estructurada

### 2) Historial de precios persistido en PostgreSQL

- Recuperación de series históricas desde Twelve Data
- Persistencia de candles con `market_assets` y `market_candles`
- Evita duplicados usando constraints y upserts
- Soporte para limitación de registros por intervalo

### 3) Sincronización de datos con el backend

- Endpoint dedicado para traer y guardar datos del proveedor a la base de datos
- Permite sincronizar históricos por símbolo e intervalo
- Devuelve el número de candles insertados / procesados

### 4) Catálogo de activos y estadísticas

- Listado de activos persistidos
- Consulta por símbolo
- Endpoint de estadísticas por activo con recuento de candles y rango temporal

### 5) Indicadores técnicos calculados en backend

Actualmente están expuestos estos indicadores:

- SMA (Simple Moving Average)
- EMA (Exponential Moving Average)
- RSI (Relative Strength Index)

Se calculan sobre series históricas persistidas o en fallback con datos en vivo.

### 6) Dashboard de Trading Lab

El frontend incluye una vista funcional con:

- selector de símbolo e intervalo
- tasa de cambio y última cotización
- candlesticks y volumen
- zoom de ventana de candles
- indicadores SMA, EMA y RSI sobre el mismo conjunto de datos
- sincronización directa desde la interfaz
- tabla de velas recientes

## Requisitos previos

- Node.js 20+
- npm
- Docker Desktop con Docker Compose
- Clave API válida de Twelve Data

## Configuración de entorno

En la raíz del proyecto crea un archivo `.env` con esta estructura:

```env
POSTGRES_DB=trading_lab
POSTGRES_USER=trading_lab_user
POSTGRES_PASSWORD=tu_password_segura
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

API_KEY_TWELVEDATA=tu_clave_twelvedata
```

También puedes basarte en el archivo `.env.example`:

```bash
cp .env.example .env
```

## Iniciar el entorno

### 1) Levantar PostgreSQL

```bash
docker compose up -d postgres
```

Base de datos disponible en:

- host: `localhost`
- puerto: `5432`
- nombre: `trading_lab`

### 2) Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3) Ejecutar el backend

```bash
npm run dev
```

La API queda en:

- `http://localhost:4000`

Comprobar salud del servicio:

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

## Endpoints del backend

### Salud

```http
GET /api/health
```

### Cotización actual

```http
GET /api/market/quote/:symbol
```

Ejemplo:

```bash
curl "http://localhost:4000/api/market/quote/AAPL"
```

### Historial de precios desde proveedor

```http
GET /api/market/history/:symbol?interval=1day&outputsize=30
```

### Historial persistido en base de datos

```http
GET /api/market/candles/:symbol?interval=1day&limit=30
```

Alias útil:

```http
GET /api/market/synced-history/:symbol?interval=1day&limit=30
```

### Sincronizar un activo a PostgreSQL

```http
POST /api/sync/assets/:symbol?interval=1day&outputsize=30
```

Ejemplo:

```bash
curl -X POST "http://localhost:4000/api/sync/assets/AAPL?interval=1day&outputsize=50"
```

### Listado de activos

```http
GET /api/assets
```

### Activo por símbolo

```http
GET /api/assets/:symbol
```

### Estadísticas por activo

```http
GET /api/assets/:symbol/stats
```

### Indicadores técnicos

```http
GET /api/indicators/sma/:symbol?interval=1day&period=14
GET /api/indicators/ema/:symbol?interval=1day&period=14
GET /api/indicators/rsi/:symbol?interval=1day&period=14
```

## Scripts disponibles

### Backend

Desde `backend/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API con recarga automática y levanta PostgreSQL si está configurado. |
| `npm run build` | Compila TypeScript. |
| `npm start` | Ejecuta la versión compilada. |
| `npm test` | Marcador temporal; se puede ampliar con suite de pruebas real. |

### Frontend

Desde `frontend/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la app en modo desarrollo. |
| `npm run build` | Genera build de producción. |
| `npm start` | Sirve la app compilada. |
| `npm run lint` | Ejecuta ESLint. |

## Arquitectura actual

La estructura del proyecto ya refleja la separación funcional entre datos, servicios y presentación:

```text
Trading-Lab/
├── .env
├── .env.example
├── compose.yaml
├── README.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts
│       ├── config/
│       ├── controllers/
│       │   ├── market.controller.ts
│       │   ├── assets.controller.ts
│       │   └── sync.controller.ts
│       ├── database/
│       ├── market-data/
│       ├── models/
│       ├── repositories/
│       │   ├── market-candle.repository.ts
│       │   └── asset.repository.ts
│       ├── routes/
│       │   ├── market.routes.ts
│       │   ├── assets.routes.ts
│       │   └── sync.routes.ts
│       ├── services/
│       │   ├── market/
│       │   └── indicators/
│       └── utils/
├── database/
│   └── migrations/
│       └── 001_market_schema.sql
├── docker/
├── docs/
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/market/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
├── .gitignore
└── Plan Roadmap Trading-Lab ACTUALIZADO.md
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

El volumen `trading_lab_postgres_data` conserva la información aunque reinicies el contenedor.

## Próximos pasos recomendados

- ampliar el catálogo de mercados y activos con más fuentes
- añadir modelos de usuario, cartera y señales
- definir backtesting y estrategias propias con indicadores avanzados
- crear pruebas automatizadas para backend y frontend
- reforzar validación de errores y manejo de rate limits
- preparar módulos de noticias, portfolio y alertas

## Notas finales

Trading Lab ya tiene una base de datos operativa, integración con datos reales, sincronización de series históricas y una primera experiencia visual útil para análisis de mercado. El proyecto está evolucionando desde una base técnica hacia un entorno de trading con dashboard, indicadores y lógica de persistencia que puede servir de base para futuras funcionalidades de estrategia, cartera y automatización.

