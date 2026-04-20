// utils/cleanupPendingOrders.js
import cron from "node-cron";
import Order from "../model/Order.model.js";

// Runs every hour — marks orders as "failed" if still pending after 2 hours
export const startOrderCleanup = () => {
  cron.schedule("0 * * * *", async () => {
    const twoHoursAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    
    const result = await Order.updateMany(
      {
        paymentStatus: "pending",
        createdAt: { $lt: twoHoursAgo },
      },
      { paymentStatus: "failed" }
    );

    console.log(`Cleaned up ${result.modifiedCount} stale pending orders`);
  });
};