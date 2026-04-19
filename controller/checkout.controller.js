import Stripe from "stripe";
import Order from "../model/Order.model.js";
import Product from "../model/Product.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/checkout/create-session
// Called when user clicks "Place Order" — creates a Stripe Checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone,
      country, streetAddress, postcode, city,
      additionalInfo, cartItems, // cartItems: [{ productId, quantity }]
    } = req.body;

    // 1. Fetch products from DB and validate stock
    const productIds = cartItems.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const lineItems = [];
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = products.find((p) => p._id.toString() === cartItem.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${cartItem.productId}` });
      if (!product.instock) return res.status(400).json({ message: `${product.name} is out of stock` });

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            images: [product.image.url],
            description: product.descriptionEnglish,
          },
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
        },
        quantity: cartItem.quantity,
      });
    }

    // 2. Create a pending order in DB first
    const order = await Order.create({
      firstName, lastName, email, phone,
      country, streetAddress, postcode, city,
      additionalInfo,
      items: orderItems,
      subtotal,
      shippingCost: 0,
      total: subtotal,
      paymentStatus: "pending",
    });

    // 3. Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: email,
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/checkout?cancelled=true`,
    });

    // 4. Save session ID to order
    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({ url: session.url }); // Frontend redirects here
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};

// POST /api/checkout/webhook
// Stripe calls this after payment — MUST be raw body (not JSON parsed)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      stripePaymentIntentId: session.payment_intent,
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await Order.findByIdAndUpdate(session.metadata.orderId, {
      paymentStatus: "failed",
    });
  }

  res.json({ received: true });
};

// GET /api/checkout/success?session_id=...
// Verify payment and return order details to the success page
export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const order = await Order.findOne({ stripeSessionId: session_id }).populate("items.product");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ order, paymentStatus: session.payment_status });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};