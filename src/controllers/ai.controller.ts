import { Request, Response, NextFunction } from "express";
import axios from "axios";
import ApiError from "../utils/ApiError";
import { VALID_STUDENT_LEVELS } from "../types/course";
import { cleanJSON, extractJSON } from "../utils/extrackJson";
import { database } from "../conf/firebase";
import { AuthenticatedRequest } from "../types/custom";
import { GEMINI_AI_REQUEST } from "./api/gemini.api";

export class AIController {
  static async analyzeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { language, code } = req.body;

      //console.log({ language, code });

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

      const response = await GEMINI_AI_REQUEST({
        prompt: prompt,
      });

      const aiAnalysis = response.data.candidates[0].content.parts[0].text;

      res.status(200).json({
        success: true,
        data: {
          analysis: aiAnalysis,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate programming exercise based on the prompt,
  /** it can be a course code or a text. For each request, level
   * will be provided to determine the difficulty of the exercise.
   * Level can be school level (see interface)
   */
  static async generateProgrammingExercise(
    req: Request & AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { course, level, courseId } = req.body.course as {
        course: string;
        level: string;
        courseId: string;
      };

      //console.log({ course, level, courseId });

      if (!course || !level || !courseId) {
        // throw new ApiError(
        //   400,
        //   "Le contenu du cours, le niveau, l'id du cours sont requis"
        // );
        console.log(
          "Le contenu du cours, le niveau, l'id du cours sont requis"
        );
        return res.status(400).json({
          message: "Le contenu du cours, le niveau, l'id du cours sont requis",
          data: { course, level, courseId },
        });
      }

      const refDb = database.ref(`quiz/${level}/${req.user.uid}/${courseId}`);

      if ((await refDb.once("value")).exists()) {
        const data = (await refDb.once("value")).val();
        res.status(201).json({
          message: "Vous avez déjà généré un exercice pour ce cours",
          data: {
            exercise: data,
          },
        });
        return;
      }

      const exercisePrompt = `
    Tu es un mentor en programmation. Génère un exercice basé sur le cours suivant :
    ${course}

    ### Niveau de l'élève :
    - Spécialité : ${["FrontEnd", "BackEnd", "FullStack"].join(", ")}
    - Niveau : ${Object.keys(VALID_STUDENT_LEVELS).join(
      ", "
    )} (Débutant, Intermédiaire, Avancé)

  ### Contraintes :
  - Chaque exercice doit comporter **10 questions maximum**.
  - **Format JSON strict** sans texte superflu.
  - **Utilise les balises suivantes pour formater les éléments :**  
    - Code : \`[nehonix.printCode]console.log('Hello')[/nehonix.printCode]\`
    - Important : \`[nehonix.writeImportant]Texte important[/nehonix.writeImportant]\`
    - Avertissement : \`[nehonix.writeWarning]Attention[/nehonix.writeWarning]\`
    - Note : \`[nehonix.writeNote]Note informative[/nehonix.writeNote]\`
    - Définition : \`[nehonix.printDef]Définition ici[/nehonix.printDef]\`
    - Exemple : \`[nehonix.printEx]Exemple de code[/nehonix.printEx]\`

  ### Format de sortie :
  {
    "title": "Titre de l'exercice",
    "target": "Objectif pédagogique",
    "questions": {
      "Q1": "Énoncé de la question 1",
      "Q2": "Énoncé de la question 2"
    },
    "answers": {
      "R1": ["Réponse attendue pour Q1"],
      "R2": ["Réponse attendue pour Q2"]
    }
  }

  ### Règles :
  - **Ne génère aucun texte en dehors du JSON.**
  - **Assure-toi que toutes les parties importantes du cours gardent leur mise en forme avec les balises personnalisées.**
  - **Si une réponse ou une question contient du code, elle doit toujours être entourée de [nehonix.printCode]...[/nehonix.printCode].**
  **Retourne directement le JSON sans mise en forme Markdown.**
`;

      const response = await GEMINI_AI_REQUEST({
        prompt: exercisePrompt,
      });

      const exercise = await response.data.candidates[0].content.parts[0].text;

      const cleanIAOutPut = cleanJSON(exercise);
      const convertJsonToObj = extractJSON(cleanIAOutPut);

      await refDb.set(convertJsonToObj);

      console.log("Exo envoyé");
      res.status(200).json({
        success: true,
        data: {
          exercise: convertJsonToObj,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export async function generateProgrammingExercise(
  req: Request & AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { course, level, courseId } = req.body.course as {
      course: string;
      level: string;
      courseId: string;
    };

    //console.log({ course, level, courseId });

    if (!course || !level || !courseId) {
      // throw new ApiError(
      //   400,
      //   "Le contenu du cours, le niveau, l'id du cours sont requis"
      // );
      console.log("Le contenu du cours, le niveau, l'id du cours sont requis");
      return res.status(400).json({
        message: "Le contenu du cours, le niveau, l'id du cours sont requis",
        data: { course, level, courseId },
      });
    }

    const refDb = database.ref(`quiz/${level}/${req.user.uid}/${courseId}`);

    if ((await refDb.once("value")).exists()) {
      const data = (await refDb.once("value")).val();
      res.status(201).json({
        message: "Vous avez déjà généré un exercice pour ce cours",
        data: {
          exercise: data,
        },
      });
      return;
    }

    const exercisePrompt = `
    Tu es un mentor en programmation. Génère un exercice basé sur le cours suivant :
    ${course}

    ### Niveau de l'élève :
    - Spécialité : ${["FrontEnd", "BackEnd", "FullStack"].join(", ")}
    - Niveau : ${Object.keys(VALID_STUDENT_LEVELS).join(
      ", "
    )} (Débutant, Intermédiaire, Avancé)

  ### Contraintes :
  - Chaque exercice doit comporter **10 questions maximum**.
  - **Format JSON strict** sans texte superflu.
  - **Utilise les balises suivantes pour formater les éléments :**  
    - Code : \`[nehonix.printCode]console.log('Hello')[/nehonix.printCode]\`
    - Important : \`[nehonix.writeImportant]Texte important[/nehonix.writeImportant]\`
    - Avertissement : \`[nehonix.writeWarning]Attention[/nehonix.writeWarning]\`
    - Note : \`[nehonix.writeNote]Note informative[/nehonix.writeNote]\`
    - Définition : \`[nehonix.printDef]Définition ici[/nehonix.printDef]\`
    - Exemple : \`[nehonix.printEx]Exemple de code[/nehonix.printEx]\`

  ### Format de sortie :
  {
    "title": "Titre de l'exercice",
    "target": "Objectif pédagogique",
    "questions": {
      "Q1": "Énoncé de la question 1",
      "Q2": "Énoncé de la question 2"
    },
    "answers": {
      "R1": ["Réponse attendue pour Q1"],
      "R2": ["Réponse attendue pour Q2"]
    }
  }

  ### Règles :
  - **Ne génère aucun texte en dehors du JSON.**
  - **Assure-toi que toutes les parties importantes du cours gardent leur mise en forme avec les balises personnalisées.**
  - **Si une réponse ou une question contient du code, elle doit toujours être entourée de [nehonix.printCode]...[/nehonix.printCode].**
  **Retourne directement le JSON sans mise en forme Markdown.**
`;

    const response = await GEMINI_AI_REQUEST({
      prompt: exercisePrompt,
    });

    const exercise = await response.data.candidates[0].content.parts[0].text;

    const cleanIAOutPut = cleanJSON(exercise);
    const convertJsonToObj = extractJSON(cleanIAOutPut);

    await refDb.set(convertJsonToObj);

    console.log("Exo envoyé");
    res.status(200).json({
      success: true,
      data: {
        exercise: convertJsonToObj,
      },
    });
  } catch (error) {
    next(error);
  }
}
