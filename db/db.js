const mongoose = require('mongoose');

const DB_URL = 'mongodb+srv://enzzo:enzzo@log.iusbitn.mongodb.net'; // Mude para a URL do seu banco de dados MongoDB
const DB_NAME = 'log'; // Nome do banco de dados que conterá os logs

async function connectToDatabase() {
  try {
    await mongoose.connect(`${DB_URL}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao MongoDB com sucesso');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}

module.exports = connectToDatabase;
