import connectDB from "../../../config/connectDB"


const buscaRelatorios = async function (req, res, next) {
    try {
        const pool = await connectDB();
    const result = await pool.query(
        `SELECT * FROM formularios `            
        );
        res.status(200).json(result.rows);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Falha ao buscar relatórios." });
    
    }
}


export default  buscaRelatorios