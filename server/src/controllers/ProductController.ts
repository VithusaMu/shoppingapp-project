/**
 * Import required modules from Express and the model file.
 * - Request and Response are types from Express used for handling HTTP requests and responses.
 */
import e, { Request, Response } from "express";
import { getAllProducts, getOneProduct, addOneProduct, updateOneProduct, deleteOneProduct, getAllPeople } from "../models/model";
import SessionManager from "../auth/SessionManager"
import { ObjectId } from "mongodb";

/**
 * Handles GET requests to /product/:id
 * Fetches a single Product by its ID. (For seller)
 */
export const getProduct = async (req: Request, res: Response) => {
    try {
        const session = SessionManager.getInstance().getSession(req);

        if (!session || session.data.role !== "seller") {
            return res.status(403).json({ message: "The customer is forbidden to access this endpoint." });
        }
        const productId = req.params.id; 
        const product = await getOneProduct(productId); 
        if (product) {
            res.status(200).json({
                message: "Product Found",
                payload: product,
            });
        } else {
            res.status(404).json({
                message: "Product does not exist",
            });
        }
    } catch (error) {
        console.error("Error getting one Product:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/**
 * GET /product
 * Fetches all products.
 */
export const getProducts = async (req: Request, res: Response) => {
	try {
        const session = SessionManager.getInstance().getSession(req);
		const productCollection = await getAllProducts();
        const personCollection = await getAllPeople(); // Add this if you don't have it

        const sortOption = req.query.sort as string | undefined; // 'name' | 'price' | 'seller'

        if (!productCollection || !personCollection) {
        return res.status(500).json({ message: "Collections not initialized." });
        }

        let query = {};
        if (session?.data.role === "seller") {
        query = { sellerId: new ObjectId(session.data.personId) };
        }

        const products = await productCollection.find(query).toArray();

        // Fetch sellers if sorting by seller name
        let sellerMap: Record<string, string> = {};
        if (session?.data.role !== "seller") {
        const sellerIds = [...new Set(products.map(p => p.sellerId.toString()))];
        const sellers = await personCollection
            .find({ _id: { $in: sellerIds.map(id => new ObjectId(id)) } })
            .toArray();

        sellerMap = Object.fromEntries(sellers.map(s => [s._id.toString(), s.name]));
        }

        const sortedProducts = [...products].sort((a, b) => {
        if (sortOption === "name") {
            return a.productName.localeCompare(b.productName);
        } else if (sortOption === "price") {
            return a.price - b.price;
        } else if (sortOption === "seller") {
            return (sellerMap[a.sellerId.toString()] || "").localeCompare(
            sellerMap[b.sellerId.toString()] || ""
            );
        }
        return 0;
        });

        const productswithSellerName = sortedProducts.map((product) => ({
        ...product,
        sellerName: sellerMap[product.sellerId.toString()] || undefined,
        }));

        res.status(200).json({ message: "Products fetched", payload: productswithSellerName });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /product - Adds a new Product to the database. (for seller)
 */
export const createProduct = async (req: Request, res: Response) => {

    try {
        const session = SessionManager.getInstance().getSession(req);

        if (!session || session.data.role !== "seller") {
            return res.status(403).json({ message: "The customer is forbidden to access this endpoint." });
        }

        const sellerId = new ObjectId(session.data.personId);
        const newProduct = {
            ...req.body,
            sellerId
        };

        const { price } = req.body.product.price;
        if (price < 0) {
            res.status(400).json({
                message: "Product cannot be created, price needs to be non-negative.",
            });
            return;
        }

        const createdProduct = await addOneProduct(newProduct);
        if (createdProduct) {
            res.status(201).json({
                message: "Product has been created",
                payload: createdProduct,
            });
        } else {
            res.status(400).json({
                message: "Product cannot be created",
            });
        }
    } catch (error) {
        console.error("Error creating Product:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};


/**
 * PUT /product/:id - Updates an existing Product by its ID. (for seller)
 */
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const session = SessionManager.getInstance().getSession(req);

        if (!session || session.data.role !== "seller") {
            return res.status(403).json({ message: "The customer is forbidden to access this endpoint." });
        }
        
        const productId = req.params.id
        const updatedData = req.body;
        if (updatedData.sellerId) {
            updatedData.sellerId = new ObjectId(updatedData.sellerId);
        }

        const updatedProduct = await updateOneProduct(productId, updatedData)
        if (updatedProduct) {
            res.status(200).json({
                message: "Product updated",
                payload: updatedProduct,
            });
        } else {
            res.status(404).json({
                message: "Product to update does not exist",
            });
        }
    } catch (error) {
        console.error("Error updating Product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * DELETE /product/:id - Deletes a Product from the database by its ID. (for a seller)
 */
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const session = SessionManager.getInstance().getSession(req);

        if (!session || session.data.role !== "seller") {
            return res.status(403).json({ message: "The customer is forbidden to access this endpoint." });
        }

        const productId = req.params.id
        const deletedProduct = await deleteOneProduct(productId)
        if (deletedProduct) {
            res.status(200).json({
                message: "Product has been deleted",
                payload: deletedProduct,
            });
        } else {
            res.status(404).json({
                message: "Product to delete does not exist",
            });
        }
    } catch (error) {
        console.error("Error deleting Product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
