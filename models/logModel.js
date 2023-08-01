const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  data_hora: { type: Date, default: Date.now, required: true }, // Tipo data , valor default ou seja valor padrao sera sempre Data.now = Horario atual
  car_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // carid e o id do documento relacionado a o id do carro 
});

const Log = mongoose.model('log', logSchema); // Associoando o modelo logSchema a log do banco de dados

module.exports = Log; // Exportaçao para usarmos em outra parte da aplicaçao 
