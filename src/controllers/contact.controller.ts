import type { NextFunction, Request, Response } from "express";
import { emailService } from "../services/email.service.js";
import type { ContactRequest } from "../types/contact.js";

export async function createContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body as ContactRequest;

    await emailService.sendContactEmail({
      name: body.name,
      email: body.email,
      company: body.company?.trim() ? body.company.trim() : undefined,
      phone: body.phone?.trim() ? body.phone.trim() : undefined,
      message: body.message,
      submittedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Gracias por contactarnos. Hemos recibido tu mensaje.",
    });
  } catch (error) {
    next(error);
  }
}
