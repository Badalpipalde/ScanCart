"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express7 = __toESM(require("express"));
var import_helmet = __toESM(require("helmet"));
var import_cors = __toESM(require("cors"));
var import_cookie_parser = __toESM(require("cookie-parser"));
var import_morgan = __toESM(require("morgan"));
var import_mongoose6 = __toESM(require("mongoose"));

// src/config/env.ts
var import_dotenv = __toESM(require("dotenv"));
var import_zod = require("zod");
import_dotenv.default.config();
var envSchema = import_zod.z.object({
  PORT: import_zod.z.string().default("5000"),
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: import_zod.z.string().default("http://localhost:5173"),
  MONGODB_URI: import_zod.z.string().default("mongodb://127.0.0.1:27017/scancart"),
  JWT_SECRET: import_zod.z.string().min(16, "JWT_SECRET must be at least 16 chars").default("scancart_jwt_super_secret_production_key_2026_change_in_prod"),
  JWT_EXPIRES_IN: import_zod.z.string().default("7d"),
  RECEIPT_SECRET: import_zod.z.string().min(16, "RECEIPT_SECRET must be at least 16 chars").default("scancart_hmac_sha256_receipt_secret_key_84920491"),
  RAZORPAY_KEY_ID: import_zod.z.string().default("rzp_test_mockKeyId12345"),
  RAZORPAY_KEY_SECRET: import_zod.z.string().default("mockKeySecretValue98765"),
  RAZORPAY_WEBHOOK_SECRET: import_zod.z.string().default("mockWebhookSecretValue123")
});
var parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.warn("\u26A0\uFE0F Environment variable validation warnings:", parsedEnv.error.format());
}
var env = parsedEnv.success ? parsedEnv.data : {
  PORT: process.env.PORT || "5000",
  NODE_ENV: ["development", "production", "test"].includes(process.env.NODE_ENV || "") ? process.env.NODE_ENV : "production",
  CLIENT_URL: process.env.CLIENT_URL || "https://scancart-cloud.vercel.app",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scancart",
  JWT_SECRET: process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16 ? process.env.JWT_SECRET : "scancart_jwt_super_secret_production_key_2026_change_in_prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  RECEIPT_SECRET: process.env.RECEIPT_SECRET && process.env.RECEIPT_SECRET.length >= 16 ? process.env.RECEIPT_SECRET : "scancart_hmac_sha256_receipt_secret_key_84920491",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKeyId12345",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "mockKeySecretValue98765",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "mockWebhookSecretValue123"
};

// src/config/db.ts
var import_mongoose = __toESM(require("mongoose"));
var mongodInstance = null;
var connectionPromise = null;
async function connectDB() {
  if (import_mongoose.default.connection.readyState === 1) {
    return;
  }
  if (connectionPromise) {
    return connectionPromise;
  }
  const primaryUri = env.MONGODB_URI;
  connectionPromise = (async () => {
    try {
      await import_mongoose.default.connect(primaryUri, {
        serverSelectionTimeoutMS: 5e3
      });
      console.log(`\u2705 Connected to MongoDB at: ${primaryUri.split("@").pop()}`);
    } catch (err) {
      console.error(`\u26A0\uFE0F Could not connect to primary MongoDB (${err.message}).`);
      const isProductionOrServerless = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
      if (isProductionOrServerless) {
        throw new Error(
          `Failed to connect to MongoDB Atlas (${err.message}). Please verify: 1) MONGODB_URI is set correctly in Vercel environment variables, and 2) Network Access in MongoDB Atlas allows 0.0.0.0/0 (anywhere).`
        );
      }
      console.log(`\u{1F680} Starting in-memory MongoDB fallback server for local development...`);
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongodInstance = await MongoMemoryServer.create();
        const inMemoryUri = mongodInstance.getUri();
        await import_mongoose.default.connect(inMemoryUri);
        console.log(`\u2705 Connected to in-memory MongoDB at: ${inMemoryUri}`);
      } catch (inMemErr) {
        console.error("\u274C Failed to start in-memory MongoDB:", inMemErr.message);
        throw inMemErr;
      }
    }
  })().catch((err) => {
    connectionPromise = null;
    throw err;
  });
  return connectionPromise;
}

// src/routes/index.ts
var import_express6 = require("express");

// src/routes/auth.routes.ts
var import_express = require("express");

// src/controllers/auth.controller.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));

// src/models/User.ts
var import_mongoose2 = __toESM(require("mongoose"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var userSchema = new import_mongoose2.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"]
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false
    },
    role: {
      type: String,
      enum: ["customer", "staff", "admin"],
      default: "customer",
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);
userSchema.methods.comparePassword = async function(candidatePassword) {
  return import_bcryptjs.default.compare(candidatePassword, this.passwordHash);
};
var User = import_mongoose2.default.model("User", userSchema);

// src/utils/apiError.ts
var ApiError = class _ApiError extends Error {
  statusCode;
  errors;
  isOperational;
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(msg, errors = []) {
    return new _ApiError(400, msg, errors);
  }
  static unauthorized(msg = "Unauthorized access") {
    return new _ApiError(401, msg);
  }
  static forbidden(msg = "Forbidden") {
    return new _ApiError(403, msg);
  }
  static notFound(msg = "Resource not found") {
    return new _ApiError(404, msg);
  }
  static conflict(msg) {
    return new _ApiError(409, msg);
  }
  static internal(msg = "Internal server error") {
    return new _ApiError(500, msg);
  }
};

// src/utils/response.ts
var sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// src/controllers/auth.controller.ts
var generateToken = (user) => {
  return import_jsonwebtoken.default.sign(
    { userId: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
var sendTokenResponse = (res, user, statusCode = 200, message = "Success") => {
  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
  return sendSuccess(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    },
    message,
    statusCode
  );
};
var register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict("An account with this email address already exists.");
    }
    const salt = await import_bcryptjs2.default.genSalt(12);
    const passwordHash = await import_bcryptjs2.default.hash(password, salt);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "customer"
    });
    sendTokenResponse(res, newUser, 201, "User account created successfully");
  } catch (err) {
    next(err);
  }
};
var login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password.");
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized("Invalid email or password.");
    }
    sendTokenResponse(res, user, 200, "Logged in successfully");
  } catch (err) {
    next(err);
  }
};
var logout = async (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax"
  });
  sendSuccess(res, null, "Logged out successfully");
};
var getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("Not authenticated");
    }
    sendSuccess(res, {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// src/middleware/validate.ts
var import_zod2 = require("zod");
var validate = (schema) => {
  return async (req, _res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof import_zod2.ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message
        }));
        next(ApiError.badRequest("Validation failed", formattedErrors));
      } else {
        next(error);
      }
    }
  };
};

// src/validators/auth.schema.ts
var import_zod3 = require("zod");
var registerSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    name: import_zod3.z.string().min(2, "Name must be at least 2 characters").max(60),
    email: import_zod3.z.string().email("Please enter a valid email address"),
    password: import_zod3.z.string().min(6, "Password must be at least 6 characters"),
    role: import_zod3.z.enum(["customer", "staff", "admin"]).optional()
  })
});
var loginSchema = import_zod3.z.object({
  body: import_zod3.z.object({
    email: import_zod3.z.string().email("Please enter a valid email address"),
    password: import_zod3.z.string().min(1, "Password is required")
  })
});

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var authenticate = async (req, _res, next) => {
  try {
    let token;
    if (req.cookies && (req.cookies.token || req.cookies.jwt)) {
      token = req.cookies.token || req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw ApiError.unauthorized("Authentication required. Please log in.");
    }
    const decoded = import_jsonwebtoken2.default.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized("User associated with this token no longer exists.");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(ApiError.unauthorized("Invalid or expired authentication token."));
    } else {
      next(error);
    }
  }
};

// src/middleware/rateLimiter.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var authLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 30,
  // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes."
  }
});
var paymentLimiter = (0, import_express_rate_limit.default)({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 25,
  // 25 payment requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many payment requests. Please wait a few moments before trying again."
  }
});
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 120,
  // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down."
  }
});

// src/routes/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);
var auth_routes_default = router;

// src/routes/product.routes.ts
var import_express2 = require("express");

// src/models/Product.ts
var import_mongoose3 = __toESM(require("mongoose"));
var productSchema = new import_mongoose3.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 120
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true
    },
    barcode: {
      type: String,
      required: [true, "Barcode is required"],
      unique: true,
      trim: true,
      index: true
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be non-negative"]
    },
    taxPercent: {
      type: Number,
      default: 5,
      min: [0, "Tax percentage cannot be negative"],
      max: [100, "Tax percentage cannot exceed 100"]
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);
var Product = import_mongoose3.default.model("Product", productSchema);

// src/controllers/product.controller.ts
var getProductByBarcode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const trimmedCode = code.trim();
    const product = await Product.findOne({
      barcode: trimmedCode,
      isActive: true
    });
    if (!product) {
      throw ApiError.notFound(`No active product found for barcode: ${trimmedCode}`);
    }
    sendSuccess(res, { product }, "Product found successfully");
  } catch (err) {
    next(err);
  }
};
var getAllProducts = async (req, res, next) => {
  try {
    const { category, search, activeOnly } = req.query;
    const filter = {};
    if (activeOnly !== "false") {
      filter.isActive = true;
    }
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } }
      ];
    }
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    sendSuccess(res, { products, count: products.length }, "Products retrieved");
  } catch (err) {
    next(err);
  }
};
var getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound("Product not found");
    }
    sendSuccess(res, { product });
  } catch (err) {
    next(err);
  }
};
var createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    sendSuccess(res, { product }, "Product created successfully", 201);
  } catch (err) {
    next(err);
  }
};
var updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) {
      throw ApiError.notFound("Product not found");
    }
    sendSuccess(res, { product }, "Product updated successfully");
  } catch (err) {
    next(err);
  }
};
var deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      throw ApiError.notFound("Product not found");
    }
    sendSuccess(res, null, "Product deactivated successfully");
  } catch (err) {
    next(err);
  }
};

// src/validators/product.schema.ts
var import_zod4 = require("zod");
var createProductSchema = import_zod4.z.object({
  body: import_zod4.z.object({
    name: import_zod4.z.string().min(2).max(120),
    sku: import_zod4.z.string().min(3).max(30),
    barcode: import_zod4.z.string().min(4).max(30),
    price: import_zod4.z.number().min(0, "Price must be positive"),
    taxPercent: import_zod4.z.number().min(0).max(100).default(5),
    stock: import_zod4.z.number().int().min(0, "Stock cannot be negative"),
    image: import_zod4.z.string().url().optional(),
    category: import_zod4.z.string().min(2),
    isActive: import_zod4.z.boolean().optional()
  })
});
var updateProductSchema = import_zod4.z.object({
  params: import_zod4.z.object({
    id: import_zod4.z.string()
  }),
  body: import_zod4.z.object({
    name: import_zod4.z.string().min(2).max(120).optional(),
    sku: import_zod4.z.string().min(3).max(30).optional(),
    barcode: import_zod4.z.string().min(4).max(30).optional(),
    price: import_zod4.z.number().min(0).optional(),
    taxPercent: import_zod4.z.number().min(0).max(100).optional(),
    stock: import_zod4.z.number().int().min(0).optional(),
    image: import_zod4.z.string().url().optional(),
    category: import_zod4.z.string().min(2).optional(),
    isActive: import_zod4.z.boolean().optional()
  })
});
var barcodeParamSchema = import_zod4.z.object({
  params: import_zod4.z.object({
    code: import_zod4.z.string().min(1, "Barcode code is required")
  })
});

// src/middleware/role.ts
var authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
        )
      );
    }
    next();
  };
};

// src/routes/product.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/barcode/:code", validate(barcodeParamSchema), getProductByBarcode);
router2.get("/", getAllProducts);
router2.get("/:id", getProductById);
router2.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createProductSchema),
  createProduct
);
router2.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validate(updateProductSchema),
  updateProduct
);
router2.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  deleteProduct
);
var product_routes_default = router2;

// src/routes/cart.routes.ts
var import_express3 = require("express");

// src/models/Cart.ts
var import_mongoose4 = __toESM(require("mongoose"));
var cartItemSchema = new import_mongoose4.Schema(
  {
    product: {
      type: import_mongoose4.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1
    }
  },
  { _id: false }
);
var cartSchema = new import_mongoose4.Schema(
  {
    user: {
      type: import_mongoose4.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true
  }
);
var Cart = import_mongoose4.default.model("Cart", cartSchema);

// src/utils/calculatePricing.ts
function roundToTwoDecimals(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
function calculateOrderPricing(items) {
  let subtotal = 0;
  let tax = 0;
  let itemCount = 0;
  for (const item of items) {
    const itemSubtotal = item.price * item.qty;
    const itemTax = itemSubtotal * ((item.taxPercent || 0) / 100);
    subtotal += itemSubtotal;
    tax += itemTax;
    itemCount += item.qty;
  }
  const roundedSubtotal = roundToTwoDecimals(subtotal);
  const roundedTax = roundToTwoDecimals(tax);
  const roundedTotal = roundToTwoDecimals(roundedSubtotal + roundedTax);
  return {
    subtotal: roundedSubtotal,
    tax: roundedTax,
    total: roundedTotal,
    itemCount
  };
}

// src/controllers/cart.controller.ts
var formatCartResponse = (cart) => {
  const formattedItems = [];
  const pricingItems = [];
  for (const item of cart.items || []) {
    const prod = item.product;
    if (prod && prod.isActive) {
      formattedItems.push({
        product: {
          id: prod._id,
          name: prod.name,
          sku: prod.sku,
          barcode: prod.barcode,
          price: prod.price,
          taxPercent: prod.taxPercent,
          stock: prod.stock,
          image: prod.image,
          category: prod.category
        },
        qty: item.qty,
        itemSubtotal: Math.round(prod.price * item.qty * 100) / 100
      });
      pricingItems.push({
        price: prod.price,
        taxPercent: prod.taxPercent,
        qty: item.qty
      });
    }
  }
  const totals = calculateOrderPricing(pricingItems);
  return {
    id: cart._id,
    items: formattedItems,
    ...totals,
    updatedAt: cart.updatedAt
  };
};
var getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    sendSuccess(res, { cart: formatCartResponse(cart) });
  } catch (err) {
    next(err);
  }
};
var addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, qty = 1 } = req.body;
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      throw ApiError.notFound("Product not found or inactive");
    }
    if (product.stock < qty) {
      throw ApiError.badRequest(
        `Insufficient stock for "${product.name}". Available stock: ${product.stock}`
      );
    }
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );
    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].qty + qty;
      if (product.stock < newQty) {
        throw ApiError.badRequest(
          `Cannot add more "${product.name}". Max available stock is ${product.stock}.`
        );
      }
      cart.items[existingIndex].qty = newQty;
    } else {
      cart.items.push({ product: product._id, qty });
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    sendSuccess(res, { cart: formatCartResponse(populated) }, "Item added to cart");
  } catch (err) {
    next(err);
  }
};
var updateCartItemQty = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { qty } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw ApiError.notFound("Cart not found");
    }
    if (qty <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId.toString()
      );
    } else {
      const product = await Product.findOne({ _id: productId, isActive: true });
      if (!product) {
        throw ApiError.notFound("Product not found");
      }
      if (product.stock < qty) {
        throw ApiError.badRequest(
          `Only ${product.stock} units available in stock for "${product.name}".`
        );
      }
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId.toString()
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].qty = qty;
      } else {
        cart.items.push({ product: product._id, qty });
      }
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    sendSuccess(res, { cart: formatCartResponse(populated) }, "Cart updated");
  } catch (err) {
    next(err);
  }
};
var removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw ApiError.notFound("Cart not found");
    }
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    await cart.save();
    const populated = await Cart.findById(cart._id).populate("items.product");
    sendSuccess(res, { cart: formatCartResponse(populated) }, "Item removed from cart");
  } catch (err) {
    next(err);
  }
};
var clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
    sendSuccess(res, { cart: { items: [], subtotal: 0, tax: 0, total: 0, itemCount: 0 } }, "Cart cleared");
  } catch (err) {
    next(err);
  }
};

// src/validators/cart.schema.ts
var import_zod5 = require("zod");
var addCartItemSchema = import_zod5.z.object({
  body: import_zod5.z.object({
    productId: import_zod5.z.string().min(1, "Product ID is required"),
    qty: import_zod5.z.number().int().min(1, "Quantity must be at least 1").default(1)
  })
});
var updateCartItemSchema = import_zod5.z.object({
  params: import_zod5.z.object({
    productId: import_zod5.z.string().min(1, "Product ID is required")
  }),
  body: import_zod5.z.object({
    qty: import_zod5.z.number().int().min(0, "Quantity must be 0 or greater")
  })
});
var deleteCartItemSchema = import_zod5.z.object({
  params: import_zod5.z.object({
    productId: import_zod5.z.string().min(1, "Product ID is required")
  })
});

// src/routes/cart.routes.ts
var router3 = (0, import_express3.Router)();
router3.use(authenticate);
router3.get("/", getCart);
router3.post("/items", validate(addCartItemSchema), addItemToCart);
router3.patch("/items/:productId", validate(updateCartItemSchema), updateCartItemQty);
router3.delete("/items/:productId", validate(deleteCartItemSchema), removeCartItem);
router3.delete("/", clearCart);
var cart_routes_default = router3;

// src/routes/payment.routes.ts
var import_express4 = require("express");

// src/models/Order.ts
var import_mongoose5 = __toESM(require("mongoose"));
var orderItemSchema = new import_mongoose5.Schema(
  {
    productId: {
      type: import_mongoose5.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxPercent: {
      type: Number,
      default: 5
    }
  },
  { _id: false }
);
var orderSchema = new import_mongoose5.Schema(
  {
    user: {
      type: import_mongoose5.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, "Order must contain at least one item"]
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    payment: {
      razorpayOrderId: {
        type: String,
        required: true,
        index: true
      },
      razorpayPaymentId: {
        type: String
      },
      razorpaySignature: {
        type: String
      },
      status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created"
      }
    },
    receiptToken: {
      type: String,
      required: true,
      index: true
    },
    exitStatus: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
      index: true
    },
    verifiedBy: {
      type: import_mongoose5.Schema.Types.ObjectId,
      ref: "User"
    },
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);
var Order = import_mongoose5.default.model("Order", orderSchema);

// src/services/payment.service.ts
var import_crypto = __toESM(require("crypto"));

// src/config/razorpay.ts
var import_razorpay = __toESM(require("razorpay"));
var isMockRazorpay = !env.RAZORPAY_KEY_ID || env.RAZORPAY_KEY_ID.includes("mock") || !env.RAZORPAY_KEY_SECRET || env.RAZORPAY_KEY_SECRET.includes("mock");
var razorpayInstance = isMockRazorpay ? null : new import_razorpay.default({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET
});

// src/services/payment.service.ts
var PaymentService = class {
  /**
   * Creates an order with Razorpay in currency subunit (Paise for INR)
   */
  static async createOrder({
    amountInRupees,
    receiptId,
    notes = {}
  }) {
    const amountInSubunits = Math.round(amountInRupees * 100);
    if (amountInSubunits <= 0) {
      throw ApiError.badRequest("Order amount must be greater than zero");
    }
    if (isMockRazorpay) {
      const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        id: mockOrderId,
        amount: amountInSubunits,
        currency: "INR",
        receipt: receiptId
      };
    }
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInSubunits,
        currency: "INR",
        receipt: receiptId,
        notes
      });
      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || receiptId
      };
    } catch (err) {
      console.error("Razorpay order creation failed:", err);
      throw ApiError.badRequest(`Failed to initiate payment gateway order: ${err.message}`);
    }
  }
  /**
   * Verifies Razorpay payment signature idempotently
   */
  static verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }
    if (isMockRazorpay) {
      if (razorpaySignature === "mock_valid_signature" || razorpaySignature.startsWith("mock_sig_")) {
        return true;
      }
    }
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = import_crypto.default.createHmac("sha256", env.RAZORPAY_KEY_SECRET).update(payload).digest("hex");
    try {
      return import_crypto.default.timingSafeEqual(
        Buffer.from(razorpaySignature, "hex"),
        Buffer.from(expectedSignature, "hex")
      );
    } catch (err) {
      return false;
    }
  }
  /**
   * Verifies Razorpay Webhook signature
   */
  static verifyWebhookSignature(body, webhookSignature) {
    if (!body || !webhookSignature) return false;
    const expectedSignature = import_crypto.default.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
    try {
      return import_crypto.default.timingSafeEqual(
        Buffer.from(webhookSignature, "hex"),
        Buffer.from(expectedSignature, "hex")
      );
    } catch {
      return false;
    }
  }
};

// src/services/receipt.service.ts
var import_crypto2 = __toESM(require("crypto"));
var ReceiptService = class {
  /**
   * Generates an HMAC-SHA256 signature for receipt data
   */
  static generateSignature(orderId, total, createdAt) {
    const rawPayload = `${orderId}:${total.toFixed(2)}:${createdAt}`;
    return import_crypto2.default.createHmac("sha256", env.RECEIPT_SECRET).update(rawPayload).digest("hex");
  }
  /**
   * Creates an encoded receipt token encapsulating order information and signature
   */
  static createReceiptToken(payload) {
    const signature = this.generateSignature(payload.orderId, payload.total, payload.createdAt);
    const tokenObject = {
      ...payload,
      sig: signature
    };
    return Buffer.from(JSON.stringify(tokenObject)).toString("base64url");
  }
  /**
   * Decodes and verifies a receipt token
   */
  static verifyReceiptToken(token) {
    try {
      const decodedString = Buffer.from(token, "base64url").toString("utf-8");
      const data = JSON.parse(decodedString);
      if (!data.orderId || !data.total || !data.createdAt || !data.sig) {
        return { isValid: false, error: "Malformed receipt token structure" };
      }
      const expectedSig = this.generateSignature(data.orderId, data.total, data.createdAt);
      const isSigMatch = import_crypto2.default.timingSafeEqual(
        Buffer.from(data.sig, "hex"),
        Buffer.from(expectedSig, "hex")
      );
      if (!isSigMatch) {
        return { isValid: false, error: "Invalid receipt cryptographic signature" };
      }
      return { isValid: true, payload: data };
    } catch (err) {
      return { isValid: false, error: "Failed to decode or verify token: " + err.message };
    }
  }
};

// src/controllers/payment.controller.ts
var createPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Your shopping cart is empty.");
    }
    const pricingItems = [];
    const itemSnapshots = [];
    for (const item of cart.items) {
      const prod = item.product;
      if (!prod || !prod.isActive) {
        throw ApiError.badRequest("One or more items in your cart is no longer available.");
      }
      if (prod.stock < item.qty) {
        throw ApiError.badRequest(
          `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) remaining.`
        );
      }
      pricingItems.push({
        price: prod.price,
        taxPercent: prod.taxPercent,
        qty: item.qty
      });
      itemSnapshots.push({
        productId: prod._id,
        name: prod.name,
        sku: prod.sku,
        qty: item.qty,
        unitPrice: prod.price,
        taxPercent: prod.taxPercent
      });
    }
    const pricing = calculateOrderPricing(pricingItems);
    if (pricing.total <= 0) {
      throw ApiError.badRequest("Order total must be greater than zero.");
    }
    const receiptId = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`;
    const razorpayOrder = await PaymentService.createOrder({
      amountInRupees: pricing.total,
      receiptId,
      notes: {
        userId: userId.toString(),
        userEmail: req.user.email
      }
    });
    sendSuccess(res, {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      // in paise
      currency: razorpayOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
      pricing,
      items: itemSnapshots
    }, "Payment order initiated");
  } catch (err) {
    next(err);
  }
};
var verifyPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const existingOrder = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId
    });
    if (existingOrder) {
      if (existingOrder.payment.status === "paid") {
        sendSuccess(
          res,
          { order: existingOrder, receiptToken: existingOrder.receiptToken },
          "Payment already verified (idempotent)",
          200
        );
        return;
      }
    }
    const isValidSignature = PaymentService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!isValidSignature) {
      throw ApiError.badRequest("Invalid payment signature. Verification failed.");
    }
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Cart is empty or already checked out.");
    }
    const pricingItems = [];
    const itemSnapshots = [];
    for (const item of cart.items) {
      const prod = item.product;
      if (!prod || !prod.isActive) {
        throw ApiError.badRequest(`Product unavailable: ${item.product}`);
      }
      pricingItems.push({
        price: prod.price,
        taxPercent: prod.taxPercent,
        qty: item.qty
      });
      itemSnapshots.push({
        productId: prod._id,
        name: prod.name,
        sku: prod.sku,
        qty: item.qty,
        unitPrice: prod.price,
        taxPercent: prod.taxPercent
      });
    }
    const pricing = calculateOrderPricing(pricingItems);
    for (const item of itemSnapshots) {
      const updateResult = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (!updateResult) {
        throw ApiError.badRequest(
          `Stock depletion error: Not enough stock remaining for ${item.name}.`
        );
      }
    }
    const orderCreatedAt = /* @__PURE__ */ new Date();
    const tempOrderId = new (require("mongoose")).Types.ObjectId();
    const receiptPayload = {
      orderId: tempOrderId.toString(),
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      total: pricing.total,
      itemCount: pricing.itemCount,
      items: itemSnapshots.map((it) => ({
        name: it.name,
        sku: it.sku,
        qty: it.qty,
        unitPrice: it.unitPrice
      })),
      createdAt: orderCreatedAt.toISOString()
    };
    const receiptToken = ReceiptService.createReceiptToken(receiptPayload);
    const newOrder = await Order.create({
      _id: tempOrderId,
      user: userId,
      items: itemSnapshots,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      total: pricing.total,
      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: "paid"
      },
      receiptToken,
      exitStatus: "pending",
      createdAt: orderCreatedAt
    });
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    sendSuccess(
      res,
      {
        order: newOrder,
        receiptToken
      },
      "Payment verified and order created successfully",
      201
    );
  } catch (err) {
    next(err);
  }
};
var handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = JSON.stringify(req.body);
    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      res.status(400).json({ status: "invalid signature" });
      return;
    }
    const event = req.body.event;
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const order = await Order.findOne({ "payment.razorpayOrderId": orderId });
        if (order && order.payment.status !== "paid") {
          order.payment.status = "paid";
          order.payment.razorpayPaymentId = paymentEntity.id;
          await order.save();
        }
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (err) {
    next(err);
  }
};

// src/validators/payment.schema.ts
var import_zod6 = require("zod");
var createOrderPaymentSchema = import_zod6.z.object({
  body: import_zod6.z.object({}).optional()
});
var verifyPaymentSchema = import_zod6.z.object({
  body: import_zod6.z.object({
    razorpayOrderId: import_zod6.z.string().min(1, "Razorpay Order ID is required"),
    razorpayPaymentId: import_zod6.z.string().min(1, "Razorpay Payment ID is required"),
    razorpaySignature: import_zod6.z.string().min(1, "Razorpay Signature is required")
  })
});
var verifyExitSchema = import_zod6.z.object({
  body: import_zod6.z.object({
    receiptToken: import_zod6.z.string().min(1, "Receipt token is required")
  })
});

// src/routes/payment.routes.ts
var router4 = (0, import_express4.Router)();
router4.post("/webhook", handleRazorpayWebhook);
router4.use(authenticate);
router4.post("/create-order", paymentLimiter, createPaymentOrder);
router4.post("/verify", paymentLimiter, validate(verifyPaymentSchema), verifyPayment);
var payment_routes_default = router4;

// src/routes/order.routes.ts
var import_express5 = require("express");

// src/controllers/order.controller.ts
var getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    sendSuccess(res, { orders, count: orders.length });
  } catch (err) {
    next(err);
  }
};
var getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      throw ApiError.notFound("Order not found");
    }
    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    const isStaffOrAdmin = req.user.role === "staff" || req.user.role === "admin";
    if (!isOwner && !isStaffOrAdmin) {
      throw ApiError.forbidden("You do not have permission to view this order.");
    }
    sendSuccess(res, { order });
  } catch (err) {
    next(err);
  }
};
var verifyExit = async (req, res, next) => {
  try {
    const { receiptToken } = req.body;
    const staffUser = req.user;
    if (!receiptToken) {
      throw ApiError.badRequest("Receipt token is required");
    }
    const verification = ReceiptService.verifyReceiptToken(receiptToken);
    if (!verification.isValid || !verification.payload) {
      res.status(400).json({
        success: false,
        status: "INVALID_SIGNATURE",
        message: "Security Alert: QR signature verification failed. Receipt might be tampered.",
        error: verification.error
      });
      return;
    }
    const { orderId } = verification.payload;
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) {
      res.status(404).json({
        success: false,
        status: "ORDER_NOT_FOUND",
        message: "No corresponding order found in store database."
      });
      return;
    }
    if (order.payment.status !== "paid") {
      res.status(400).json({
        success: false,
        status: "UNPAID_ORDER",
        message: "Order has not been marked as paid."
      });
      return;
    }
    if (order.exitStatus === "verified") {
      const populatedOrder = await Order.findById(orderId).populate("user", "name email").populate("verifiedBy", "name email");
      res.status(409).json({
        success: false,
        status: "ALREADY_VERIFIED",
        message: "Warning: This QR receipt has already been verified and used for exit.",
        data: {
          order: populatedOrder,
          previouslyVerifiedAt: order.verifiedAt,
          previouslyVerifiedBy: populatedOrder?.verifiedBy?.name || "Unknown Staff"
        }
      });
      return;
    }
    order.exitStatus = "verified";
    order.verifiedBy = staffUser._id;
    order.verifiedAt = /* @__PURE__ */ new Date();
    await order.save();
    const verifiedOrder = await Order.findById(orderId).populate("user", "name email").populate("verifiedBy", "name email");
    sendSuccess(
      res,
      {
        status: "VERIFIED_SUCCESSFULLY",
        order: verifiedOrder,
        verifiedAt: order.verifiedAt,
        verifiedBy: staffUser.name
      },
      "Exit cleared successfully. Customer verified to leave.",
      200
    );
  } catch (err) {
    next(err);
  }
};

// src/routes/order.routes.ts
var router5 = (0, import_express5.Router)();
router5.use(authenticate);
router5.get("/", getMyOrders);
router5.get("/:id", getOrderById);
router5.post("/verify-exit", authorize("staff", "admin"), validate(verifyExitSchema), verifyExit);
var order_routes_default = router5;

// src/routes/index.ts
var router6 = (0, import_express6.Router)();
router6.use("/auth", auth_routes_default);
router6.use("/products", product_routes_default);
router6.use("/cart", cart_routes_default);
router6.use("/payments", payment_routes_default);
router6.use("/orders", order_routes_default);
var routes_default = router6;

// src/middleware/errorHandler.ts
var errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];
  if (err.code === 11e3) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate entry: A record with this ${field} already exists.`;
  }
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format for: ${err.path}`;
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error occurred";
    errors = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message
    }));
  }
  if (statusCode === 500 && env.NODE_ENV !== "test") {
    console.error("\u{1F4A5} Unhandled Exception:", err);
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...errors.length > 0 && { errors },
    ...env.NODE_ENV === "development" && { stack: err.stack }
  });
};

// src/app.ts
var app = (0, import_express7.default)();
app.use(
  (0, import_helmet.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
var allowedOrigins = [env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"];
app.use(
  (0, import_cors.default)({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use((0, import_cookie_parser.default)());
app.use(import_express7.default.json({ limit: "2mb" }));
app.use(import_express7.default.urlencoded({ extended: true, limit: "2mb" }));
if (env.NODE_ENV !== "test") {
  app.use((0, import_morgan.default)("dev"));
}
app.use("/api", apiLimiter);
var dbInitPromise = null;
var ensureDbConnected = async () => {
  if (import_mongoose6.default.connection.readyState === 1) {
    return;
  }
  if (!dbInitPromise) {
    dbInitPromise = connectDB().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
};
app.get(["/api/health", "/health"], (_req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = dbStates[import_mongoose6.default.connection.readyState] || "unknown";
  res.status(200).json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "ScanCart API",
    database: dbStatus
  });
});
app.use(["/api/v1", "/v1"], async (_req, _res, next) => {
  try {
    await ensureDbConnected();
    next();
  } catch (error) {
    next(error);
  }
});
app.use(["/api/v1", "/v1"], routes_default);
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
});
app.use(errorHandler);
var startServer = async () => {
  try {
    await ensureDbConnected();
    const server = app.listen(env.PORT, () => {
      console.log(`\u{1F6D2} ScanCart API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`\u{1F517} Health check available at: http://localhost:${env.PORT}/api/health`);
    });
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};
if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
  startServer();
}
app.default = app;
module.exports = app;
