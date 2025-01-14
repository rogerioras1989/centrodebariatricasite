const mongoose = require('mongoose');

const ImcDataSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true },
    peso: { type: Number, required: true },
    altura: { type: Number, required: true },
    comorbidades: { type: [String], default: [] },
    imc: { type: Number, required: true },
    mensagem: { type: String, required: true },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImcData', ImcDataSchema, 'ImcData');
