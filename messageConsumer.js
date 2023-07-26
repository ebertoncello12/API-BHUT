const amqp = require('amqplib');
const socketio = require('socket.io');

async function startMessageConsumer(server) {
  const io = socketio(server);

  try {
    const connection = await amqp.connect('amqp://localhost'); // ou substitua por sua URL do RabbitMQ
    const channel = await connection.createChannel();
    const queue = 'car_created'; // Nome da fila para a mensagem do carro criado

    await channel.assertQueue(queue, { durable: true });

    channel.consume(
      queue,
      (message) => {
        if (message !== null) {
          const content = JSON.parse(message.content.toString());
          io.emit('car_created', content);
          channel.ack(message);
        }
      },
      { noAck: false }
    );

    console.log('Consumidor de mensagens iniciado.');
  } catch (error) {
    throw new Error('Erro ao iniciar o consumidor de mensagens: ' + error.message);
  }
}

module.exports = { startMessageConsumer };
