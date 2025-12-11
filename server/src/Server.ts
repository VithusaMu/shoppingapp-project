import express from "express";
import { login } from "./controllers/LoginController";
import path from "path";
import { initDB } from "../src/models/model";
import orderRouter from "./router/orderRouter";
import cartRouter from "./router/cartRouter";
import loginRouter from "./router/loginRouter";
import productRouter from "./router/productRouter";
import cookieParser from "cookie-parser"
import { getHome } from "./controllers/LoginController";
import cors from "cors";


export default class Server {
	private app = express();
	private port = 3000;
	private hostname = "127.0.0.1";

	constructor() {
		this.configureMiddleware();
		this.configureRoutes();
		this.startServer();
		initDB().catch((err) => console.error("DB Init Error:", err));
	}

	public configureMiddleware() {
		this.app.use(express.json());
		this.app.use(cookieParser());
		this.app.use(express.static('public'));
		this.app.use('/images', express.static(path.join(__dirname, '../../images/')));
		this.app.use(cors({
			origin: "http://localhost:5173",
			credentials: true
		}));
	}

	public configureRoutes() {
		this.app.get("/",getHome);
		this.app.use("/order", orderRouter);
		this.app.use("/person", loginRouter);
		this.app.use("/product", productRouter);
		this.app.use("/cart", cartRouter);
	}

	public startServer() {
		this.app.listen(this.port, () => {
			console.log(`Server running at http://${this.hostname}:${this.port}/`);
		});
	}
}