// Importa os módulos necessários
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

// Importa as rotas separadas
const calculadoraImcRoutes = require('./routes/calculadoraImc');
const questionarioHipovitaminoseRoutes = require('./routes/questionariohipovitaminose');


// Inicializa o aplicativo
const app = express();
const PORT = process.env.PORT || 3001;

// Conexão com o MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota inicial para teste do servidor
app.get('/', (req, res) => {
  res.send('Servidor rodando para o Centro de Bariátrica');
});

// Usa as rotas importadas
app.use('/api/calculadora-imc', calculadoraImcRoutes);
app.use('/api/questionario-hipovitaminose', questionarioHipovitaminoseRoutes);

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
