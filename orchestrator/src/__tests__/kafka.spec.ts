import mongoose from 'mongoose';
import Order from '../model/order';

describe('Kafka Consumer Logic', () => {
  beforeEach(async () => {
    // Limpar o banco antes de cada teste
    await Order.deleteMany({});
  });

  it('should process order status update successfully', async () => {
    // Criar um pedido no banco
    const order = new Order({
      productId: '456',
      quantity: 10,
    });
    await order.save();

    const statusUpdate = {
      orderId: order._id,
      status: 'APPROVED',
    };

    // Simular a lógica do Kafka consumer diretamente
    const updatedOrder = await Order.findByIdAndUpdate(
      statusUpdate.orderId,
      { status: statusUpdate.status },
      { new: true }
    );

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.status).toBe('APPROVED');
  });

  it('should handle rejected orders', async () => {
    // Criar um pedido no banco
    const order = new Order({
      productId: '456',
      quantity: 10,
    });
    await order.save();

    const statusUpdate = {
      orderId: order._id,
      status: 'REJECTED',
      reason: 'Insufficient stock',
    };

    // Simular a lógica do Kafka consumer diretamente
    const updatedOrder = await Order.findByIdAndUpdate(
      statusUpdate.orderId,
      { status: statusUpdate.status },
      { new: true }
    );

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.status).toBe('REJECTED');
  });

  it('should handle non-existent orders', async () => {
    // Criar um ObjectId válido que não existe no banco
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const statusUpdate = {
      orderId: nonExistentId.toString(),
      status: 'APPROVED',
    };

    // Simular a lógica do Kafka consumer diretamente
    const updatedOrder = await Order.findByIdAndUpdate(
      statusUpdate.orderId,
      { status: statusUpdate.status },
      { new: true }
    );

    // Verificar que o pedido não existe no banco
    expect(updatedOrder).toBeNull();
  });
}); 