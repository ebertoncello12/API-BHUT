const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const connectToDatabase = require('./db');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { connectToRabbitMQ } = require('./rabbitmq');
const { startMessageConsumer } = require('./messageConsumer');

const app = express();
const PORT = 5500;
const EXTERNAL_API_URL = 'http://api-test.bhut.com.br:3000';

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

const carSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String },
  price: { type: String },
  age: { type: Number },
});

const Car = mongoose.model('Car', carSchema);

const logSchema = new mongoose.Schema({
  data_hora: { type: Date, default: Date.now, required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Log = mongoose.model('log', logSchema);

connectToDatabase()
  .then(() => {
    console.log('Conexão com o MongoDB estabelecida com sucesso');

    app.get('/api/listCars', async (req, res) => {
      try {
        const response = await axios.get(`${EXTERNAL_API_URL}/api/cars`);
        const cars = response.data;
        res.json(cars);
      } catch (error) {
        res.status(500).json({ error: 'Erro ao obter os carros da API externa.' });
      }
    });

    app.get('/api/logs', async (req, res) => {
      try {
        const logs = await Log.find();
        res.json(logs);
      } catch (error) {
        console.error('Erro ao obter os logs:', error);
        res.status(500).json({ error: 'Erro ao obter os registros de log.' });
      }
    });

    app.post('/api/createCar', async (req, res) => {
      try {
        const { title, brand, price, age } = req.body;

        const externalCarData = {
          title,
          brand,
          price,
          age,
        };

        let createdCar;

        try {
          const response = await axios.post(`${EXTERNAL_API_URL}/api/cars`, externalCarData);
          createdCar = response.data;
        } catch (error) {
          console.error('Erro ao criar registro na API externa:', error);
          return res.status(500).json({ error: 'Erro ao criar registro na API externa.' });
        }

        const log = new Log({
          car_id: createdCar._id,
        });

        await log.save();

        const rabbitMqConnection = await connectToRabbitMQ();
        const { channel, queue } = rabbitMqConnection;

        const messageToQueue = { car_id: log.car_id, message: 'Novo carro criado, menssagem atraves de webSocket' };
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(messageToQueue)), { persistent: true });

        res.json(messageToQueue);
      } catch (error) {
        console.error('Erro ao criar carro:', error);
        res.status(500).json({ error: 'Erro ao criar um registro de carro.' });
      }
    });

    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      startMessageConsumer(server);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });
