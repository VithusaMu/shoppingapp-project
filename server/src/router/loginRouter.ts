import { Router } from "express";
import {
    createPerson,
    getPerson,
    deletePerson,
    updatePerson,
    login,
    getSession,
    logout
} from "../controllers/LoginController"
const loginRouter: Router = Router();

loginRouter.post("/login", login);
loginRouter.get("/session", getSession);
loginRouter.get("/:id", getPerson);
loginRouter.post("/", createPerson);
loginRouter.put("/:id", updatePerson);
loginRouter.delete("/:id", deletePerson);
loginRouter.post("/logout", logout);

export default loginRouter;