const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve arquivos estáticos da pasta atual
app.use(express.static(path.join(__dirname)));

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
});
