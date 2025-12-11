import { Router } from "express";

import {
    getCart,
    addCartProduct,
    updateCartProduct,
    deleteCartProduct
} from "../controllers/CartController"

const cartRouter: Router = Router();


cartRouter.get("/", getCart);
cartRouter.post("/:productId", addCartProduct);
cartRouter.put("/:productId", updateCartProduct);
cartRouter.delete("/:productId", deleteCartProduct);

export default cartRouter;