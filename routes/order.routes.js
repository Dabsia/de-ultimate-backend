import express from 'express'
import {
    getOrders,
    getOrderById,
    getOrdersByUser,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} from '../controller/order.controller.js'
import { adminOnly, protect } from '../middleware/index.js'

const router = express.Router()


router.get('/', protect, adminOnly, getOrders)
router.get("/stats", adminOnly, getOrderStats);
router.get('/:id', protect, adminOnly, getOrderById)
router.get('/user/:userId', protect, getOrdersByUser)
router.patch('/:id', protect, adminOnly, updateOrderStatus)
router.delete('/:id', protect, adminOnly, deleteOrder)

export default router