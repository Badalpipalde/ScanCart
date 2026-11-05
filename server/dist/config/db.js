"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
let mongodInstance = null;
async function connectDB() {
    const primaryUri = env_1.env.MONGODB_URI;
    try {
        // Attempt standard connection with 2.5s timeout
        await mongoose_1.default.connect(primaryUri, {
            serverSelectionTimeoutMS: 2500,
        });
        console.log(`✅ Connected to MongoDB at: ${primaryUri.split('@').pop()}`);
    }
    catch (err) {
        console.warn(`⚠️ Could not connect to primary MongoDB (${err.message}).`);
        console.log(`🚀 Starting in-memory MongoDB fallback server...`);
        try {
            const { MongoMemoryServer } = await Promise.resolve().then(() => __importStar(require('mongodb-memory-server')));
            mongodInstance = await MongoMemoryServer.create();
            const inMemoryUri = mongodInstance.getUri();
            await mongoose_1.default.connect(inMemoryUri);
            console.log(`✅ Connected to in-memory MongoDB at: ${inMemoryUri}`);
        }
        catch (inMemErr) {
            console.error('❌ Failed to start in-memory MongoDB:', inMemErr.message);
            throw inMemErr;
        }
    }
    mongoose_1.default.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
    });
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    if (mongodInstance) {
        await mongodInstance.stop();
    }
}
