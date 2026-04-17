import { sendEmailToAdmin} from "../controller/email.controller.js";
import express from "express";
// import { protect } from "../middleware/index.js";

const router = express.Router();

router.post("/send-email", sendEmailToAdmin);

export default router;
