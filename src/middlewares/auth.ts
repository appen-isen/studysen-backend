import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export interface AuthenticatedClubRequest extends Request {
	clubId: number;
}

export function verifyClubAuth(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token = req.cookies["token"];

	if (!token) {
		res.status(401).json({ message: "Token invalide !" });
		return;
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		// @ts-ignore
		req.clubId = decoded.clubId;
		next();
	} catch (err) {
		res.status(401).json({ message: "Token invalide !" });
		return;
	}
}

export function verifyAdminAuth(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const admin = req.headers["x-admin-key"] as string;
	if (!admin || admin !== process.env.ADMIN_KEY) {
		res.status(401).json({ message: "Clé administrateur invalide !" });
		return;
	}
	next();
}
