import { Router } from 'express';
import { getMyOrders, getOrderById, verifyExit } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/role';
import { validate } from '../middleware/validate';
import { verifyExitSchema } from '../validators/payment.schema';

const router = Router();

router.use(authenticate);

// Customer & authorized orders
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

// Staff exit verification gate
router.post('/verify-exit', authorize('staff', 'admin'), validate(verifyExitSchema), verifyExit);

export default router;
