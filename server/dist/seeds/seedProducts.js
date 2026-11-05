"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleProducts = void 0;
exports.seedDatabase = seedDatabase;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const Cart_1 = require("../models/Cart");
const Order_1 = require("../models/Order");
exports.sampleProducts = [
    {
        name: 'Organic Hass Avocados (Pack of 3)',
        sku: 'AVO-ORG-003',
        barcode: '8901030864215',
        price: 180.0,
        taxPercent: 0, // fresh produce exempt
        stock: 45,
        category: 'Fresh Produce',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Artisanal Sourdough Bread Loaf',
        sku: 'BRD-SOUR-500',
        barcode: '8901030864222',
        price: 140.0,
        taxPercent: 5,
        stock: 25,
        category: 'Bakery',
        image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Almond Breeze Unsweetened Milk 1L',
        sku: 'MLK-ALM-100',
        barcode: '8901030864239',
        price: 240.0,
        taxPercent: 5,
        stock: 60,
        category: 'Dairy & Plant Milk',
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Single Origin Arabica Coffee Beans 250g',
        sku: 'COF-ARA-250',
        barcode: '8901030864246',
        price: 490.0,
        taxPercent: 5,
        stock: 35,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Extra Virgin Cold Pressed Olive Oil 500ml',
        sku: 'OIL-EVO-500',
        barcode: '8901030864253',
        price: 750.0,
        taxPercent: 5,
        stock: 20,
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Organic Rolled Oats 1kg',
        sku: 'OAT-ROL-001',
        barcode: '8901030864260',
        price: 195.0,
        taxPercent: 5,
        stock: 50,
        category: 'Breakfast',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: '70% Dark Chocolate Sea Salt Bar 85g',
        sku: 'CHO-DKS-085',
        barcode: '8901030864277',
        price: 160.0,
        taxPercent: 18,
        stock: 80,
        category: 'Snacks & Confectionery',
        image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'San Pellegrino Sparkling Natural Mineral Water 750ml',
        sku: 'WTR-SPK-750',
        barcode: '8901030864284',
        price: 190.0,
        taxPercent: 18,
        stock: 40,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Greek Yogurt Plain Low Fat 400g',
        sku: 'YOG-GRK-400',
        barcode: '8901030864291',
        price: 135.0,
        taxPercent: 5,
        stock: 30,
        category: 'Dairy & Plant Milk',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Raw Forest Wildflower Honey 350g',
        sku: 'HNY-WLD-350',
        barcode: '8901030864307',
        price: 360.0,
        taxPercent: 5,
        stock: 30,
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Artisan Sea Salt & Rosemary Crackers 150g',
        sku: 'CRK-ROS-150',
        barcode: '8901030864314',
        price: 175.0,
        taxPercent: 12,
        stock: 45,
        category: 'Snacks & Confectionery',
        image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Cold Pressed Valencia Orange Juice 1L',
        sku: 'JUC-ORG-100',
        barcode: '8901030864321',
        price: 199.0,
        taxPercent: 12,
        stock: 35,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Organic Medjool Dates 250g',
        sku: 'DAT-MED-250',
        barcode: '8901030864338',
        price: 290.0,
        taxPercent: 5,
        stock: 25,
        category: 'Fresh Produce',
        image: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Italian Bronze Cut Penne Rigate 500g',
        sku: 'PAS-PEN-500',
        barcode: '8901030864345',
        price: 165.0,
        taxPercent: 5,
        stock: 70,
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Classic Tomato Basil Pasta Sauce 350g',
        sku: 'SAU-TOM-350',
        barcode: '8901030864352',
        price: 220.0,
        taxPercent: 12,
        stock: 40,
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Organic Japanese Matcha Green Tea 50g',
        sku: 'TEA-MTC-050',
        barcode: '8901030864369',
        price: 680.0,
        taxPercent: 5,
        stock: 15,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Roasted & Salted California Pistachios 200g',
        sku: 'NUT-PIS-200',
        barcode: '8901030864376',
        price: 340.0,
        taxPercent: 5,
        stock: 50,
        category: 'Snacks & Confectionery',
        image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Natural Eco Bamboo Toothbrush (Pack of 2)',
        sku: 'ECO-TOOTH-02',
        barcode: '8901030864383',
        price: 120.0,
        taxPercent: 18,
        stock: 90,
        category: 'Personal Care',
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Organic Lavender Essential Hand Wash 300ml',
        sku: 'PC-HAND-300',
        barcode: '8901030864390',
        price: 260.0,
        taxPercent: 18,
        stock: 35,
        category: 'Personal Care',
        image: 'https://images.unsplash.com/photo-1608248597359-5633857e0569?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
    {
        name: 'Fairtrade Madagascar Pure Vanilla Extract 60ml',
        sku: 'VAN-EXT-060',
        barcode: '8901030864406',
        price: 420.0,
        taxPercent: 12,
        stock: 20,
        category: 'Bakery',
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
        isActive: true,
    },
];
async function seedDatabase(shouldConnect = true) {
    console.log('🌱 Starting ScanCart Database Seeder...');
    if (shouldConnect) {
        await (0, db_1.connectDB)();
    }
    // Clear existing collections
    await Promise.all([
        Product_1.Product.deleteMany({}),
        User_1.User.deleteMany({}),
        Cart_1.Cart.deleteMany({}),
        Order_1.Order.deleteMany({}),
    ]);
    console.log('🧹 Cleaned existing database collections');
    // Seed Users
    const passwordSalt = await bcryptjs_1.default.genSalt(12);
    const defaultPasswordHash = await bcryptjs_1.default.hash('Password123!', passwordSalt);
    const users = await User_1.User.insertMany([
        {
            name: 'Aria Sharma (Customer)',
            email: 'customer@scancart.store',
            passwordHash: defaultPasswordHash,
            role: 'customer',
        },
        {
            name: 'Marcus Vance (Staff)',
            email: 'staff@scancart.store',
            passwordHash: defaultPasswordHash,
            role: 'staff',
        },
        {
            name: 'Elena Rostova (Store Manager / Admin)',
            email: 'admin@scancart.store',
            passwordHash: defaultPasswordHash,
            role: 'admin',
        },
    ]);
    console.log(`👤 Created ${users.length} initial test users:`);
    console.log('   - Customer: customer@scancart.store / Password123!');
    console.log('   - Staff:    staff@scancart.store    / Password123!');
    console.log('   - Admin:    admin@scancart.store    / Password123!');
    // Seed Products
    const createdProducts = await Product_1.Product.insertMany(exports.sampleProducts);
    console.log(`🛍️ Created ${createdProducts.length} retail products with unique barcodes:`);
    createdProducts.slice(0, 5).forEach((p) => {
        console.log(`   - [${p.barcode}] ${p.name} (₹${p.price})`);
    });
    console.log(`   ...and ${createdProducts.length - 5} more.`);
    console.log('✨ Database seeding completed successfully!');
}
if (require.main === module) {
    seedDatabase()
        .then(async () => {
        await (0, db_1.disconnectDB)();
        process.exit(0);
    })
        .catch(async (err) => {
        console.error('❌ Seeder error:', err);
        await (0, db_1.disconnectDB)();
        process.exit(1);
    });
}
