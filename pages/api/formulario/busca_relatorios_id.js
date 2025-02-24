import connectDB from "../../../config/connectDB"

const buscaPerguntasRelatorios = async (req, res) => {
    try {
        const pool = await connectDB()
        
        // Pegando o id do corpo da requisição
        const dados = req.body.id

        // Verificando se o id foi fornecido
        if (!dados) {
            return res.status(400).json({ message: 'ID do formulário é obrigatório.' })
        }

        console.log("🚀 ~ buscaPerguntasRelatorios ~ dados:", dados)

        const sql =  `SELECT 
                        a.*,    -- Seleciona todas as colunas da tabela formularios
                        b.*,    -- Seleciona todas as colunas da tabela perguntas
                        c.*     -- Seleciona todas as colunas da tabela opcoes
                    FROM 
                        formularios AS a
                        LEFT JOIN 
                        perguntas AS b ON (a.id = b.id_formulario)  -- Relaciona formularios com perguntas
                        LEFT JOIN 
                        opcoes AS c ON (b.id = c.id_pergunta)
                    WHERE a.id = $1`; 

        const result = await pool.query(sql, [dados])
        console.log("🚀 ~ buscaPerguntasRelatorios ~ result:", result.rows)

        // Retornando os resultados da consulta
        res.status(200).json(result.rows)
        pool.close
    } catch (error) {
        console.log("Erro ao buscar perguntas e opções:", error)
        res.status(500).json({ message: "Erro ao buscar perguntas e opções", error: error.message })
    }
}

export default buscaPerguntasRelatorios
