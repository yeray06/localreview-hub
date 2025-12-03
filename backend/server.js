const express = require("express");
const cors = require("cors");
require("./db");  // <-- ESTA LÍNEA IMPORTANTE

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/reviews", require("./routes/reviews"));

app.get("/", (req, res) => {
  res.json({ message: "API LocalReviewHub funcionando" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend funcionando en http://localhost:${PORT}`);
});
