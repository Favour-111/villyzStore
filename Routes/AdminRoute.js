const express = require("express");
const route = express();
const ProductModel = require("../Model/ProductModel");
const CategoryModel = require("../Model/CategoryModel");
const BlogModel = require("../Model/BlogModel");
const { upload1, upload2, upload3 } = require("../upload"); // Correctly import upload config
const { cloudinary } = require("../cloudinary");
const mongoose = require("mongoose");
const OrderModel = require("../Model/OrderModel");
//applying multer
//creating product
route.post("/products", upload1.single("image"), async (req, res) => {
  try {
    // Generate new product ID
    let products = await ProductModel.find({});
    let Id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const {
      productName,
      newPrice,
      Rating,
      oldPrice,
      productDescription,
      categories,
      availability,
      deals,
      image, // Image URL from the frontend
    } = req.body;

    let imageUrl = image; // Use the URL from req.body if provided

    // If a file is uploaded, get the URL from Cloudinary
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Ensure at least one image source is provided
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        msg: "Please provide an image file or image URL",
      });
    }

    // Create the new product
    const createProduct = await ProductModel.create({
      id: Id,
      productName,
      Rating,
      availability,
      oldPrice,
      newPrice,
      productDescription,
      categories,
      deals,
      image: imageUrl, // Store the correct image source
    });

    if (createProduct) {
      res.status(201).send({
        success: true,
        msg: "Product created successfully",
        createProduct,
      });
    } else {
      res.status(500).send({
        success: false,
        msg: "Product cannot be created",
      });
    }
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send({
      success: false,
      msg: "Internal server error",
      error,
    });
  }
});
//getting all products
route.get("/getallProducts", async (req, res) => {
  const response = await ProductModel.find();
  if (response) {
    res.status(200).send({
      success: true,
      response,
    });
  }
});
//deleting products
route.delete("/products/delete/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request URL
    const deleteProduct = await ProductModel.findByIdAndDelete(id);

    if (!deleteProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//deleting all products
route.delete("/products/delete", async (req, res) => {
  try {
    const deleteProduct = await ProductModel.deleteMany();
    res.send({ success: true, message: "products deleted successfully" });
  } catch (error) {
    console.log(error.message);
  }
});
//getting single product
route.get("/products/:id", async function (req, res) {
  const { id } = req.params;
  const response = await ProductModel.findById(id);
  if (response) {
    res.status(200).send({ success: true, response: response });
  } else {
    res.status(404).send({ success: false, response: "product not found" });
  }
});
//editing

route.put("/products/:id", upload1.single("image"), async function (req, res) {
  try {
    const { id } = req.params;
    const {
      productName,
      newPrice,
      Rating,
      oldPrice,
      productDescription,
      categories,
      availability,
      deals,
      image, // This is the existing image URL (if no new file is uploaded)
    } = req.body;

    // Check if the product exists
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    let imageUrl = image || existingProduct.image; // Default to existing image

    // If a new file is uploaded, update the image URL
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
      });
      imageUrl = result.secure_url;
    }

    // Update fields
    const updateFields = {
      productName,
      newPrice,
      Rating,
      oldPrice,
      productDescription,
      categories,
      deals,
      availability,
      image: imageUrl, // Store the correct image URL
    };

    // Update the product in the database
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      updateFields,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      msg: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
});

module.exports = route;
route.post("/category", upload2.single("image"), async (req, res) => {
  try {
    let CategoryDB = await CategoryModel.find({});
    let Id =
      CategoryDB.length > 0 ? CategoryDB[CategoryDB.length - 1].id + 1 : 1;

    const { name, visibility } = req.body;
    let imageUrl = req.file ? req.file.path : ""; // Use Cloudinary URL from Multer

    const createCategory = await CategoryModel.create({
      id: Id,
      name,
      visibility,
      image: imageUrl, // Store Cloudinary URL
    });

    if (createCategory) {
      res.status(201).send({
        success: true,
        msg: "Category created successfully",
        createCategory,
      });
    } else {
      res.status(500).send({
        success: false,
        msg: "Category cannot be created",
      });
    }
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send({
      success: false,
      msg: "Internal server error",
      error,
    });
  }
});

//getting all category
route.get("/getallCategory", async (req, res) => {
  const response = await CategoryModel.find();
  if (response) {
    res.status(200).send({
      success: true,
      response,
    });
  }
});
// //deleting products
route.delete("/category/delete/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request URL
    const deleteCategory = await CategoryModel.findByIdAndDelete(id);

    if (!deleteCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// //deleting all products
// route.delete("/products/delete", async (req, res) => {
//   try {
//     const deleteProduct = await ProductModel.deleteMany();
//     res.send({ success: true, message: "products deleted successfully" });
//   } catch (error) {
//     console.log(error.message);
//   }
// });
// //getting single category
route.get("/category/:id", async function (req, res) {
  const { id } = req.params;
  const response = await CategoryModel.findById(id);
  if (response) {
    res.status(200).send({ success: true, response: response });
  } else {
    res.status(404).send({ success: false, response: "category not found" });
  }
});
// //editing

route.put("/category/:id", upload2.single("image"), async function (req, res) {
  const { id } = req.params;
  const { name, visibility } = req.body;

  try {
    let imageUrl = req.file ? req.file.path : null; // Use existing Cloudinary URL

    // Prepare the update fields
    const updateFields = { name, visibility };

    // Add the new image URL if a new image is uploaded
    if (imageUrl) {
      updateFields.image = imageUrl;
    }

    // Update the category in the database
    const response = await CategoryModel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (response) {
      return res.status(200).json({
        success: true,
        response,
        msg: "Category updated successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        msg: "Category not found",
      });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
});

route.post("/blog", upload3.single("image"), async (req, res) => {
  try {
    const { BlogTitle, BlogDate, BlogVisibility, BlogDescription } = req.body;

    let imageUrl = req.file ? req.file.path : ""; // Use the existing Cloudinary URL

    const createBlog = await BlogModel.create({
      BlogTitle,
      BlogDate,
      BlogVisibility,
      BlogDescription,
      image: imageUrl, // Store the Cloudinary URL
    });

    if (createBlog) {
      res.status(201).send({
        success: true,
        msg: "Blog created successfully",
        createBlog,
      });
    } else {
      res.status(500).send({
        success: false,
        msg: "Blog cannot be created",
      });
    }
  } catch (error) {
    console.error("Error creating Blog:", error);
    res.status(500).send({
      success: false,
      msg: "Internal server error",
      error: error.message || error,
    });
  }
});

// //getting all blog
route.get("/getallBlog", async (req, res) => {
  const response = await BlogModel.find();
  if (response) {
    res.status(200).send({
      success: true,
      response,
    });
  }
});
// // //deleting products
route.delete("/blog/delete/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request URL
    const deleteBlog = await BlogModel.findByIdAndDelete(id);

    if (!deleteBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

route.post("/addOrder", async (req, res) => {
  try {
    const {
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

// 📌 Get a single order by ID
route.get("/order/:id", async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Update order status automatically (e.g., from "Pending" to "Delivered")
route.put("/updateOrderStatus/:id", async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Example: If order status is pending, change it to delivered
    order.orderStatus = "Delivered";

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Delete a single order by ID
route.delete("/deleteOrder/:id", async (req, res) => {
  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// 📌 Get all orders
route.get("/allOrders", async (req, res) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }); // Sort by latest orders first
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
route.delete("/deleteOrders", async (req, res) => {
  try {
    const response = await OrderModel.deleteMany({}); // Ensure it deletes all documents

    if (response.deletedCount > 0) {
      res.status(200).json({ message: "Orders deleted successfully" });
    } else {
      res.status(404).json({ message: "No orders found to delete" });
    }
  } catch (error) {
    console.error("Error deleting orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = route;
