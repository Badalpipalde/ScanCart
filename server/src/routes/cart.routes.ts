import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addCartItemSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
} from '../validators/cart.schema';

const router = Router();

// All cart operations require customer authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(addCartItemSchema), addItemToCart);
router.patch('/items/:productId', validate(updateCartItemSchema), updateCartItemQty);
router.delete('/items/:productId', validate(deleteCartItemSchema), removeCartItem);
router.delete('/', clearCart);

export default router;
