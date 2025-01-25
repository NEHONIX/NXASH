import jwt from "jsonwebtoken";
import { ITokenPayload } from "../types/model";

const JWT_SECRET = process.env.JWT_SECRET || "nehonix-super-secret-key-2024";

export const generateToken = async (
  payload: ITokenPayload,
  { TOKEN_EXPIRY = "24h" }: { TOKEN_EXPIRY?: string } = {}
) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

//Décoder un token
export const decodeToken = async (token: string): Promise<ITokenPayload | string> => {
  try {
    const tryToDecode = jwt.verify(token, JWT_SECRET);
    return tryToDecode as ITokenPayload;
  } catch (error: any) {
    return `error: ${
      error.message ||
      error ||
      "Une erreur inconnue s'est produite lors de la verification du token"
    }`;
  }
};

// interface decodeT {
//   uid: string;
//   email: string;
//   phone: string;
//   role: string;
//   matricule: string;
//   deviceInfo: string;
// }
