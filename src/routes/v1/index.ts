import { Router } from "express";
import { contactRouter } from "./contact.routes.js";

const v1Router = Router();

v1Router.use("/contact", contactRouter);

export { v1Router };
