// Importa os módulos necessários
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const cors = require('cors'); // Importa o middleware CORS
const ImcData = require('./ImcData');

// Inicializa o aplicativo
const app = express();
const PORT = process.env.PORT || 3000;;

// Conexão com o MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Middleware CORS para permitir requisições de outras origens
app.use(cors());

// Middleware para processar requisições com JSON
app.use(express.json());

// Função genérica para simular envio de WhatsApp
function enviarWhatsApp(telefone, mensagem) {
    console.log(`Simulação de envio de WhatsApp:`);
    console.log(`Para: ${telefone}`);
    console.log(`Mensagem: ${mensagem}`);
}

// Rota inicial para testar o servidor
app.get('/', (req, res) => {
  res.send('Servidor rodando para o Centro de Bariátrica');
});

// Rota para cálculo do IMC e salvamento no MongoDB
app.post('/api/calculadora-imc', async (req, res) => {
    const { nome, telefone, email, peso, altura, comorbidades } = req.body;

    // Log dos dados recebidos no terminal
    console.log('Dados recebidos:', { nome, telefone, email, peso, altura, comorbidades });

    // Verificar se todos os campos obrigatórios foram preenchidos
    if (!nome || !telefone || !email || !peso || !altura) {
        return res.status(400).json({ mensagem: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    // Cálculo do IMC
    const imc = (peso / Math.pow(altura, 2)).toFixed(2);

    // Mensagem personalizada com base no IMC e comorbidades
    let mensagem = '';
    if (imc < 18.5) {
        mensagem = 'Seu IMC indica que você está abaixo do peso. Procure um nutricionista para melhorar sua saúde.';
    } else if (imc >= 18.5 && imc < 25) {
        mensagem = 'Parabéns! Seu IMC está dentro da faixa saudável. Continue cuidando da sua saúde com bons hábitos alimentares e atividades físicas!';
    } else if (imc >= 25 && imc < 30) {
        mensagem = 'Seu IMC indica sobrepeso. Pequenos ajustes na alimentação e na prática de exercícios podem fazer toda a diferença para sua saúde e bem-estar. Marque uma consulta com um dos nossos especialistas para explorar as melhores opções de tratamento e obter o suporte necessário para alcançar seus objetivos.';
    } else if (imc >= 30 && imc < 35 && comorbidades && comorbidades.length > 0) {
        mensagem = 'Seu IMC indica obesidade grau I. Ainda não há indicação para cirurgia (mesmo com doenças associadas), mas pequenas mudanças no dia a dia podem trazer grandes benefícios à sua saúde! Marque uma consulta com um dos nossos especialistas para explorar as melhores opções de tratamento e obter o suporte necessário para alcançar seus objetivos.';
    } else if (imc >= 35 && imc < 40 && comorbidades && comorbidades.length > 0) {
        mensagem = `Você atende aos critérios para a cirurgia bariátrica devido ao IMC elevado (obesidade grau II) associado a, no mínimo, uma comorbidade (${comorbidades.join(', ')}). Procure um especialista para uma avaliação detalhada.`;
    } else if (imc >= 40) {
        mensagem = 'Seu IMC indica obesidade grau III (obesidade mórbida). Você atende aos critérios para cirurgia bariátrica. Agende agora mesmo com um dos nossos especialistas.';
    } else {
        mensagem = 'Não foi possível determinar sua condição com base nos dados fornecidos. Por favor, consulte um profissional de saúde.';
    }

    // Salvar os dados no MongoDB
    try {
        const novoRegistro = new ImcData({
            nome,
            telefone,
            email,
            peso,
            altura,
            comorbidades,
            imc,
            mensagem
        });

        await novoRegistro.save();
        console.log('Dados salvos no MongoDB:', novoRegistro);

        // Mensagem para o paciente
        const mensagemPaciente = `Olá ${nome}, ${mensagem} Agende sua consulta pelo link: [LINK_AQUI]`;
        enviarWhatsApp(telefone, mensagemPaciente);
    
        // Mensagem para a clínica
        const mensagemClinica = `Novo paciente capturado: Nome: ${nome}, Telefone: ${telefone}, E-mail: ${email}, IMC: ${imc}, Comorbidades: ${comorbidades?.join(', ') || 'Nenhuma'}`;
        enviarWhatsApp('NUMERO_DA_CLINICA', mensagemClinica);

        // Responder ao cliente com o resultado
        res.json({
            imc,
            mensagem,
            comorbidadesSelecionadas: comorbidades || [],
            observacao: 'Obs.: Os critérios seguem diretrizes médicas reconhecidas, como SBCBM e NIH, considerando IMC, comorbidades e avaliação global.',
        });
    } catch (err) {
        console.error('Erro ao salvar no MongoDB:', err);
        res.status(500).json({ mensagem: 'Erro ao salvar os dados no banco de dados.' });
    }
});

// Rota para o Questionário de Hipovitaminose
app.post('/api/questionario-hipovitaminose', async (req, res) => {
    const data = req.body;  // Use data em vez de desestruturar
    console.log('Dados recebidos:', data);
    
    try {
        // Validação básica
        if (!data.cirurgia || !data.nome || !data.telefone) {
            return res.status(400).json({ mensagem: 'Por favor, preencha os campos obrigatórios.' });
        }

        let mensagem = '';
        let pontuacao = 0;

        // Calcula a pontuação com base nas respostas
        pontuacao += data.cirurgia === 'sim' ? 3 : 1;
        if (data.cirurgia === 'sim') {
            pontuacao += data.tipoCirurgia === 'bypass' ? 3 : data.tipoCirurgia === 'sleeve' ? 2 : 1;

            if (data.sintomas && Array.isArray(data.sintomas)) {
                pontuacao += data.sintomas.reduce((total, sintoma) => {
                    const pontosSintoma = {
                        'queda-cabelo': 2,
                        'caibras': 2,
                        'fadiga': 5,
                        'dificuldades-memoria': 2,
                        'infeccoes-frequentes': 3,
                        'reducao-libido': 1,
                        'fragilidade-unhas': 2,
                        'formigamento': 5,
                        'alteracoes-humor': 3,
                        'desgaste-dentes': 4,
                    };
                    return total + (pontosSintoma[sintoma] || 0);
                }, 0);
            }

            pontuacao += data.suplementos === 'sim' ? 1 : 5;
            pontuacao += data.reposicao === 'oral' ? 2 : data.reposicao === 'injetavel' ? 1 : 3;
        } else if (data.cirurgia === 'nao') {
            if (data.sintomas && Array.isArray(data.sintomas)) {
                pontuacao += data.sintomas.length; // Adiciona 1 ponto por sintoma
            }
            pontuacao += data.tempoSintomas === 'menos-6-meses' ? 1 : data.tempoSintomas === '6-meses-1-ano' ? 2 : 3;
        }

        // Determina a mensagem final com base na pontuação
        if (pontuacao >= 3 && pontuacao <= 10) {
            mensagem = "Parabéns! Seus resultados indicam que está tudo bem até o momento. Agende uma consulta para reforçar seus cuidados.";
        } else if (pontuacao >= 11 && pontuacao <= 20) {
            mensagem = "Fique atento! Alguns sintomas indicam que você pode estar enfrentando deficiências nutricionais. Agende uma consulta agora mesmo.";
        } else if (pontuacao >= 21 && pontuacao <= 30) {
            mensagem = "Atenção! Sua avaliação aponta para deficiências nutricionais importantes. Agende uma consulta agora mesmo.";
        } else {
            mensagem = "⚠️ Atenção! Sinais importantes de deficiências graves. Agende uma consulta urgente.";
        }

        // Fluxo "NÃO"
        if (data.cirurgia === 'nao') {
            if (!data.peso || !data.altura) {
                return res.status(400).json({ mensagem: 'Por favor, insira peso e altura para calcular o IMC.' });
            }    
            const imc = data.peso / (data.altura * data.altura);
            let classificacaoIMC = '';

            if (imc <= 24.9) {
                classificacaoIMC = 'Peso normal';
            } else if (imc <= 29.9) {
                classificacaoIMC = 'Sobrepeso';
            } else if (imc <= 34.9) {
                classificacaoIMC = 'Obesidade Grau I';
            } else if (imc <= 39.9) {
                classificacaoIMC = 'Obesidade Grau II';
            } else {
                classificacaoIMC = 'Obesidade Grau III';
            }

            const sintomasSelecionados = data.sintomas ? data.sintomas.length : 0;

            if (classificacaoIMC === 'Peso normal') {
                if (sintomasSelecionados === 0) {
                    mensagem = 'Parabéns! Seu peso está dentro do normal e você não apresenta sintomas. Continue mantendo hábitos saudáveis para preservar sua saúde e bem-estar!';
                } else if (sintomasSelecionados <= 2) {
                    mensagem = 'Você está com o peso ideal, mas relatou alguns sintomas. Recomendamos observar esses sinais e, se persistirem, procurar um especialista para prevenir problemas futuros. Caso precise, segue o contato para agendamento.';
                } else if (sintomasSelecionados <= 4) {
                    mensagem = 'Embora seu peso esteja dentro do normal, o número de sintomas relatados indica que algo pode estar desequilibrado. Agende uma consulta para uma avaliação detalhada e mantenha sua saúde em dia!';
                } else {
                    mensagem = 'Mesmo com um IMC normal, os sintomas relatados sugerem possíveis deficiências nutricionais ou outros problemas de saúde. É fundamental procurar um especialista para identificar as causas e iniciar um tratamento adequado.';
                }
            }        
            if (classificacaoIMC === 'Obesidade Grau I') {
                if (sintomasSelecionados === 0) {
                    mensagem = 'Seu IMC indica obesidade leve. Mesmo sem sintomas agora, o risco de desenvolver diabetes tipo 2 ou hipertensão é cerca de 2 vezes maior do que em pessoas com peso normal. Que tal agendar uma consulta para traçar um plano de prevenção e cuidar da sua saúde?';
                } else if (sintomasSelecionados <= 2) {
                    mensagem = 'Com obesidade grau I e alguns sintomas, o corpo pode estar sinalizando desequilíbrios. Além disso, o risco de doenças cardiovasculares já começa a aumentar. Recomendamos procurar um especialista para avaliar sua saúde e evitar complicações futuras.';
                } else if (sintomasSelecionados <= 4) {
                    mensagem = 'A obesidade grau I, combinada com os sintomas relatados, aumenta o risco de doenças metabólicas e pode prejudicar sua qualidade de vida. Estudos mostram que agir cedo reduz significativamente esses riscos. Agende uma consulta o quanto antes para investigar e tratar esses sinais!';
                } else {
                    mensagem = 'Os sintomas relatados, junto com obesidade grau I, são um alerta importante. O risco de diabetes e problemas cardiovasculares é elevado e exige atenção urgente. Agende uma consulta para iniciar um plano de cuidados completo e reverter esse quadro.';
                }
            }
            if (classificacaoIMC === 'Obesidade Grau II') {
                if (sintomasSelecionados === 0) {
                    mensagem = 'Seu IMC indica obesidade moderada. Mesmo sem sintomas, o risco de doenças como diabetes tipo 2 é até 3 vezes maior, e complicações articulares também se tornam comuns. Agende uma consulta para começar a prevenir esses problemas e melhorar sua qualidade de vida.';
                } else if (sintomasSelecionados <= 2) {
                    mensagem = 'Com obesidade grau II e alguns sintomas relatados, é importante monitorar sua saúde. O risco de infarto já é 2 a 3 vezes maior, e esses sinais podem indicar desequilíbrios metabólicos. Não adie: agende uma consulta agora mesmo para uma avaliação detalhada.';
                } else if (sintomasSelecionados <= 4) {
                    mensagem = 'Com obesidade grau II e sintomas relevantes, o risco de doenças graves, como hipertensão e apneia do sono, é significativo. Estudos mostram que, com o tratamento adequado e mudanças no estilo de vida, muitos desses sinais podem ser revertidos. Procure ajuda especializada imediatamente para começar um plano de ação.';
                } else {
                    mensagem = 'Os sintomas combinados com obesidade grau II representam um risco importante à sua saúde. O risco de complicações cardiovasculares e metabólicas é elevado. Agendar uma consulta imediatamente para avaliar o melhor tratamento é essencial para prevenir problemas mais graves e melhorar sua saúde.';
                }
            }
            if (classificacaoIMC === 'Obesidade Grau III') {
                if (sintomasSelecionados === 0) {
                    mensagem = 'Seu IMC indica obesidade grave. Mesmo sem sintomas, essa faixa de peso está associada a um risco 4 vezes maior de infarto e redução na expectativa de vida em até 10 anos. Agendar uma consulta é essencial para prevenir complicações severas.';
                } else if (sintomasSelecionados <= 2) {
                    mensagem = 'A obesidade grave, associada a sintomas relatados, representa um risco importante para sua saúde. O risco de desenvolver diabetes tipo 2 é cerca de 6 vezes maior, e complicações como insuficiência respiratória podem surgir. Procure um especialista para iniciar um plano de cuidados personalizado.';
                } else if (sintomasSelecionados <= 4) {
                    mensagem = 'Os sintomas relatados, junto com obesidade grau III, são um forte indicativo de complicações graves, como insuficiência cardíaca e apneia do sono. É fundamental buscar ajuda médica imediatamente para começar um plano de tratamento e reduzir esses riscos.';
                } else {
                    mensagem = '⚠️ Atenção! Sua saúde está em risco grave. O IMC elevado, associado aos sintomas relatados, aumenta significativamente o risco de infarto, AVC e outras complicações sérias. Agende uma consulta urgente para iniciar um plano de cuidados e reverter esse quadro antes que se torne irreversível!';
                }
            }
            // Criação do registro no MongoDB
            try {
                const novoRegistro = new ImcData({
                    ...data, // Inclui os campos enviados no formulário
                    imc, // Inclui o cálculo do IMC
                    mensagem, // A mensagem gerada dinamicamente
                });
                await novoRegistro.save(); // Salva no MongoDB
                console.log('Dados salvos no MongoDB:', novoRegistro);
            } catch (err) {
                console.error('Erro ao salvar no MongoDB:', err);
                return res.status(500).json({ mensagem: 'Erro ao salvar os dados no banco de dados.' });
            }
        }

        // Mensagem para o WhatsApp
        const mensagemPaciente = `Olá, ${data.nome}. ${mensagem} Agende sua consulta pelo link: [LINK_AQUI]`;
        enviarWhatsApp(data.telefone, mensagemPaciente);

        const mensagemClinica = `Novo paciente capturado: Nome: ${data.nome}, Telefone: ${data.telefone}, E-mail: ${data.email}, Pontuação: ${pontuacao}`;
        enviarWhatsApp('NUMERO_DA_CLINICA', mensagemClinica);

        // Envia a resposta ao frontend
        res.json({
            pontuacao,
            mensagem,
        });
    } catch (err) {
        console.error('Erro ao processar o questionário de hipovitaminose:', err);
        res.status(500).json({ mensagem: 'Erro ao salvar os dados no banco de dados.' });
    }
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});