const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./database");

const globalStatusController = require("./controller/global-stat.controller");
const { get } = require("express/lib/response");

async function launchServer() {
  const app = express();

  app.use(bodyParser.json());

  app.get("/global-stats", globalStatusController.getAll);
  app.post("/global-stats", globalStatusController.insertOrUpdate);
  app.delete("/global-stats", globalStatusController.remove);

  app.get("/", (req, res) => {
    res.json({ message: "Hello CoronaBoard!" });
  });

  try {
    await sequelize.sync();
    console.log("Database is ready!");
  } catch (error) {
    console.log("Unable to connect to the database!");
    console.log(error);
    process.exit(1);
  }

  const port = process.env.PORT || 8000;

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

launchServer();
