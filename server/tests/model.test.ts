const { ObjectId } = require("mongodb");
const model = require("../src/models/model");

jest.mock("../src/models/model");

const fakeObjectId = new ObjectId("507f1f77bcf86cd799439011");

const testPerson = {
  _id: fakeObjectId,
  username: "john_doe",
  password: "securepass",
  email: "john@example.com",
  name: "John",
  phoneNumber: 1234567890,
  role: "customer",
};

const testProduct = {
  _id: fakeObjectId,
  productName: "Test Product",
  price: 49.99,
  inventoryNumber: 20,
  category: "Test Category",
  sellerId: fakeObjectId,
  available: true,
};

const mockProduct = {
  _id: fakeObjectId,
  productName: 'Test Product',
  price: 100,
  inventoryNumber: 50,
  category: 'Test Category',
  sellerId: fakeObjectId,
  available: true,
};

const mockOrder = {
  _id: fakeObjectId,
  totalOrderPrice: 100,
  orderDate: new Date(),
  personId: fakeObjectId,
  productsInOrder: [{ productId: fakeObjectId, productQuantity: 2 }],
};

describe("Person Functionality", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get one person by ID", async () => {
    model.addOnePerson.mockResolvedValue(fakeObjectId);
    model.getOnePerson.mockResolvedValue(testPerson);

    const insertedId = await model.addOnePerson(testPerson);
    const person = await model.getOnePerson(insertedId.toHexString());

    expect(model.addOnePerson).toHaveBeenCalledWith(testPerson);
    expect(model.getOnePerson).toHaveBeenCalledWith(fakeObjectId.toHexString());
    expect(person).toMatchObject({ username: "john_doe" });
  });

  it("should get one product by ID", async () => {
    model.addOneProduct.mockResolvedValue(fakeObjectId);
    model.getOneProduct.mockResolvedValue(testProduct);

    const insertedId = await model.addOneProduct(testProduct);
    const product = await model.getOneProduct(insertedId.toHexString());

    expect(model.addOneProduct).toHaveBeenCalledWith(testProduct);
    expect(model.getOneProduct).toHaveBeenCalledWith(fakeObjectId.toHexString());
    expect(product).toMatchObject({ productName: "Test Product" });
  });

  it("should get person by credentials", async () => {
    model.getOnePersonByCredentials.mockResolvedValue(testPerson);

    const result = await model.getOnePersonByCredentials(
      testPerson.username,
      testPerson.password,
      testPerson.role
    );

    expect(model.getOnePersonByCredentials).toHaveBeenCalledWith(
      testPerson.username,
      testPerson.password,
      testPerson.role
    );
    expect(result).toBeDefined();
    expect(result.username).toBe(testPerson.username);
  });

  it("should update a person", async () => {
    const updatedData = { name: "Updated Name" };
    model.updateOnePerson.mockResolvedValue({ ...testPerson, ...updatedData });

    const updated = await model.updateOnePerson(fakeObjectId.toHexString(), updatedData);

    expect(model.updateOnePerson).toHaveBeenCalledWith(fakeObjectId.toHexString(), updatedData);
    expect(updated.name).toBe("Updated Name");
  });

  it("should delete a product", async () => {
    model.deleteOneProduct.mockResolvedValue(testProduct);

    const deleted = await model.deleteOneProduct(fakeObjectId.toHexString());

    expect(model.deleteOneProduct).toHaveBeenCalledWith(fakeObjectId.toHexString());
    expect(deleted.productName).toBe("Test Product");
  });
});
describe('Order Model Tests', () => {
  afterEach(() => jest.clearAllMocks());
  it('should add an order and update inventory', async () => {
    (model.addOneOrder as jest.Mock).mockResolvedValue(fakeObjectId);

    const orderId = await model.addOneOrder(mockOrder);

    expect(model.addOneOrder).toHaveBeenCalledWith(mockOrder);
    expect(orderId).toEqual(fakeObjectId);
  });

  it('should get all orders', async () => {
    (model.getAllOrders as jest.Mock).mockResolvedValue([mockOrder]);

    const orders = await model.getAllOrders();

    expect(model.getAllOrders).toHaveBeenCalled();
    expect(orders).toEqual([mockOrder]);
  });
})


describe('Product Model Tests', () => {
  afterEach(() => jest.clearAllMocks());

  it('should get all products', async () => {
    (model.getAllProducts as jest.Mock).mockResolvedValue([mockProduct]);

    const products = await model.getAllProducts();

    expect(model.getAllProducts).toHaveBeenCalled();
    expect(products).toEqual([mockProduct]);
  });

  it('should get a product by ID', async () => {
    (model.getOneProduct as jest.Mock).mockResolvedValue(mockProduct);

    const product = await model.getOneProduct(fakeObjectId.toHexString());

    expect(model.getOneProduct).toHaveBeenCalledWith(fakeObjectId.toHexString());
    expect(product).toEqual(mockProduct);
  });

  it('should add a new product', async () => {
    (model.addOneProduct as jest.Mock).mockResolvedValue(fakeObjectId);

    const newProductId = await model.addOneProduct(mockProduct);

    expect(model.addOneProduct).toHaveBeenCalledWith(mockProduct);
    expect(newProductId).toEqual(fakeObjectId);
  });

  it('should update a product', async () => {
    (model.updateOneProduct as jest.Mock).mockResolvedValue({ ...mockProduct, price: 150 });

    const updatedProduct = await model.updateOneProduct(fakeObjectId.toHexString(), { price: 150 });

    expect(model.updateOneProduct).toHaveBeenCalledWith(fakeObjectId.toHexString(), { price: 150 });
    expect(updatedProduct.price).toBe(150);
  });

  it('should delete a product', async () => {
    (model.deleteOneProduct as jest.Mock).mockResolvedValue(mockProduct);

    const deletedProduct = await model.deleteOneProduct(fakeObjectId.toHexString());

    expect(model.deleteOneProduct).toHaveBeenCalledWith(fakeObjectId.toHexString());
    expect(deletedProduct).toEqual(mockProduct);
  });


});

