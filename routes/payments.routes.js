// backend/routes/montonio.js
import jwt from 'jsonwebtoken';
import axios from 'axios';
import express from 'express';

const router = express.Router();

const MONTONIO_ACCESS_KEY = process.env.MONTONIO_ACCESS_KEY;
const MONTONIO_SECRET_KEY = process.env.MONTONIO_SECRET_KEY;

// ✅ FIX 1: Use sandbox URL when testing, live URL for production.
//    Mixing sandbox keys with the live URL (or vice versa) causes STORE_NOT_FOUND.
const IS_SANDBOX = process.env.NODE_ENV !== 'production';
const MONTONIO_API_URL = IS_SANDBOX
  ? 'https://sandbox-stargate.montonio.com'
  : 'https://stargate.montonio.com';


// ─── GET PAYMENT METHODS ────────────────────────────────────────────────────

router.get('/payment-methods', async (req, res) => {
  try {
    const payload = {
      accessKey: MONTONIO_ACCESS_KEY,
      // ✅ FIX 2: Add iat (issued-at) explicitly — some JWT validators require it
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, MONTONIO_SECRET_KEY, {
      algorithm: 'HS256',
      expiresIn: '10m',
    });

    // ✅ FIX 3: The correct endpoint path is /api/stores/payment-methods
    //    AND the token goes in the query string, not the Authorization header,
    //    for this particular endpoint.
    const response = await axios.get(
      `${MONTONIO_API_URL}/api/stores/payment-methods`,
      {
        params: { access_token: token }, // ← query param, not Bearer header
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching payment methods:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});


// ─── CREATE PAYMENT ORDER ───────────────────────────────────────────────────

router.post('/create-order', async (req, res) => {
  try {
    const {
      amount,
      currency = 'EUR',
      paymentMethod,
      returnUrl,
      notificationUrl,
      customer,
      items,
    } = req.body;

    // ✅ FIX 4: The order data itself is the JWT payload (not a wrapper).
    //    Montonio's Stargate API expects the entire order as a signed JWT
    //    sent as { "data": "<token>" } in the POST body.
    const orderPayload = {
      accessKey: MONTONIO_ACCESS_KEY,
      iat: Math.floor(Date.now() / 1000),

      merchantReference: `ORDER_${Date.now()}`,
      returnUrl,
      notificationUrl,
      currency,

      // ✅ FIX 5: grandTotal is a float (e.g. 12.99), NOT cents.
      //    Do NOT multiply by 100.
      grandTotal: amount,

      locale: 'en',

      billingAddress: {
        firstName: customer.first_name,
        lastName:  customer.last_name,
        email:     customer.email,
        phone:     customer.phone,
        addressLine1: customer.address    || '',
        locality:     customer.city       || '',
        country:      customer.country    || 'EE',
        postalCode:   customer.postalCode || '',
      },

      // ✅ FIX 6: lineItems (not "cart"), and finalPrice is a float per unit
      lineItems: items.map(item => ({
        name:       item.product_name,
        quantity:   item.quantity,
        finalPrice: item.price,       // float, e.g. 9.99 — NOT cents
        productCode: String(item.product_id),
      })),

      // ✅ FIX 7: payment block must be a nested object with method + currency + amount
      payment: {
        method:   paymentMethod || 'paymentInitiation',
        currency,
        amount,   // float, same as grandTotal
      },
    };

    const token = jwt.sign(orderPayload, MONTONIO_SECRET_KEY, {
      algorithm: 'HS256',
      expiresIn: '10m',
    });

    // ✅ FIX 8: POST body is { data: token }, not the raw order object.
    //    The Authorization header is NOT used for order creation.
    const response = await axios.post(
      `${MONTONIO_API_URL}/api/orders`,
      { data: token },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // response.data contains { paymentUrl, orderToken, ... }
    res.json({ paymentUrl: response.data.paymentUrl });
  } catch (error) {
    console.error('Error creating payment order:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});


// ─── WEBHOOK (payment status notification from Montonio) ────────────────────

router.post('/webhook', async (req, res) => {
  try {
    const { orderToken } = req.body;

    // ✅ Always verify the incoming token with your secret key
    const decoded = jwt.verify(orderToken, MONTONIO_SECRET_KEY, {
      algorithms: ['HS256'],
    });

    const { merchantReference, paymentStatus } = decoded;
    console.log(`Order ${merchantReference} → ${paymentStatus}`);

    if (paymentStatus === 'PAID') {
      // TODO: mark order as paid in your DB
    }

    res.sendStatus(200); // Must respond 200 so Montonio stops retrying
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(400);
  }
});

export default router;