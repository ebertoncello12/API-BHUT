const amqp = require('amqplib'); // Biblioteca para interagir com o RabbitMQ
const socketio = require('socket.io'); // Biblioteca para lidar com WebSockets
const axios = require('axios'); // Biblioteca para fazer requisições HTTP

// Função assíncrona para iniciar o consumidor de mensagens
async function startMessageConsumer(server) {
  const io = socketio(server); // Inicializa o servidor de WebSockets

  try {
    const connection = await amqp.connect('amqp://localhost'); // Conecta ao RabbitMQ
    const channel = await connection.createChannel(); // Cria um canal de comunicação
    const queue = 'car_created'; // Nome da fila para a mensagem do carro criado

    await channel.assertQueue(queue, { durable: true }); // Verifica a existência da fila, se não existir, ela é criada

    // Função para consumir mensagens da fila
    channel.consume(
      queue,
      async (message) => {
        if (message !== null) {
          const content = JSON.parse(message.content.toString()); // Converte o conteúdo da mensagem para um objeto JavaScript
          io.emit('car_created', content); // Emite um evento para todos os clientes conectados via WebSocket

          channel.ack(message); // Confirma o recebimento da mensagem para o RabbitMQ

          // Enviar o webhook para o Discord
          try {
            const webhookURL = 'https://discord.com/api/webhooks/1133807070718730260/Ttk41hzKhJ6LAwtl2K2R_ZONAtuhn3DOsDSo1Hwhh5r9mMK3YcmgswInk4ydGBeL3Gtg';
            const webhookData = {
              content: `Novo carro cadastrado!\nID do Carro: ${content.car_id} mensagem enviada via WebHook`,
            };
            await axios.post(webhookURL, webhookData); // Envia a mensagem para o webhook do Discord
          } catch (error) {
            console.error('Erro ao enviar o webhook para o Discord:', error);
          }
        }
      },
      { noAck: false } // Define que as mensagens não serão automaticamente confirmadas
    );

    console.log('Consumidor de mensagens iniciado.');
  } catch (error) {
    throw new Error('Erro ao iniciar o consumidor de mensagens: ' + error.message);
  }
}

// Exporta a função para que ela possa ser utilizada em outros arquivos
module.exports = { startMessageConsumer };
