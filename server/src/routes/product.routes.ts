import { Router } from 'express';
import {
  getProductByBarcode,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import {
  barcodeParamSchema,
  createProductSchema,
  updateProductSchema,
} from '../validators/product.schema';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';

const router = Router();

// Public / Authenticated read routes
router.get('/barcode/:code', validate(barcodeParamSchema), getProductByBarcode);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin only CRUD
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteProduct
);

export default router;
