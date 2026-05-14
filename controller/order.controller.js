import Order from '../model/Order.model.js'
import User from '../model/User.model.js'

// Get all orders — paid only for admin dashboard
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ paymentStatus: "paid" }).sort({ createdAt: -1 })
        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message })
    }
}

// Get a single order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.status(200).json(order)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch order', error: error.message })
    }
}

// Get items by the user id
export const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params

        // Find user's email first
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        // Query by EITHER user ID or email — catches both old and new orders
        const orders = await Order.find({
            $or: [
                { user: userId },
                { email: user.email }
            ],
            paymentStatus: "paid"
        }).sort({ createdAt: -1 })

        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user orders', error: error.message })
    }
}
// Update order status (admin: mark as shipped, delivered, cancelled)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true, runValidators: true }
        )
        if (!order) return res.status(404).json({ message: 'Order not found' })
        res.status(200).json({ message: 'Order status updated', order })
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order', error: error.message })
    }
}

// Delete an order by ID
export const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id)
        if (!deletedOrder) return res.status(404).json({ message: 'Order not found' })
        res.status(200).json({ message: 'Order deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete order', error: error.message })
    }
}

// Dashboard stats — paid orders only
export const getOrderStats = async (req, res) => {
    try {
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ])

        const totalRevenue = revenueResult[0]?.total || 0
        const totalOrders = await Order.countDocuments({ paymentStatus: "paid" })
        const pendingOrders = await Order.countDocuments({ paymentStatus: "pending" })

        // Revenue per day for last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const revenueByDay = await Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        res.status(200).json({ totalRevenue, totalOrders, pendingOrders, revenueByDay })
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message })
    }
}