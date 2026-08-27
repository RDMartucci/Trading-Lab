# Trading Lab

Trading Lab es una plataforma en desarrollo para explorar, analizar y probar
estrategias de trading. El proyecto está organizado como una aplicación web
con un frontend en Next.js, una API en Express y una base de datos PostgreSQL
gestionada con Docker Compose.

> **Estado actual:** el proyecto se encuentra en una etapa inicial. El backend
> expone un endpoint de salud y el frontend conserva la pantalla inicial de
> Next.js. Las capas de servicios, modelos, repositorios y rutas ya tienen una
> estructura preparada para continuar el desarrollo.

## Stack tecnológico

- **Frontend:** Next.js 16, React 19, TypeScript y Tailwind CSS 4.
- **Backend:** Node.js, Express 5, TypeScript y `tsx` para desarrollo.
- **Base de datos:** PostgreSQL 17.
- **Infraestructura local:** Docker Compose.

## Requisitos

- Node.js compatible con las versiones declaradas en los `package.json`.
- npm.
- Docker Desktop con Docker Compose.

## Inicio rápido

### 1. Configurar PostgreSQL

En la raíz del proyecto, crea un archivo `.env` con las credenciales que
utilizará el contenedor:

```env
POSTGRES_DB=trading_lab
POSTGRES_USER=trading_lab
POSTGRES_PASSWORD=change-me
```

Inicia la base de datos:

```bash
docker compose up -d postgres
```

PostgreSQL quedará disponible en `localhost:5432`.

### 2. Iniciar el backend

En una terminal:

```bash
cd backend
npm install
npm run dev
```

La API se inicia en `http://localhost:4000`.

Puedes comprobar su estado con:

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

### 3. Iniciar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3000` en el navegador.

## Scripts disponibles

### Backend

Ejecutados desde `backend/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia la API en modo desarrollo con recarga automática. |
| `npm run build` | Compila TypeScript en `backend/dist/`. |
| `npm start` | Ejecuta la API compilada. |
| `npm test` | Marcador temporal; todavía no hay pruebas configuradas. |

### Frontend

Ejecutados desde `frontend/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm start` | Sirve la compilación de producción. |
| `npm run lint` | Ejecuta ESLint. |

## Estructura del proyecto

```text
Trading-Lab/
├── backend/
│   └── src/
│       ├── app.ts              # Punto de entrada de la API
│       ├── config/              # Configuración
│       ├── controllers/         # Controladores HTTP
│       ├── middleware/          # Middleware de Express
│       ├── models/              # Modelos de dominio
│       ├── repositories/        # Acceso a datos
│       ├── routes/              # Rutas de la API
│       ├── services/            # Lógica de negocio
│       └── utils/               # Utilidades compartidas
├── database/                    # Espacio para scripts y migraciones
├── docker/                      # Recursos auxiliares de Docker
├── docs/                        # Documentación del proyecto
├── frontend/
│   └── app/                     # App Router de Next.js
├── compose.yaml                 # Servicio local de PostgreSQL
└── README.md
```

## Detener el entorno

Para detener PostgreSQL sin eliminar los datos persistidos:

```bash
docker compose stop postgres
```

Para detenerlo y eliminar también el contenedor:

```bash
docker compose down
```

El volumen `trading_lab_postgres_data` conserva los datos mientras no se
elimine explícitamente.

## Próximos pasos sugeridos

- Conectar el backend con PostgreSQL y añadir migraciones.
- Definir contratos y rutas para mercado, indicadores, noticias, señales,
	portafolios y backtesting.
- Reemplazar la pantalla inicial de Next.js por el espacio de trabajo de
	Trading Lab.
- Incorporar pruebas automatizadas para backend y frontend.

