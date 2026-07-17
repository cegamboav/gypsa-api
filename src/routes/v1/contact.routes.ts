import { Router } from "express";
import { createContact } from "../../controllers/contact.controller.js";
import { validate } from "../../middleware/validate.js";
import { contactRequestSchema } from "../../types/contact.js";

const contactRouter = Router();

contactRouter.post("/", validate(contactRequestSchema), createContact);

export { contactRouter };
