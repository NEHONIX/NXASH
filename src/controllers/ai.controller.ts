import { Request, Response, NextFunction } from "express";
import axios from "axios";
import ApiError from "../utils/ApiError";

export class AIController {
  static async analyzeCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { language, code } = req.body;

      if (!language || !code) {
        throw new ApiError(400, "Langage et code sont requis");
      }

      const prompt = `
      Tu es un mentor en programmation. 
      Analyse ce code ${language} et fournis :
      1. Corrections syntaxiques
      2. Suggestions d'amélioration
      3. Explications détaillées
      4. Bonnes pratiques

      Code à analyser:
      ${code}
    `;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const aiAnalysis = response.data.candidates[0].content.parts[0].text;

      res.status(200).json({
        success: true,
        data: {
          analysis: aiAnalysis
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
