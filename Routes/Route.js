const express = require("express");
const UserRoutes = express.Router();
const UserModel = require("../Model/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config(); // Ensure dotenv is required
const TokenModel = require("../Model/TokenModel");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const AddressModel = require("../Model/AddressModel");
const OrderModel = require("../Model/OrderModel");
const { default: axios } = require("axios");
const endpointSecret = "whsec_9KLOdyRNPx8or1znZV09J3GPWvmo78Mu";
const stripe = require("stripe")(process.env.STRIPE_SECRET);
// User Registration

UserRoutes.get("/", async (req, res) => {
  res.send("server running");
});
const verifyEmail = (email, link) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "omojolaobaloluwa@gmail.com",
      pass: "vlpa equz rlyq cqva",
    },
  });

  const mailOptions = {
    from: "villyz@gmail.com",
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${link}" style="background: #007bff; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-size: 16px;">
            Verify Email
          </a>
        </div>
        <p>If the button above doesn’t work, you can also verify your email by clicking the link below:</p>
        <p><a href="${link}" style="word-break: break-all; color: #007bff;">${link}</a></p>
        <p>If you did not sign up for this account, please ignore this email.</p>
        <p>Best regards,<br>Villyz Team</p>
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.send({
        success: false,
        msg: "Error sending email",
      });
    }
    res.send({
      success: true,
      msg: "Email sent successfully",
    });
  });
};
UserRoutes.post("/users", async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      email,
      password,
      phoneNumber,
      address = {},
    } = req.body;

    // Check if user already exists
    const EmailCheck = await UserModel.findOne({ email: email });
    if (EmailCheck) {
      return res
        .status(400)
        .json({ success: false, msg: "User with this email already exists" });
    }

    // Generate default cart data
    let cart = {};
    for (let i = 0; i < 300; i++) {
      cart[i] = 0;
    }
    let list = {};
    for (let i = 0; i < 300; i++) {
      list[i] = 0;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await UserModel.create({
      FirstName,
      LastName,
      email,
      password: hashedPassword, // ✅ Fixed password storage
      phoneNumber,
      CartData: cart,
      Wishlist: list,
      address: {
        FirstName: address.FirstName || "",
        LastName: address.LastName || "",
        PhoneNumber: address.PhoneNumber || "",
        Fee: address.Fee || "",
        street: address.street || "",
        city: address.city || "",
        postalCode: address.postalCode || "",
        country: address.country || "",
        state: address.state || "",
      },
    });

    // Generate token
    const token = await new TokenModel({
      userid: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    const link = `https://villyz-store-md6b-m1v1g4wpu-favour-111s-projects.vercel.app/users/${user._id}/verify/${token.token}`;
    await verifyEmail(user.email, link);
    return res.status(201).json({
      success: true,
      msg: "An email has been sent to you",
      link,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});
//creating middlewear to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .json({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ errors: "Invalid token, authentication failed" });
  }
};

//endpoint for cart
UserRoutes.post("/addtocart", fetchUser, async (req, res) => {
  try {
    console.log("added", req.body.itemId);
    let userData = await UserModel.findById(req.user.id);

    if (!userData.CartData) userData.CartData = {}; // Ensure CartData exists
    userData.CartData[req.body.itemId] =
      (userData.CartData[req.body.itemId] || 0) + 1;

    await UserModel.findByIdAndUpdate(req.user.id, {
      CartData: userData.CartData,
    });

    res.json({ message: "Item added to cart", cart: userData.CartData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//endpoint for wish list
UserRoutes.post("/addtowishlist", fetchUser, async (req, res) => {
  try {
    console.log("added", req.body.itemId);
    let userData = await UserModel.findById(req.user.id);

    if (!userData.Wishlist) userData.Wishlist = {}; // Fix key name
    userData.Wishlist[req.body.itemId] =
      (userData.Wishlist[req.body.itemId] || 0) + 1;

    await UserModel.findByIdAndUpdate(req.user.id, {
      Wishlist: userData.Wishlist,
    });

    res.json({ message: "Item added to wishlist", list: userData.Wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//endpoint to remove wish list
UserRoutes.post("/removeFromList", fetchUser, async (req, res) => {
  try {
    console.log("removed", req.body.itemId);

    let userData = await UserModel.findById(req.user.id);

    if (!userData || !userData.Wishlist) {
      return res.status(400).json({ error: "Cart is empty or user not found" });
    }

    if (userData.Wishlist[req.body.itemId]) {
      userData.Wishlist[req.body.itemId] -= 1;

      // Remove item if count is 0
      if (userData.Wishlist[req.body.itemId] === 0) {
        delete userData.Wishlist[req.body.itemId];
      }

      await UserModel.findByIdAndUpdate(req.user.id, {
        $set: { Wishlist: userData.Wishlist },
      });

      return res.json({
        message: "Item removed from cart",
        list: userData.Wishlist,
      });
    } else {
      return res.status(400).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//endPoint to remove product from cart
UserRoutes.post("/removeFromCart", fetchUser, async (req, res) => {
  try {
    console.log("removed", req.body.itemId);

    let userData = await UserModel.findById(req.user.id);

    if (!userData || !userData.CartData) {
      return res.status(400).json({ error: "Cart is empty or user not found" });
    }

    if (userData.CartData[req.body.itemId]) {
      userData.CartData[req.body.itemId] -= 1;

      // Remove item if count is 0
      if (userData.CartData[req.body.itemId] === 0) {
        delete userData.CartData[req.body.itemId];
      }

      await UserModel.findByIdAndUpdate(req.user.id, {
        $set: { CartData: userData.CartData },
      });

      return res.json({
        message: "Item removed from cart",
        cart: userData.CartData,
      });
    } else {
      return res.status(400).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
UserRoutes.post("/deleteFromCart", fetchUser, async (req, res) => {
  try {
    console.log("Deleting item:", req.body.itemId);

    let userData = await UserModel.findById(req.user.id);

    if (!userData || !userData.CartData) {
      return res.status(400).json({ error: "Cart is empty or user not found" });
    }

    if (userData.CartData[req.body.itemId]) {
      // Remove the item completely
      delete userData.CartData[req.body.itemId];

      await UserModel.findByIdAndUpdate(req.user.id, {
        $set: { CartData: userData.CartData },
      });

      return res.json({
        message: "Item completely removed from cart",
        cart: userData.CartData,
      });
    } else {
      return res.status(400).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to get cart
UserRoutes.post("/getCart", fetchUser, async (req, res) => {
  console.log("GetCart");
  let userData = await UserModel.findOne({ _id: req.user.id });
  res.json(userData.CartData);
});
//endpoint to get wish list
UserRoutes.post("/getList", fetchUser, async (req, res) => {
  console.log("GetList");
  let userData = await UserModel.findOne({ _id: req.user.id });
  res.json(userData.Wishlist);
});
// User Login
UserRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, msg: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid password" });
    }

    // Check if email is verified
    let token;
    if (!user.isConfirmed) {
      token = await TokenModel.findOne({ userid: user._id });
      if (!token) {
        token = await new TokenModel({
          userid: user._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
      }
      const link = `https://villyz-store-md6b-m1v1g4wpu-favour-111s-projects.vercel.app/users/${user._id}/verify/${token.token}`;
      await verifyEmail(user.email, link);
      return res.status(201).json({
        success: false,
        msg: "Email not verified. Please check your email.",
        link,
      });
    }

    // ✅ Generate JWT Token
    const authToken = jwt.sign(
      { user: { id: user._id } },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    return res.status(200).json({
      success: true,
      msg: "Login successful",
      token: authToken, // ✅ Return the token
      id: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

//verify email
UserRoutes.get("/users/:id/verify/:token", async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.params.id });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid link or user not found." });
    }

    if (user.isConfirmed) {
      return res.status(200).json({ message: "Email already verified." });
    }

    const token = await TokenModel.findOne({
      userid: req.params.id,
      token: req.params.token,
    });

    if (!token) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { isConfirmed: true }
    );
    await TokenModel.deleteOne({ _id: token._id });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

//forgot password
UserRoutes.post("/forgot_password", async (req, res) => {
  const { email } = req.body;
  try {
    // Find the user by email
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User doesn't exist",
      });
    }

    // Delete old token if it exists
    await TokenModel.findOneAndDelete({ userid: user._id });

    // Generate and store new token
    const token = await new TokenModel({
      userid: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "omojolaobaloluwa@gmail.com",
        pass: "vlpa equz rlyq cqva",
      },
    });

    // Email options
    const mailOptions = {
      from: "villyz@gmail.com",
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://villyz-store-md6b-m1v1g4wpu-favour-111s-projects.vercel.app/reset-password/${user._id}/${token.token}" 
               style="background: #007bff; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>If the button above doesn’t work, copy and paste the link below into your browser:</p>
          <p><a href="https://villyz-store-md6b-m1v1g4wpu-favour-111s-projects.vercel.app/reset-password/${user._id}/${token.token}" style="word-break: break-all; color: #007bff;">
            https://villyz-store-md6b-m1v1g4wpu-favour-111s-projects.vercel.app/reset-password/${user._id}/${token.token}
          </a></p>
          <p>Best regards,<br>Villyz Team</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      msg: "Email sent successfully",
    });
  } catch (err) {
    console.error("Error processing password reset:", err);
    res.status(500).json({
      success: false,
      msg: "Error processing password reset",
    });
  }
});

// Reset password route
UserRoutes.post("/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    // Find token associated with user
    const tokenDoc = await TokenModel.findOne({ userid: id, token });
    if (!tokenDoc) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid or expired token" });
    }

    // Find user by ID
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the updated password
    await user.save();

    // Delete the token after successful password reset
    await TokenModel.findByIdAndDelete(tokenDoc._id);

    res.json({ success: true, msg: "Password reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: "Server error", error: error.message });
  }
});

// Get All Users
UserRoutes.get("/alluser", async (req, res) => {
  try {
    const getUser = await UserModel.find();
    if (!getUser || getUser.length === 0) {
      return res.status(404).json({ success: false, msg: "No users found" });
    }
    return res.status(200).json({ success: true, users: getUser });
  } catch (error) {
    console.error("Fetch users error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// Get Single User
UserRoutes.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await UserModel.findById(id);

    if (!findUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    return res.status(200).json({ success: true, user: findUser });
  } catch (error) {
    console.error("Fetch user error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// ✅ Verify Password Route
UserRoutes.post("/verify-password", async (req, res) => {
  const { id, password } = req.body; // Expecting user ID & password

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Incorrect password" });
    }

    return res.json({ success: true, msg: "Password verified" });
  } catch (error) {
    console.error("Error verifying password:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// ✅ Delete Account Route (requires password verification)
UserRoutes.delete("/deleteuser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).send({
        success: false,
        msg: "User not found",
      });
    }
    res.send({
      success: true,
      msg: "User deleted",
      deletedUser,
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send({
      success: false,
      msg: "Error deleting user",
    });
  }
});

// Add a new address
UserRoutes.post("/addAddress", async (req, res) => {
  try {
    const {
      userId,
      street,
      state,
      city,
      postalCode,
      country,
      isDefault,
      FirstName,
      LastName,
      PhoneNumber,
      Fee,
    } = req.body;

    // If setting an address as default, update all others to false
    if (isDefault) {
      await AddressModel.updateMany({ userId }, { isDefault: false });
    }

    // Create and save new address
    const newAddress = new AddressModel({
      userId,
      street,
      state,
      city,
      postalCode,
      country,
      isDefault,
      FirstName,
      LastName,
      PhoneNumber,
      Fee,
    });
    await newAddress.save();

    res
      .status(201)
      .json({ message: "Address added successfully!", address: newAddress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all addresses for a user
UserRoutes.get("/address/:id", async (req, res) => {
  try {
    const addresses = await AddressModel.find({ userId: req.params.id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//deleting address
UserRoutes.delete("/address/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteAddress = await AddressModel.findByIdAndDelete(id);
    if (!deleteAddress) {
      return res.status(404).send({
        success: false,
        msg: "Address not found",
      });
    }
    res.send({
      success: true,
      msg: "Address deleted",
      deleteAddress,
    });
  } catch (err) {
    console.error("Error deleting Address:", err);
    res.status(500).send({
      success: false,
      msg: "Error deleting Address",
    });
  }
});

// Set an address as default
UserRoutes.put("/addresses/:id/set-default", async (req, res) => {
  const { id } = req.params;

  try {
    // Set all addresses' isDefault to false
    await AddressModel.updateMany({}, { isDefault: false });

    // Set the selected address as default
    await AddressModel.findByIdAndUpdate(id, { isDefault: true });

    res.json({ success: true, message: "Default address updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
UserRoutes.post("/addOrder", async (req, res) => {
  try {
    const {
      UserID,
      name,
      email,
      OrderPrice, // Changed to camelCase
      PaymentStatus,
      paymentReference,
      DeliveryFee,
      orderStatus, // Default value
      PhoneNumber,
      cartItems = [], // Ensure it's always an array
      street,
      state,
      city,
      postalCode,
      country,
    } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items cannot be empty" });
    }

    const newOrder = new OrderModel({
      UserID,
      name,
      email,
      OrderPrice,
      PaymentStatus,
      paymentReference,
      PhoneNumber,
      DeliveryFee,
      orderStatus,
      Orders: cartItems.map((item) => ({
        productId: item._id,
        name: item.productName,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),
      street,
      state,
      city,
      postalCode,
      country,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});
UserRoutes.post("/checkout", async (req, res) => {
  const { products, shippingFee } = req.body;

  const lineItems = products.map((product) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: product.name,
        images: [product.image],
      },
      unit_amount: Math.round(Number(product.price) * 100),
    },
    quantity: product.quantity,
  }));

  // Add shipping fee
  if (shippingFee) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Shipping Fee" },
        unit_amount: Math.round(Number(shippingFee) * 100),
      },
      quantity: 1,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "https://villyz-store-md6b.vercel.app/success",
      cancel_url: "https://villyz-store-md6b.vercel.app/cancel",
    });

    // Fetch payment_intent (optional)
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id);

    res.json({
      id: session.id,
      paymentReference: sessionDetails.payment_intent,
    });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = UserRoutes;
