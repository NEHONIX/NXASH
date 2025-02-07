import { Request, Response, NextFunction } from "express";
import { ResponseHandler } from "../../utils/lib/error/ResponseHandler";
import { database } from "../../conf/firebase";

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;

    // Récupérer le commentaire pour obtenir le courseId
    const commentSnapshot = await database
      .ref(`/course-comments`)
      //   .orderByChild("id")
      //   .equalTo(commentId)
      .once("value");

    const commentDataInDB = commentSnapshot.val();
    let courseId = null;

    for (let key in commentDataInDB) {
      const data = commentDataInDB[key][commentId];
      if (!data) {
        return ResponseHandler.badRequest(res, "Commentaire non trouvé");
      } else {
        courseId = key;
      }
      //   let commentId = Object.keys(commentData[key]);
    }

    // console.log("courseId: ", courseId);

    // Supprimer le commentaire
    await database.ref(`/course-comments/${courseId}/${commentId}`).remove();

    // Décrémenter le compteur de commentaires du cours
    await database
      .ref(`/published-courses/public/${courseId}/commentsCount`)
      .transaction((current) => (current || 0) - 1);

    return ResponseHandler.success(
      res,
      null,
      "Commentaire supprimé avec succès"
    );
  } catch (error) {
    //console.log("Error deleting comment:", error);
    next(error);
  }
};
