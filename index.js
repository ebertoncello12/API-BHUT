// Importando as bibliotecas necessárias
const express = require('express'); // Biblioteca para criar o servidor web
const axios = require('axios'); // Biblioteca para fazer requisições HTTP
const bodyParser = require('body-parser'); // Biblioteca para processar o corpo das requisições
const connectToDatabase = require('./db/db'); // Função para conectar ao banco de dados
const mongoose = require('mongoose'); // Biblioteca para interagir com o MongoDB
const path = require('path'); // Biblioteca para lidar com caminhos de arquivos
const cors = require('cors'); // Middleware para permitir requisições de origens diferentes
const { connectToRabbitMQ } = require('./rabbitmq'); // Função para conectar ao RabbitMQ
const { startMessageConsumer } = require('./messageConsumer'); // Função para iniciar o consumidor de mensagens do RabbitMQ
const Log = require('./models/logModel'); // Modelo do Mongoose para os registros de log

// Criando a aplicação Express
const app = express();

// Definindo a porta em que o servidor irá escutar
const PORT = 5500;

// URL da API externa
const EXTERNAL_API_URL = 'http://api-test.bhut.com.br:3000';

// Configurando middlewares
app.use(bodyParser.json()); // Parseia o corpo das requisições para formato JSON
app.use(cors()); // Permite requisições de origens diferentes
app.use(express.static('public')); // Serve arquivos estáticos na pasta 'public'

// Conectando ao banco de dados MongoDB
connectToDatabase()
  .then(() => {
    console.log('Conexão com o MongoDB estabelecida com sucesso');

    // Rota para listar todos os carros
    app.get('/api/listCars', async (req, res) => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/cars`);
        const cars = response.data;
        res.json(cars);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao obter os carros da API externa.' });
      }
    });

    // Rota para obter todos os registros de log
    app.get('/api/logs', async (req, res) => {
      try {
        const logs = await Log.find();
        res.json(logs);
      } catch (error) {
        console.error('Erro ao obter os logs:', error);
        res.status(500).json({ error: 'Erro ao obter os registros de log.' });
      }
    });

    // Rota para criar um novo carro
    app.post('/api/createCar', async (req, res) => {
      try {
        const { title, brand, price, age } = req.body;

        // Dados do carro a serem enviados para a API externa
        const externalCarData = {
          title,
          brand,
          price,
          age,
        };

        let createdCar;

        try {
          // Envia os dados do carro para a API externa e recebe a resposta com o carro criado
          const response = await axios.post(`${EXTERNAL_API_URL}/api/cars`, externalCarData);
          createdCar = response.data;
        } catch (error) {
          console.error('Erro ao criar registro na API externa:', error);
          return res.status(500).json({ error: 'Erro ao criar registro na API externa.' });
        }

        // Cria um novo registro de log relacionado ao carro criado
        const log = new Log({
          car_id: createdCar._id,
        });

        // Salva o registro de log no banco de dados
        await log.save();

        // Conecta ao RabbitMQ para enviar uma mensagem para a fila
        const rabbitMqConnection = await connectToRabbitMQ();
        const { channel, queue } = rabbitMqConnection;

        // Monta a mensagem a ser enviada para a fila
        const messageToQueue = { car_id: log.car_id, message: 'Novo carro criado, mensagem através de webSocket' };

        // Envia a mensagem para a fila
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageToQueue)), { persistent: true });

        // Retorna a mensagem enviada
        res.json(messageToQueue);
      } catch (error) {
        console.error('Erro ao criar carro:', error);
        res.status(500).json({ error: 'Erro ao criar um registro de carro.' });
      }
    });

    // Inicia o servidor na porta definida
    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      startMessageConsumer(server); // Inicia o consumidor de mensagens do RabbitMQ
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });
