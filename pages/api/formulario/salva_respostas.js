import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../config/connectDB";

const salvaRespostas = async (req,res) => {

    try {
        const pool = await connectDB()
    } catch (error) {
        
    }


const { respostas } = req.body;
console.log("🚀 ~ salvaRespostas ~ respostas:", respostas)
};

export default salvaRespostas;
