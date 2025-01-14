const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor rodando para o Centro de Bariátrica');
});

app.post('/api/calculadora-imc', async (req, res) => {
  // Código da rota aqui
});

app.post('/api/questionario-hipovitaminose', async (req, res) => {
  // Código da rota aqui
});
