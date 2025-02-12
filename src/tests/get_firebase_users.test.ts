import { Request, Response } from "express";
import { firestore } from "../conf/firebase";
import { IUser } from "../types/model";
import ApiError from "../utils/ApiError";

export const test_get_firebase_users = async (req: Request, res: Response) => {
  try {
    const userSnapshot = await firestore.collection("users").get();

    if (userSnapshot.empty) {
      throw new ApiError(401, "Aucun utilisateur trouvé");
    }

    // Récupérer tous les utilisateurs dans un tableau
    const usersData = userSnapshot.docs.map((doc) => doc.data() as IUser);

    res.status(200).json({
      message: "Succès",
      usersData,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};