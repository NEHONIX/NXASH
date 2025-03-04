import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import { VALID_STUDENT_LEVELS } from "../types/course";
import { cleanJSON, extractJSON } from "../utils/extrackJson";
import { database } from "../conf/firebase";
import { AuthenticatedRequest } from "../types/custom";
import { GEMINI_AI_REQUEST } from "./api/gemini.api";
import { filepath, readCache, writeCache } from "../utils/cache/server.cache";
// import ServerCaches from "../utils/cache/server.cache.ts.draft";

interface ExplanationCacheData {
  timestamp: number;
  courseId: string;
  level: string;
  userId: string;
  explanation: any;
}

interface ExplanationCache {
  [key: string]: ExplanationCacheData;
}

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
      const courseData = req.body;
      const { course, level, courseId } = courseData;

      if (!course || !level || !courseId) {
        return res.status(400).json({
          success: false,
          message: "Le contenu du cours, le niveau, l'id du cours sont requis",
          validation: {
            course: !course ? "manquant" : "présent",
            level: !level ? "manquant" : "présent",
            courseId: !courseId ? "manquant" : "présent",
          },
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
  - Chaque exercice doit comporter **15 questions minimum et 20** questions maximum**.
  - **Format JSON strict** sans texte superflu.
  - **Utilise les balises suivantes pour formater les éléments :**  
    - Code : \`[nehonix.printCode]console.log('Hello')[/nehonix.printCode]\`
    - Important : \`[nehonix.writeImportant]Texte important[/nehonix.writeImportant]\`
    - Avertissement : \`[nehonix.writeWarning]Attention[/nehonix.writeWarning]\`
    - Note : \`[nehonix.writeNote]Note informative[/nehonix.writeNote]\`
    - Définition : \`[nehonix.printDef]Définition ici[/nehonix.printDef]\`
    - Exemple : \`[nehonix.printEx]Exemple de code[/nehonix.printEx]\`
    Pour le code, tu peux passer une valeur optionnnelle pour indiquer le langage
    (par défaut c'est javscript). Exemple: [nehonix.printCode:javascript]console.log('Hello')[/nehonix.printCode] ou
    [nehonix.printCode:python]Print('Hello world')[/nehonix.printCode]
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
      let exercise;
      try {
        const response = await GEMINI_AI_REQUEST({
          prompt: exercisePrompt,
        });

        const exoResponse = await response.data.candidates[0].content.parts[0]
          .text;
        exercise = exoResponse;
      } catch (error: any) {
        return res.status(500).json({
          message:
            "Nous avons eu un problème lors de la création de l'exercice.",
          error,
        });
      }

      const cleanIAOutPut = cleanJSON(exercise);
      const convertJsonToObj = extractJSON(cleanIAOutPut);

      await refDb.set(convertJsonToObj);

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

  /**
   *@function generateExplainingCourse
   * @param req
   * @param res
   * @param next
   * @returns
   * ça permet d'avoir un cours explicatif pour un cours
   */

  static async generateExplainingCourse(
    req: Request & AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const courseData = req.body;
      const { course, level, courseId } = courseData;
      const userId = req.user.uid;
      const path = "/ai/courseExplanationCache.txt";

      // Cache configuration
      // const cacheManager = new ServerCaches({
      //   filepath: "./caches/courseExplanationCache.json",
      // });
      // const readCache = cacheManager.readCache;
      // const writeCache = cacheManager.writeCache;

      const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures - les explications sont statiques
      const cacheKey = `${level}_${userId}_${courseId}`;

      // Validation des entrées
      if (!course || !level || !courseId) {
        return res.status(400).json({
          success: false,
          message: "Le contenu du cours, le niveau, l'id du cours sont requis",
          validation: {
            course: !course ? "manquant" : "présent",
            level: !level ? "manquant" : "présent",
            courseId: !courseId ? "manquant" : "présent",
          },
        });
      }

      // Vérifier d'abord le cache local
      const cachedData = readCache(filepath(path)) as ExplanationCache;
      const cachedExplanation = cachedData?.[cacheKey];

      if (
        cachedExplanation &&
        Date.now() - cachedExplanation.timestamp < CACHE_TTL
      ) {
        return res.status(200).json({
          success: true,
          message: "Explication du cours récupérée depuis le cache",
          data: {
            explanation: cachedExplanation.explanation,
            fromCache: true,
          },
        });
      }

      // Si pas dans le cache local, vérifier Firebase Realtime Database
      const refDb = database.ref(
        `explained-course/${level}/${userId}/${courseId}`
      );

      const existingExplanation = await refDb.once("value");
      if (existingExplanation.exists()) {
        const data = existingExplanation.val();

        // Mettre en cache l'explication existante
        const newCacheData: ExplanationCache = {
          ...cachedData,
          [cacheKey]: {
            timestamp: Date.now(),
            courseId,
            level,
            userId,
            explanation: data,
          },
        };

        writeCache({
          filepath: filepath(path),
          data: newCacheData,
        });

        return res.status(200).json({
          message: "Un cours explicatif a été récupéré",
          data: {
            explanation: data,
            fromFirebase: true,
          },
        });
      }

      // Générer une nouvelle explication avec l'IA
      const coursePrompt = `
    Tu es un mentor en programmation. Donne une explication appronfondi et très détailé sur le cours suivant :
    "${course}" il faut t'assurer et faire tout le neccessaire  de sorte que l'élève (étudiant) puisse 
    comprendre le cours qu'il a eu aujourd'hui!

    ### Niveau de l'élève :
    - Spécialité : ${["FrontEnd", "BackEnd", "FullStack"].join(", ")}
    - Niveau : ${Object.keys(VALID_STUDENT_LEVELS).join(
      ", "
    )} (Débutant, Intermédiaire, Avancé)

  ### Contraintes :
  - Chaque explication doit se fait illustré par des exemples et des questions, soit **4 questions maximum**.
  - **Format JSON strict** sans texte superflu.
  - **Utilise les balises suivantes pour formater les éléments :**  
    - Code : \`[nehonix.printCode]console.log('Hello')[/nehonix.printCode]\`
    - Important : \`[nehonix.writeImportant]Texte important[/nehonix.writeImportant]\`
    - Avertissement : \`[nehonix.writeWarning]Attention[/nehonix.writeWarning]\`
    - Note : \`[nehonix.writeNote]Note informative[/nehonix.writeNote]\`
    - Définition : \`[nehonix.printDef]Définition ici[/nehonix.printDef]\` pas writeDef mais printDef
    - Exemple : \`[nehonix.printEx]Exemple de code[/nehonix.printEx]\`
    Pour le code, tu peux passer une valeur optionnnelle pour indiquer le langage
    (par défaut c'est javscript). Exemple: [nehonix.printCode:javascript]console.log('Hello')[/nehonix.printCode] ou
    [nehonix.printCode:python]Print('Hello world')[/nehonix.printCode]
  ### Format de sortie :
  {
    "title": "Titre du cours expliqué",
    "target": "Objectif pédagogique",
    "explanation": {
  // Introduction générale du sujet de cours (ex: définition du DOM)
  introduction: string;

  // Tableau des concepts clés, chacun avec un titre et un contenu détaillé
  // Permet de structurer les points importants à comprendre
  concepts_cles: {
  // Titre court et descriptif du concept
  title: string;

  // Explication détaillée du concept
  content: string;
}


  // Exemple de code ou d'illustration pratique du concept
  // Aide à comprendre concrètement le sujet 
  exemple: string;
  // Tableau de questions-réponses pour tester et approfondir la compréhension
  // Chaque entrée contient une question et sa réponse correspondante
  questions: {
    question: string; // La question posée
    answer: string; // La réponse détaillée
  }[];
}
  }

  ### Règles :
  - **Explique en détail chaque point (grands points)
   et fournis une explication très détaillée. 
   Ton objectif est de faire comprendre le cours 
   par tous les moyens (mais respecte la structure pour permettre un bon formatage dans le frontend).**
  - **Ne génère aucun texte en dehors du JSON.**
  - tu dois obligatoirement à chaque fois illustrer tes explications
  -tu dois toujours t'assurer que les mots clés utilisés pour les formatages sont correctes (pas d'espace entre les balises exemple: [nehonix.prinCode ]...)
  - **Assure-toi que toutes les parties importantes du cours gardent leur mise en forme avec les balises personnalisées.**
  - **Si une réponse ou une question contient du code, elle doit toujours être entourée de [nehonix.printCode]...[/nehonix.printCode].**
  **Retourne directement le JSON sans mise en forme Markdown.**
`;

      let explanation;
      try {
        const response = await GEMINI_AI_REQUEST({
          prompt: coursePrompt,
        });

        explanation = response.data.candidates[0].content.parts[0].text;
      } catch (error: any) {
        return res.status(500).json({
          message: `Nous avons eu un problème lors de l'explication pour le cours avec l'id ${courseId}`,
          error,
        });
      }

      const cleanIAOutPut = cleanJSON(explanation);
      const convertJsonToObj = extractJSON(cleanIAOutPut);

      // Sauvegarder dans Firebase
      await refDb.set(convertJsonToObj);

      // Mettre en cache la nouvelle explication
      const newCacheData: ExplanationCache = {
        ...cachedData,
        [cacheKey]: {
          timestamp: Date.now(),
          courseId,
          level,
          userId,
          explanation: convertJsonToObj,
        },
      };

      // Nettoyer les entrées expirées du cache
      Object.keys(newCacheData).forEach((key) => {
        if (Date.now() - newCacheData[key].timestamp > CACHE_TTL) {
          delete newCacheData[key];
        }
      });

      writeCache({
        data: newCacheData,
        filepath: filepath(path),
      });

      res.status(200).json({
        success: true,
        data: {
          explanation: convertJsonToObj,
          generated: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
