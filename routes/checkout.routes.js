import express from "express";
import { createCheckoutSession, stripeWebhook, verifyPayment} from '../controller/checkout.controller.js'

const router = express.Router();

router.post("/create-session", createCheckoutSession);
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook); // raw body!
router.get("/success", verifyPayment);

export default router;