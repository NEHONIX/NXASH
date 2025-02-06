import { Request, Response, NextFunction } from "express";
import { database } from "../../conf/firebase";
import { ResponseHandler } from "../../utils/lib/error/ResponseHandler";

interface QueryParams {
  page?: string | number;
  limit?: string | number;
  sort?: "latest" | "popular";
}

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, sort = "latest" } = req.query as QueryParams;
    // console.log(courseId);

    const commentsRef = database.ref(`/course-comments/${courseId}`);
    const snapshot = await commentsRef.once("value");

    if (!snapshot.exists()) {
      return ResponseHandler.success(
        res,
        {
          comments: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            hasMore: false,
          },
        },
        "Aucun commentaire trouvé"
      );
    }

    let comments: any[] = [];
    snapshot.forEach((child) => {
      comments.push({
        id: child.key,
        ...child.val(),
      });
    });

    // Trier les commentaires
    if (sort === "latest") {
      comments.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sort === "popular") {
      comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    // Pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const paginatedComments = comments.slice(startIndex, endIndex);
    const total = comments.length;

    return ResponseHandler.success(
      res,
      {
        comments: paginatedComments,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(total / limitNumber),
          totalItems: total,
          hasMore: endIndex < total,
        },
      },
      "Commentaires récupérés avec succès"
    );
  } catch (error) {
    // throw
    next(error);
  }
};
