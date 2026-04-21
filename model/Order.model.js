import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // Billing Details (from UI)
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String, required: true },
  country:   { type: String, required: true, default: "Estonia" },
  streetAddress: { type: String, required: true },
  postcode:  { type: String, required: true },
  city:      { type: String, required: true },
  additionalInfo: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Order Items
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name:     { type: String, required: true },
      price:    { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],

  // Totals
  subtotal:       { type: Number, required: true },
  shippingCost:   { type: Number, default: 0 },
  total:          { type: Number, required: true },

  // Stripe
  stripePaymentIntentId: { type: String },
  stripeSessionId:       { type: String },

  // Status
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    enum: ["processing", "delivered", "cancelled"],
    default: "processing",
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;