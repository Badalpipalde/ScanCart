import Razorpay from 'razorpay';
import { env } from './env';

export const isMockRazorpay =
  env.RAZORPAY_KEY_ID.includes('mock') || env.RAZORPAY_KEY_SECRET.includes('mock');

export const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});
