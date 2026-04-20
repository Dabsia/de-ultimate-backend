import express from 'express'
import {
    createOrder,
    getOrders,
    getOrderById,
    getOrdersByUser,
    updateOrder,
    deleteOrder,
    getOrderStats
} from '../controller/order.controller.js'
import { protect } from '../middleware/index.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/', protect, getOrders)
router.get("/stats", getOrderStats);
router.get('/:id', protect, getOrderById)
router.get('/user/:userId', protect, getOrdersByUser)
router.put('/:id', protect, updateOrder)
router.delete('/:id', protect, deleteOrder)

export default router