app.post('/api/calculadora-imc', async (req, res) => {
    const { nome, telefone, email, peso, altura, comorbidades } = req.body;

    console.log('Dados recebidos no backend:', req.body);

    if (!nome || !telefone || !email || !peso || !altura) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const imc = (peso / Math.pow(altura, 2)).toFixed(2);

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

    try {
        console.log('Dados para salvar no MongoDB:');
        console.log('Conexão com MongoDB:', mongoose.connection.readyState);
        console.log('Dados recebidos para salvar:', {
            nome,
            telefone,
            email,
            peso,
            altura,
            comorbidades,
            imc,
        });

        const novoRegistro = new ImcData({
            nome,
            telefone,
            email,
            peso,
            altura,
            comorbidades,
            imc,
        });

        await novoRegistro.save();
        console.log('Dados salvos no MongoDB:', novoRegistro);

        const mensagemPaciente = `Olá ${nome}, ${mensagem} Agende sua consulta pelo link: [LINK_AQUI]`;
        enviarWhatsApp(telefone, mensagemPaciente);

        const mensagemClinica = `Novo paciente capturado: Nome: ${nome}, Telefone: ${telefone}, E-mail: ${email}, IMC: ${imc}, Comorbidades: ${comorbidades?.join(', ') || 'Nenhuma'}`;
        enviarWhatsApp('NUMERO_DA_CLINICA', mensagemClinica);

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