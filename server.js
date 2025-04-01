const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Route = require("./Routes/Route");
const AdminRoute = require("./Routes/AdminRoute");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const axios = require("axios");
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
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // Use raw body, not parsed JSON
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle payment success event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("✅ Payment successful! Sending order...");

      try {
        await axios.post("https://villyzstore.onrender.com/addOrder", {
          paymentReference: session.payment_intent,
          email: session.customer_email,
        });

        console.log("✅ Order sent successfully!");
      } catch (error) {
        console.error("❌ Failed to send order:", error);
      }
    }

    res.status(200).send("Webhook received");
  }
);

app.use(express.json());
app.use(cors());
app.use(AdminRoute);
app.use(Route);

// Starting the server
app.listen(process.env.Port, () => {
  console.log(`App listening on port ${process.env.Port}`);
});
