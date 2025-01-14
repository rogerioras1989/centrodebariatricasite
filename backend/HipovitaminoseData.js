const mongoose = require('mongoose');

const HipovitaminoseDataSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    email: { type: String, required: true },
    cirurgia: { type: String, required: true }, // "sim" ou "nao"
    tipoCirurgia: { type: String, default: null },
    anoCirurgia: { type: Number, default: null },
    sintomas: { type: [String], default: [] },
    suplementos: { type: String, default: null },
    reposicao: { type: String, default: null },
    tempoSintomas: { type: String, default: null },
    peso: { type: Number, default: null },
    altura: { type: Number, default: null },
    pontuacao: { type: Number, required: true },
    mensagem: { type: String, required: true },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HipovitaminoseData', HipovitaminoseDataSchema, 'HipovitaminoseData');
