import mongoose from 'mongoose';

// MongoDB Schema
const orderSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, default: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
  });
  const Order = mongoose.model('Order', orderSchema);

  export default Order;