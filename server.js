const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Route = require("./Routes/Route");
const AdminRoute = require("./Routes/AdminRoute");
dotenv.config();

// Connecting to MongoDB
mongoose
  .connect(process.env.URL, {})
  .then(() => {
    console.log("Connection established");
  })
  .catch((error) => {
    console.error("Connection error", error);
  });
//Port
app.use(express.json());
app.use(cors());
app.use(AdminRoute);
app.use(Route);

// Starting the server
app.listen(process.env.Port, () => {
  console.log(`App listening on port ${process.env.Port}`);
});
