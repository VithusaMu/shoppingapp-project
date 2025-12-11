/**
 * Import required modules from Express and the model file.
 * - Request and Response are types from Express used for handling HTTP requests and responses.
 */
import { Request, Response } from "express";
import { getAllOrders, addOneOrder, getOneProduct } from "../models/model";
import { cart, getUsername, getUserId } from "./CartController";
import { ObjectId } from "mongodb";

/**
 * POST /order
 * Places an order using items in the customer's cart.
 */
export const placeOrder = async (req: Request, res: Response) => {
    // Get the personId for the order
    const personId = getUserId(req);
    if (!personId) {
        return res.status(403).json({ message: "Only customers can place orders." });
    }
    
    // Get the username for accessing the cart
    const username = getUsername(req);
    if (!username) {
        return res.status(403).json({ message: "Only customers can place orders." });
    }
    
    // Get the cart using the username
    const customerCart = cart[username];
    
    console.log("Username:", username);
    console.log("PersonId:", personId);
    console.log("Cart:", customerCart);
    
    if (!customerCart || customerCart.length === 0) {
        return res.status(400).json({ message: "The cart is empty." });
    }
    
    const order = {
        _id: new ObjectId(),
        personId: new ObjectId(personId),
        orderDate: new Date(),
        totalOrderPrice: req.body.totalOrderPrice,
        productsInOrder: customerCart.map((item) => ({
            productId: new ObjectId(item.productId),
            productQuantity: item.quantity,
        })),
    };
    
    try {
        const createdOrder = await addOneOrder(order);
        if (createdOrder) {
            // Clear the cart after placing the order
            cart[username] = [];
            res.status(201).json({
                message: "Order placed successfully.",
                payload: createdOrder,
            });
        } else {
            res.status(400).json({ message: "Order could not be created (invalid product or quantity)." });
        }
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
/**
 * GET /order
 * Returns all orders placed by the customer.
 */
export const getOrders = async (req: Request, res: Response) => {
    const personId = getUserId(req);
    
    if (!personId) {
        return res.status(403).json({ message: "Only customers can view orders." });
    }
    
    try {
        const orderCollection = await getAllOrders();
        if (orderCollection) {
            // Get basic orders
            const orders = await orderCollection.find({ personId: new ObjectId(personId) }).toArray();
            
            // Enhance orders with product details
            const enhancedOrders = await Promise.all(orders.map(async (order) => {
                const productsWithDetails = await Promise.all(order.productsInOrder.map(async (item) => {
                    const product = await getOneProduct(item.productId.toString());
                    return {
                        ...item,
                        productDetails: product || { productName: "Product not available" }
                    };
                }));
                
                return {
                    ...order,
                    productsInOrder: productsWithDetails
                };
            }));
            
            res.status(200).json({
                message: "Orders retrieved",
                payload: enhancedOrders
            });
        } else {
            res.status(500).json({ message: "Order collection not initialized." });
        }
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

