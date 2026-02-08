const express = require("express");

const app = express();

// Puerto que Railway asigna automáticamente
const PORT = process.env.PORT || 3000;

// Ruta de prueba
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
