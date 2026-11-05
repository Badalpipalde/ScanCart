import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { ApiError } from '../utils/apiError';
import { sendSuccess } from '../utils/response';

export const getProductByBarcode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { code } = req.params;
    const trimmedCode = code.trim();

    const product = await Product.findOne({
      barcode: trimmedCode,
      isActive: true,
    });

    if (!product) {
      throw ApiError.notFound(`No active product found for barcode: ${trimmedCode}`);
    }

    sendSuccess(res, { product }, 'Product found successfully');
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, search, activeOnly } = req.query;
    const filter: any = {};

    if (activeOnly !== 'false') {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    sendSuccess(res, { products, count: products.length }, 'Products retrieved');
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    sendSuccess(res, { product });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    sendSuccess(res, { product }, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    sendSuccess(res, { product }, 'Product updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    sendSuccess(res, null, 'Product deactivated successfully');
  } catch (err) {
    next(err);
  }
};
