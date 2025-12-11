import { Request, Response } from "express";
import SessionManager from "../auth/SessionManager";
import { getOneProduct } from "../models/model";

// In-memory cart storage
export const cart: Record<string, { productId: string; quantity: number }[]> = {};

export const getUsername = (req: Request): string | undefined => {
    const session = SessionManager.getInstance().getSession(req);
    if (!session || session.data.role !== "customer") return undefined;
    return session.data.username;
};

export const getUserId = (req: Request): string | undefined => {
    const session = SessionManager.getInstance().getSession(req);
    if (!session || session.data.role !== "customer") return undefined;
    return session.data.personId; // This assumes your session stores the personId
};

/**
 * GET /cart
 * Gets all the products of a customer's cart with product details.
 */
export const getCart = async (req: Request, res: Response) => {
    const username = getUsername(req);
    if (!username) {
        return res.status(403).json({ message: "Unauthorized: not logged in/not a customer" });
    }
    
    const customerCart = cart[username] || [];
    
    // Fetch product details for each item in the cart
    const cartWithDetails = await Promise.all(customerCart.map(async (item) => {
        const product = await getOneProduct(item.productId);
        return {
            productId: item.productId,
            quantity: item.quantity,
            product: product || { productName: "Product not available" }
        };
    }));
    
    let total = 0;
    cartWithDetails.forEach(item => {
        const product = item.product as { price?: number };
        if (product && typeof product.price === "number") {
            total += product.price * item.quantity;
        }
    });
    
    res.status(200).json({ 
        message: "Cart retrieved", 
        payload: {
            items: cartWithDetails,
            total
        }
    });
};

/**
 * POST /cart/:productId
 * Adds a product to a customer's cart.
 */
export const addCartProduct = async (req: Request, res: Response) => {
    const username = getUsername(req);
    const productId = req.params.productId;
    const { quantity } = req.body;
    
    console.log("Adding product to cart for user:", username);
    console.log("Current cart state:", cart);
    
    if (!username) {
        return res.status(403).json({ message: "Unauthorized: not logged in/not a customer" });
    }
    
    // Validate quantity
    if (!isValidQuantity(quantity)) {
        return res.status(400).json({ message: "Invalid quantity" });
    }
    
    // Check if product exists
    const product = await getOneProduct(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    
    // Check if product is available in sufficient quantity
    if (!product.available || product.inventoryNumber < quantity) {
        return res.status(400).json({ 
            message: "Product not available in requested quantity",
            available: product.inventoryNumber
        });
    }
    
    // Initialize cart if needed
    if (!cart[username]) {
        cart[username] = [];
    }
    
    // Check if product already in cart
    const existingProduct = cart[username].find((item) => item.productId === productId);
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        cart[username].push({ productId, quantity });
    }
     console.log("Updated cart state:", cart);
    // Return updated cart with product details
    await getCart(req, res);
};

/**
 * PUT /cart/:productId
 * Updates quantity of a product in the customer's cart.
 */
export const updateCartProduct = async (req: Request, res: Response) => {
    const username = getUsername(req);
    if (!username) {
        return res.status(403).json({ message: "Unauthorized: not logged in/not a customer" });
    }
    
    const productId = req.params.productId;
    const { quantity } = req.body; // Extract quantity from request body
    
    if (!isValidQuantity(quantity) && quantity !== 0) {
        return res.status(400).json({ message: "Quantity is invalid" });
    }
    
    const customerCart = cart[username];
    if (!customerCart) {
        return res.status(404).json({ message: "Cart not found" });
    }
    
    const item = customerCart.find((p) => p.productId === productId);
    if (!item) {
        return res.status(404).json({ message: "Product is not in your cart" });
    }
    
    // If quantity is 0, remove the item
    if (quantity === 0) {
        cart[username] = customerCart.filter((p) => p.productId !== productId);
    } else {
        // Check if product has enough inventory
        const product = await getOneProduct(productId);
        if (!product || !product.available || product.inventoryNumber < quantity) {
            return res.status(400).json({ 
                message: "Product not available in requested quantity",
                available: product?.inventoryNumber || 0
            });
        }
        
        item.quantity = quantity;
    }
    
    // Return updated cart with product details
    await getCart(req, res);
};

/**
 * DELETE /cart/:productId
 * Removes a specific product from the customer's cart.
 */
export const deleteCartProduct = async (req: Request, res: Response) => {
    const username = getUsername(req);
    if (!username) {
        return res.status(403).json({ message: "Unauthorized: not logged in/not a customer" });
    }
    
    const productId = req.params.productId;
    const customerCart = cart[username];
    
    if (!customerCart) {
        return res.status(404).json({ message: "Cart not found" });
    }
    
    // Check if product is in cart
    const productExists = customerCart.some(item => item.productId === productId);
    if (!productExists) {
        return res.status(404).json({ message: "Product not found in cart" });
    }
    
    cart[username] = customerCart.filter((item) => item.productId !== productId);
    
    // Return updated cart with product details
    await getCart(req, res);
};

/**
 * Helper function to validate quantity
 */
const isValidQuantity = (q: any): q is number => {
    return typeof q === "number" && Number.isInteger(q) && q > 0;
};