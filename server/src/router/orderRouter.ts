import { Router } from "express";


import {
    getOrders,
    placeOrder
} from "../controllers/OrderController"
import { promiseHooks } from "v8";

const orderRouter: Router = Router();

orderRouter.post("/", placeOrder)
orderRouter.get("/", getOrders)


export default orderRouter