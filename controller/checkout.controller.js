import Stripe from "stripe";
import Order from "../model/Order.model.js";
import { sendEmail } from "../services/email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/v1/checkout/create-session
export const createCheckoutSession = async (req, res) => {
  try {
    const { items, customer, subtotal, total } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    if (!customer?.firstName || !customer?.email || !customer?.phone ||
        !customer?.streetAddress || !customer?.city || !customer?.postcode)
      return res.status(400).json({ message: "Missing required billing fields" });

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const orderItems = items.map((item) => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const order = await Order.create({
      firstName:      customer.firstName,
      lastName:       customer.lastName,
      email:          customer.email,
      phone:          customer.phone,
      country:        customer.country || "Estonia",
      streetAddress:  customer.streetAddress,
      postcode:       customer.postcode,
      city:           customer.city,
      additionalInfo: customer.additionalInfo || "",
      user: req.user?._id || null,
      items:          orderItems,
      subtotal,
      shippingCost:   0,
      total,
      paymentStatus:  "pending",
    });
    

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customer.email,
      metadata: { orderId: order._id.toString() },
      success_url: `${process.env.CLIENT_URL}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/checkout?cancelled=true`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    sendEmail({
      to: 'dabojohnson98@gmail.com',
      name: customer?.firstName,
      // from: from,
      subject: `${customer?.firstName} ${customer?.lastName} just placed an order`,
      html: `<h1>New order Received</h1>
        <a href='https://ultimate-store.netlify.app/admin'>Click link to check the order</a>
      `
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
   
    res.status(500).json({ message: "Checkout failed", error: error.message });
  }
};

// POST /api/v1/checkout/webhook  ← must use express.raw() in routes
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
    const order = await Order.findByIdAndUpdate(
      session.metadata.orderId,
      { paymentStatus: "paid", stripePaymentIntentId: session.payment_intent },
      { new: true }  // ← get the updated order back
    );

    // ✅ Send email only after payment is confirmed
    if (order) {
      sendEmail({
        to: 'dabojohnson98@gmail.com',
        subject: `${order.firstName} ${order.lastName} just placed an order`,
        html: `
          <h1>New Order Received</h1>
          <p><strong>Customer:</strong> ${order.firstName} ${order.lastName}</p>
          <p><strong>Email:</strong> ${order.email}</p>
          <p><strong>Total:</strong> €${order.total}</p>
          <p><strong>Items:</strong> ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
          <a href='https://ultimate-store.netlify.app/admin'>View order in admin</a>
        `
      });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const sessionId = pi.payment_details?.order_reference;
    if (sessionId) {
      await Order.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { paymentStatus: "paid", stripePaymentIntentId: pi.id }
      );
    }
  }

  if (event.type === "checkout.session.expired") {
    await Order.findByIdAndUpdate(event.data.object.metadata.orderId, {
      paymentStatus: "failed",
    });
  }

  res.json({ received: true });
};

// GET /api/v1/checkout/success?session_id=...
export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const order = await Order.findOne({ stripeSessionId: session_id });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ order, paymentStatus: session.payment_status });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};