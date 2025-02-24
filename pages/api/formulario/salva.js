import connectDB from '../../../config/connectDB';

const salvaFormulario = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const pool = await connectDB();
    const { formType, inputs } = req.body;

    if (!formType || !inputs || !Array.isArray(inputs)) {
      return res.status(400).json({ message: 'Dados inválidos: formType e inputs são obrigatórios.' });
    }

    // Inserir o formulário na tabela 'formularios'
    const formSql = `INSERT INTO formularios (titulo) VALUES ($1) RETURNING id;`;
    const formValues = [formType]; // 'formType' é o título do formulário
    const formResult = await pool.query(formSql, formValues);
    const formularioId = formResult.rows[0].id;

    let perguntasComIds = [];

    // Para cada pergunta, insira na tabela 'perguntas'
    for (const input of inputs) {
      const perguntaSql = `
        INSERT INTO perguntas (id_formulario, pergunta, tipo) 
        VALUES ($1, $2, $3) RETURNING id;
      `;
      const perguntaValues = [formularioId, input.labelText, input.type];
      const perguntaResult = await pool.query(perguntaSql, perguntaValues);

      const perguntaId = perguntaResult.rows[0].id;

      // Criar um objeto para armazenar a pergunta
      const perguntaObj = {
        id_pergunta: perguntaId,
        id_formulario: formularioId,
        pergunta: input.labelText,
        tipo: input.type,
        opcoes: [] // Será preenchido apenas se houver opções
      };

      // Se for uma pergunta do tipo "MULTIPLE_OPTION" ou "SELECT", insira as opções
      if (['MULTIPLE_OPTION', 'SELECT'].includes(input.type) && Array.isArray(input.options)) {
        for (const option of input.options) {
          const opcaoSql = `
            INSERT INTO opcoes (id_pergunta, opcao) 
            VALUES ($1, $2) RETURNING id;
          `;
          const opcaoValues = [perguntaId, option.value];
          const opcaoResult = await pool.query(opcaoSql, opcaoValues);

          // Adiciona as opções no objeto da pergunta
          perguntaObj.opcoes.push({
            id_opcao: opcaoResult.rows[0].id,
            id_pergunta: perguntaId,
            opcao: option.value
          });
        }
      }

      // Adiciona a pergunta ao array independentemente do tipo
      perguntasComIds.push(perguntaObj);
    }

    // Retorna os IDs de todas as perguntas e o ID do formulário salvo
    res.status(201).json({ 
      message: 'Formulário salvo com sucesso!',
      formularioId,
      perguntas: perguntasComIds
    });

  } catch (error) {
    console.error('Erro ao salvar formulário:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
};

export default salvaFormulario;
