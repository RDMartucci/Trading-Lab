# Trading Lab — Roadmap del proyecto

Actualización: 2026-09-03

## Estado actual del proyecto

El proyecto ya ha consolidado la base técnica y funcional para operar como un entorno de análisis financiero con datos reales y capa visual básica.

### ✅ Completado

- Arquitectura monorepo con backend y frontend
- Backend en Express + TypeScript
- Frontend en Next.js + React + TypeScript
- PostgreSQL con Docker Compose y volumen persistente
- Integración con Twelve Data para cotizaciones y series históricas
- Persistencia de assets y candles en base de datos
- Endpoints REST para mercado, activos y sincronización
- Indicadores técnicos implementados: SMA, EMA y RSI
- Dashboard de mercado con carga real, gráficos y selector de indicadores
- Validación del pipeline completo: proveedor → PostgreSQL → API → frontend

### 🔄 En evolución

- Refinamiento visual del dashboard
- Mejoras de UX y comportamiento de gráficos
- Preparación para módulos de estrategia y backtesting
- Verificación de casos límite y manejo avanzado de errores

---

## Fases del roadmap

### FASE 0 — Definición y arquitectura ✅ COMPLETADA
- Objetivo de Trading Lab definido como plataforma de analítica, mercado y estrategias.
- Arquitectura recomendada: frontend, backend y base de datos separadas.
- Stack elegido: TypeScript, React, Node.js, PostgreSQL.

### FASE 1 — Estructura del proyecto ✅ COMPLETADA
- Monorepo configurado con `backend/` y `frontend/`.
- Git inicializado.
- Docker Compose preparado para PostgreSQL.
- Variables de entorno centralizadas.

### FASE 2 — Frontend base ✅ COMPLETADA
- Next.js con App Router.
- TypeScript configurado.
- CSS base y layout principal funcionando.
- Previstas rutas para dashboard y mercado.

### FASE 3 — Backend base ✅ COMPLETADA
- Express + TypeScript funcionando.
- `tsx` para desarrollo en caliente.
- `tsc` para build del backend.
- Endpoint de salud operativo.

### FASE 4 — Configuración y secretos ✅ COMPLETADA
- Variables de entorno en raíz del proyecto.
- Configuración centralizada para PostgreSQL y Twelve Data.
- Manejo seguro de credenciales.

### FASE 5 — Docker + PostgreSQL ✅ COMPLETADA
- PostgreSQL 17 levantado con Docker Compose.
- Volumen persistente configurado.
- Conexión verificada desde la aplicación.

### FASE 6 — Integración con Twelve Data ✅ COMPLETADA
- Provider para cotización actual.
- Provider para series históricas.
- Soporte de intervalos y tamaño de histórico.
- Manejo básico de errores del proveedor.

### FASE 7 — Persistencia de datos ✅ COMPLETADA
- Tabla `market_assets` creada.
- Tabla `market_candles` creada.
- Índices y restricciones para evitar duplicados.
- Repositorio y service para guardar y recuperar candles.

### FASE 8 — Refactor de arquitectura ✅ COMPLETADA
- Separación por controllers, routes, services y repositories.
- Ajuste del `app.ts` para modularización.
- Endpoints de mercado y assets reorganizados.

### FASE 9 — Data sync endpoint ✅ COMPLETADA
- Endpoint `POST /api/sync/assets/:symbol` implementado.
- Sincronización de datos desde Twelve Data hacia PostgreSQL.
- Conteo de candles insertadas y manejo de duplicados.

### FASE 10 — Validación del pipeline ✅ COMPLETADA
- Validado flujo completo: proveedor → base de datos → API.
- Confirmación de idempotencia y consistencia de datos.
- Verificación funcional de endpoints reales.

### FASE 11 — Dashboard de mercado ✅ COMPLETADA
- Vista de símbolo e intervalo.
- Cotización actual y métricas clave.
- Panel con candlesticks y volumen.
- Botón de sincronización desde la UI.
- Tabla de candles recientes.

### FASE 12 — Indicadores técnicos ✅ COMPLETADA
- Implementación de SMA, EMA y RSI.
- Cálculo en backend sobre series históricas.
- Visualización de indicadores desde la interfaz.

### FASE 13 — Mejora de visualización y UX 🔄 EN CURSO
Objetivo: hacer que el dashboard sea más usable y parecer una herramienta de trading real.

Incluye:
- refinamiento de gráficos
- mejora de leyendas y controles de zoom
- mejor lectura de señales técnicas
- preparación para más tipos de indicadores

### FASE 14 — Motor de estrategias 🔜 SIGUIENTE
Objetivo: pasar de indicadores a señales de trading.

Incluye:
- definiciones de strategy
- señales de entrada/salida
- combinación de indicadores
- evaluación básica de performance

### FASE 15 — Backtesting engine 🔜 SIGUIENTE
- aplicar estrategias sobre histórico persistido
- métricas: Sharpe, drawdown, win rate, CAGR
- análisis de rendimiento de estrategias

### FASE 16 — Gestión de capital y riesgo 🔜 SIGUIENTE
- stop loss
- take profit
- trailing stop
- sizing de posición
- comisiones y slippage

### FASE 17 — Optimización de parámetros 🔜 SIGUIENTE
- grid search sobre combinaciones de indicadores
- evaluación de sets de parámetros
- selección de configuraciones más robustas

### FASE 18 — Paper trading 🔜 SIGUIENTE
- cartera virtual
- seguimiento de P&L
- historial de operaciones simuladas

### FASE 19 — Usuarios, perfiles y autenticación 🔜 SIGUIENTE
- login / sesiones / JWT
- perfiles de usuario
- estrategias personales
- roles y permisos

### FASE 20 — Portafolio y señales avanzadas 🔜 SIGUIENTE
- cartera realista con posiciones
- monitorización de activos favoritos
- alertas y watchlists
- señales automáticas con lógica de prioridad

### FASE 21 — Producción y deployment 🔜 FUTURO
- contenedores y despliegue
- CI/CD
- logging y monitorización
- seguridad y backups
- entorno de producción estable

---

## Estado general del proyecto (2026-09-03)

✅ Base técnica consolidada
✅ Backend funcional con integración real de mercado
✅ PostgreSQL operativo y persistente
✅ Dashboard operativo con datos reales
✅ Indicadores técnicos implementados
✅ Base lista para estrategia, backtesting y crecimiento del producto

## Verificación funcional actual

- `GET /api/health` → OK
- `GET /api/market/quote/AAPL` → OK
- `GET /api/market/candles/AAPL?interval=1day&limit=10` → OK
- `POST /api/sync/assets/AAPL?interval=1day&outputsize=30` → OK
- Frontend de mercado cargando datos reales → OK

## Siguiente prioridad

1. Mejorar UX del dashboard y gráficos
2. Definir estrategia base con indicadores combinados
3. Preparar módulo de backtesting sobre historial
4. Expandir la capa de portfolio y señales

## Resumen

Trading Lab ya no es solo una base de proyecto: tiene infraestructura operativa, acceso a datos reales, persistencia, indicadores técnicos y una primera experiencia visual de trading. El siguiente gran salto será convertir esa base en un sistema de señales y backtesting con lógica de estrategia, evaluación de rendimiento y gestión operativa del usuario.

ESTADO: Final del proyecto

═══════════════════════════════════════════════════════════════════

🧭 Progreso actual

FASE 0  ██████████████████████  ✅ 100%
FASE 1  ██████████████████████  ✅ 100%
FASE 2  ██████████████████████  ✅ 100%
FASE 3  ██████████████████████  ✅ 100%
FASE 4  ██████████████████████  ✅ 100%
FASE 5  ██████████████████████  ✅ 100%
FASE 6  ██████████████████████  ✅ 100%
FASE 7  ██████████████████████  ✅ 100%

FASE 8  ░░░░░░░░░░░░░░░░░░░░░░  ⬅️ PRÓXIMO ENFOQUE

FASE 9  ░░░░░░░░░░░░░░░░░░░░░░
FASE 10 ░░░░░░░░░░░░░░░░░░░░░░
FASE 11 ░░░░░░░░░░░░░░░░░░░░░░
... (más fases)

═══════════════════════════════════════════════════════════════════

🎯 PRÓXIMO PASO CONCRETO — FASE 8

Ahora que tenemos:
✅ PostgreSQL con tablas assets y candles
✅ Repository que persiste datos
✅ Service que obtiene y guarda

El siguiente paso es LIMPIAR LA ARQUITECTURA en FASE 8:

1️⃣ Crear backend/src/controllers/market.controller.ts
   - Extraer lógica de app.ts
   - Crear métodos: getHistory, getPersistedHistory, getQuote

2️⃣ Crear backend/src/routes/market.routes.ts
   - GET /api/market/quote/:symbol
   - GET /api/market/history/:symbol
   - GET /api/market/candles/:symbol

3️⃣ Crear backend/src/controllers/assets.controller.ts
   - GET /api/assets
   - GET /api/assets/:symbol

4️⃣ Crear backend/src/routes/assets.routes.ts
   - GET /api/assets
   - GET /api/assets/:symbol

5️⃣ Refactorizar app.ts
   - Importar routes
   - Usar app.use()
   - Eliminar lógica inline

6️⃣ Pruebas:
   - npm run build
   - npm run dev
   - Verificar endpoints funcionan igual

Resultado esperado: Arquitectura limpia con separación de concerns,
lista para expandir sin que app.ts se convierta en un caos.

═══════════════════════════════════════════════════════════════════
