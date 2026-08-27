import express from "express";

const app = express();

const PORT = 4000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "trading-lab-backend"
  });
});

app.listen(PORT, () => {
  console.log(`Trading Lab API running on http://localhost:${PORT}`);
});
