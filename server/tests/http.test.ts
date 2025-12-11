jest.mock("../src/auth/SessionManager");


import {
  login,
  getSession,
  getHome,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
  logout,
} from "../src/controllers/LoginController";
import { placeOrder, getOrders } from "../src/controllers/OrderController";
import {
  getCart,
  addCartProduct,
  updateCartProduct,
  deleteCartProduct,
  cart as inMemoryCart,
} from "../src/controllers/CartController";

import {
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../src/controllers/ProductController";


import { getMockReq, getMockRes } from '@jest-mock/express';

import * as model from "../src/models/model";
import SessionManager from "../src/auth/SessionManager";
import * as cartController from "../src/controllers/CartController";
import { ObjectId } from "mongodb";
import { Request, Response } from "express";


// Use jest.fn to create typed mocks
const mockReq = (data: Partial<Request> = {}) => data as Request;
const mockRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock("../src/models/model");

const mockProductId = new ObjectId().toString(); 
const mockUserId = new ObjectId().toString();
const mockCart = [
  { productId: mockProductId.toString(), quantity: 2 }
];
const mockOrder = {
  _id: new ObjectId(),
  personId: mockUserId,
  orderDate: new Date(),
  totalOrderPrice: 199.98,
  productsInOrder: [{ productId: mockProductId, productQuantity: 2 }]
};

const mockPerson = {
  _id: new ObjectId("507f1f77bcf86cd799439011"),
  username: "user1",
  password: "pass",
  email: "a@a.com",
  name: "User",
  phoneNumber: 1234567890,
  role: "customer" as const,
};

const mockSession = {
  data: {
    personId: mockUserId,
    role: "customer",
    username: "user1",
  },
  set: jest.fn(),
  destroy: jest.fn(),
  cookie: { toString: () => "mock_cookie" },
};


describe("Login Controller", () => {
  const mockSession = {
    data: {
      personId: mockPerson._id.toHexString(), // this is what the controller expects
      role: mockPerson.role,
      username: mockPerson.username,
    },
    set: jest.fn(),
    cookie: { toString: () => "mock_cookie" },
    destroy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SessionManager.getInstance as jest.Mock).mockReturnValue({
      createSession: () => mockSession,
      getSession: () => mockSession,
    });
  });

  test("getHome should return 200 with welcome message", async () => {
    const req = mockReq();
    const res = mockRes();
    await getHome(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Hello from the shopping app" });
  });

  test("getSession returns active session info", async () => {
    const req = mockReq();
    const res = mockRes();
    await getSession(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      personId: mockPerson._id.toHexString(),
      role: mockPerson.role,
      username: mockPerson.username,
    });
  });

  test("getSession returns 401 if no session", async () => {
    (SessionManager.getInstance as jest.Mock).mockReturnValueOnce({ getSession: () => undefined });
    const req = mockReq();
    const res = mockRes();
    await getSession(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("getPerson returns person if found", async () => {
    (model.getOnePerson as jest.Mock).mockResolvedValue(mockPerson);
    const req = mockReq({ params: { id: mockPerson._id.toString() } });
    const res = mockRes();
    await getPerson(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getPerson returns 404 if not found", async () => {
    (model.getOnePerson as jest.Mock).mockResolvedValue(undefined);
    const req = mockReq({ params: { id: "abc" } });
    const res = mockRes();
    await getPerson(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("createPerson creates user and returns 201", async () => {
    (model.getOnePersonByUsername as jest.Mock).mockResolvedValue(null);
    (model.getOnePersonByPassword as jest.Mock).mockResolvedValue(null);
    (model.addOnePerson as jest.Mock).mockResolvedValue(mockPerson._id);

    const req = mockReq({ body: mockPerson });
    const res = mockRes();
    await createPerson(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createPerson returns 400 if username taken", async () => {
    (model.getOnePersonByUsername as jest.Mock).mockResolvedValue(mockPerson);
    const req = mockReq({ body: mockPerson });
    const res = mockRes();
    await createPerson(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updatePerson updates and returns 200", async () => {
    (model.updateOnePerson as jest.Mock).mockResolvedValue(mockPerson);
    (model.getOnePerson as jest.Mock).mockResolvedValue(mockPerson);
    const req = mockReq({ params: { id: mockPerson._id.toString() }, body: { name: "New Name" } });
    const res = mockRes();
    await updatePerson(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deletePerson deletes and returns 200", async () => {
    (model.deleteOnePerson as jest.Mock).mockResolvedValue(mockPerson);
    const req = mockReq({ params: { id: mockPerson._id.toString() } });
    const res = mockRes();
    await deletePerson(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("logout destroys session and returns 200", async () => {
    const req = mockReq();
    const res = mockRes();
    await logout(req, res);
    expect(mockSession.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("login authenticates and sets session", async () => {
    (model.getOnePersonByCredentials as jest.Mock).mockResolvedValue(mockPerson);
    const req = mockReq({ body: { username: "user1", password: "pass", role: "customer" } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).not.toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ username: mockPerson.username }));
  });
});

describe("Order Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cartController.cart["user1"] = [...mockCart];
    (SessionManager.getInstance as jest.Mock).mockReturnValue({
      getSession: jest.fn(() => mockSession),
    });
  });

  test("placeOrder creates order and clears cart", async () => {
    (model.addOneOrder as jest.Mock).mockResolvedValue(mockOrder._id);
    const req = getMockReq({ body: { totalOrderPrice: 199.98 } }) as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };

    await placeOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Order placed successfully.",
      payload: mockOrder._id,
    });
    expect(cartController.cart["user1"]).toEqual([]);
  });

  test("placeOrder returns 400 if cart is empty", async () => {
    cartController.cart["user1"] = [];
    const req = getMockReq({ body: { totalOrderPrice: 0 } }) as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };
    await placeOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getOrders returns list of user orders", async () => {
    const mockOrderCollection = {
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([mockOrder]),
      }),
    };
    (model.getAllOrders as jest.Mock).mockResolvedValue(mockOrderCollection);
    (model.getOneProduct as jest.Mock).mockResolvedValue({ productName: "Test Product" });

    const req = getMockReq() as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };
    await getOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Orders retrieved",
      payload: expect.any(Array),
    });
  });

  test("getOrders returns 500 if order collection not available", async () => {
    (model.getAllOrders as jest.Mock).mockResolvedValue(undefined);
    const req = getMockReq() as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };
    await getOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});


describe("Cart Controller", () => {
  const mockProduct = {
    _id: mockProductId,
    productName: "Test Product",
    price: 100,
    inventoryNumber: 10,
    category: "Electronics",
    sellerId: "seller123",
    available: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    inMemoryCart["user1"] = [];
    (SessionManager.getInstance as jest.Mock).mockReturnValue({
      getSession: jest.fn(() => mockSession),
    });
  });

  test("getCart returns empty cart with total 0", async () => {
    const req = getMockReq() as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };
    await getCart(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cart retrieved",
      payload: {
        items: [],
        total: 0,
      },
    });
  });

  test("addCartProduct adds new item to cart", async () => {
    (model.getOneProduct as jest.Mock).mockResolvedValue(mockProduct);
    const req = getMockReq({
      params: { productId: mockProductId },
      body: { quantity: 2 },
    }) as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };

    await addCartProduct(req, res);

    expect(inMemoryCart["user1"]).toEqual([
      { productId: mockProductId, quantity: 2 },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateCartProduct changes quantity", async () => {
    inMemoryCart["user1"] = [{ productId: mockProductId, quantity: 1 }];
    (model.getOneProduct as jest.Mock).mockResolvedValue(mockProduct);

    const req = getMockReq({
      params: { productId: mockProductId },
      body: { quantity: 3 },
    }) as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };

    await updateCartProduct(req, res);
    expect(inMemoryCart["user1"]).toEqual([
      { productId: mockProductId, quantity: 3 },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateCartProduct with quantity 0 removes the product", async () => {
    inMemoryCart["user1"] = [{ productId: mockProductId, quantity: 2 }];

    const req = getMockReq({
      params: { productId: mockProductId },
      body: { quantity: 0 },
    }) as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };

    await updateCartProduct(req, res);
    expect(inMemoryCart["user1"]).toEqual([]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteCartProduct removes the product", async () => {
    inMemoryCart["user1"] = [{ productId: mockProductId, quantity: 2 }];

    const req = getMockReq({ params: { productId: mockProductId } }) as unknown as Request;
    const { res } = getMockRes() as unknown as { res: Response };

    await deleteCartProduct(req, res);
    expect(inMemoryCart["user1"]).toEqual([]);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});


describe("Product Controller", () => {
  const mockProductId = new ObjectId().toString();
  const mockSellerId = new ObjectId().toString();
  const mockProduct = {
    _id: mockProductId,
    productName: "Laptop",
    price: 999.99,
    inventoryNumber: 10,
    category: "Electronics",
    sellerId: mockSellerId,
    available: true,
  };

  const mockSession = {
    data: {
      personId: mockSellerId,
      role: "seller",
      username: "seller1",
    },
    set: jest.fn(),
    destroy: jest.fn(),
    cookie: { toString: () => "mock_cookie" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SessionManager.getInstance as jest.Mock).mockReturnValue({
      getSession: jest.fn(() => mockSession),
    });
  });

  describe("getProduct", () => {
    it("should return product with status 200", async () => {
      (model.getOneProduct as jest.Mock).mockResolvedValue(mockProduct);
      const req = getMockReq({ params: { id: mockProductId } }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await getProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ payload: mockProduct })
      );
    });

    it("should return 404 if product not found", async () => {
      (model.getOneProduct as jest.Mock).mockResolvedValue(null);
      const req = getMockReq({ params: { id: mockProductId } }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await getProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createProduct", () => {
    it("should create product and return 201", async () => {
      (model.addOneProduct as jest.Mock).mockResolvedValue(mockProduct);
      const req = getMockReq({ body: { product: mockProduct } }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ payload: mockProduct })
      );
    });

    it("should return 400 if price is negative", async () => {
      const req = getMockReq({ body: { product: { price: -5 } } }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateProduct", () => {
    it("should update product and return 200", async () => {
      (model.updateOneProduct as jest.Mock).mockResolvedValue(mockProduct);
      const req = getMockReq({ params: { id: mockProductId }, body: mockProduct }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if product to update does not exist", async () => {
      (model.updateOneProduct as jest.Mock).mockResolvedValue(null);
      const req = getMockReq({ params: { id: mockProductId }, body: mockProduct }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product and return 200", async () => {
      (model.deleteOneProduct as jest.Mock).mockResolvedValue(mockProduct);
      const req = getMockReq({ params: { id: mockProductId } }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if product does not exist", async () => {
      (model.deleteOneProduct as jest.Mock).mockResolvedValue(null);
      const req = getMockReq({ params: { id: mockProductId } }) as unknown as Request;
      const { res } = getMockRes() as unknown as { res: Response };
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
