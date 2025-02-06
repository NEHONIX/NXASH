import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/custom";
import { ResponseHandler } from "../../utils/lib/error/ResponseHandler";
import { database } from "../../conf/firebase";
import { nanoid } from "nanoid";
import { sendMailNotification } from "../../utils/sendMail";

export const addComment = async (
  req: Request & AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { content } = req.body;
    const studentId = req.user.uid;
    const studentName = req.user?.name;

    if (!studentId || !studentName) {
      return ResponseHandler.unauthorized(res);
    }

    if (!content || content.trim().length === 0) {
      return ResponseHandler.badRequest(
        res,
        "Le contenu du commentaire est requis"
      );
    }

    const commentId = nanoid(8);
    const timestamp = Date.now();

    // Ajouter le commentaire
    await database.ref(`/course-comments/${courseId}/${commentId}`).set({
      content,
      studentId,
      studentName,
      // school,
      timestamp,
      likes: 0,
    });

    // Incrémenter le compteur de commentaires du cours
    await database
      .ref(`/published-courses/public/${courseId}/commentsCount`)
      .transaction((current) => (current || 0) + 1);

    // Notifier le professeur qui a créé le cours
    const courseSnapshot = await database
      .ref(`/published-courses/public/${courseId}`)
      .once("value");
    const course = courseSnapshot.val();

    if (course?.instructorId) {
      const notificationId = nanoid(8);
      const notification = {
        title: "Nouveau commentaire sur votre cours",
        message: `${studentName} a commenté votre cours "${course.title}"`,
        date: new Date().toISOString(),
        read: false,
        ids: notificationId,
      };

      await database
        .ref(`notifications/${course.instructorId}/${notificationId}`)
        .set(notification);

      // Émettre la notification
      sendMailNotification({
        subject:
          "Nouveau commentaire sur votre cours le '" + notification.date + "'",
        title: notification.title,
        to: "nehonixspace@gmail.com",
        message: notification.message,
      });
      // Émettre la notification via Socket.IO si disponible
    }

    return ResponseHandler.success(
      res,
      { commentId },
      "Commentaire ajouté avec succès"
    );
  } catch (error) {
    // console.log("Error adding comment:", error);
    next(error);
  }
};
