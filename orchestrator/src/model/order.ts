import mongoose from 'mongoose';

// MongoDB Schema
const orderSchema = new mongoose.Schema({
    productId: String,
    quantity: Number,
    status: { type: String, default: 'PENDING' },
  });
  const Order = mongoose.model('Order', orderSchema);

  export default Order;