const express = require("express");
const app = express();

app.use(express.json());

app.get("/api", (_req, res) => {
  res.send("Ledgerly backend is running.");
});

app.listen(5000, () => {
  console.log(`Server listening on port 5000`);
});

