const mongoose = require('mongoose');

const HipovitaminoseDataSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    telefone: { type: String, required: true, unique: true }, // Telefone único para evitar duplicados
    email: { type: String, required: true, match: /.+\@.+\..+/ }, // Validação de e-mail
    cirurgia: { type: String, required: true }, // "sim" ou "nao"
    tipoCirurgia: { type: String, default: null },
    anoCirurgia: { type: Number, default: null },
    sintomas: { type: [String], default: [] },
    suplementos: { type: String, default: null },
    reposicao: { type: String, default: null },
    tempoSintomas: { type: String, default: null },
    peso: { type: Number, min: 0, default: null },
    altura: { type: Number, min: 0, default: null },
    pontuacao: { type: Number, required: true },
    mensagem: { type: String, required: true },
    data: { type: Date, default: Date.now }
}, {
    timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('HipovitaminoseData', HipovitaminoseDataSchema, 'HipovitaminoseData');
