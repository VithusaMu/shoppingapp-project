import { Collection, ObjectId, MongoClient, MongoError } from "mongodb";

// Database connection parameters
const DATABASE_NAME = "shoppingdatabase";
let personCollection: Collection<Person> | undefined;
let productCollection: Collection<Product> | undefined;
let orderCollection: Collection<Order> | undefined;
let client: MongoClient;

export interface Person {
   _id: ObjectId,
    username: string,
    password: string,
    email: string,
    name: string,
    phoneNumber: number,
    role: "customer" | "seller"
}

export interface Product {
    _id: ObjectId,
    productName: string,
    price: number,
    inventoryNumber: number,
    category: string,
    sellerId: ObjectId, // reference to Person
    pictureURL?: string,
    available?: boolean
}

export interface Order {
    _id: ObjectId,
    totalOrderPrice: number,
    orderDate: Date,
    personId: ObjectId, // reference to Person
    productsInOrder: {
        productId: ObjectId,
        productQuantity: number,
    }[];
}

export let starter_person_records: Person[] = [
    {
        _id: new ObjectId(),
        username: "ahmed",
        password: "web",
        email: "ahmed@gmail.com",
        name: "ahmed",
        phoneNumber: 1234567890,
        role: "customer"
    },
    {
        _id: new ObjectId(),
        username: "vithusa",
        password: "web1",
        email: "vithusa@gmail.com",
        name: "vithusa",
        phoneNumber: 9876543210,
        role: "seller"
    },
];
// Add this to your model.ts file

export let starter_product_records: Product[] = [
  {
    _id: new ObjectId(),
    productName: "Smartphone XS Pro",
    price: 899.99,
    inventoryNumber: 25,
    category: "Electronics",
    sellerId: starter_person_records[1]._id, // Vithusa is the seller (index 1)
    pictureURL: "https://img.global.news.samsung.com/global/wp-content/uploads/2024/03/Galaxy-A55-5G-and-A35-5G_main1.jpg",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Wireless Headphones",
    price: 149.99,
    inventoryNumber: 40,
    category: "Electronics",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://media.istockphoto.com/id/1412240771/photo/headphones-on-white-background.jpg?s=612x612&w=0&k=20&c=DwpnlOcMzclX8zJDKOMSqcXdc1E7gyGYgfX5Xr753aQ=",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Running Shoes",
    price: 79.99,
    inventoryNumber: 15,
    category: "Clothing",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://media.istockphoto.com/id/1249496770/photo/running-shoes.jpg?s=612x612&w=0&k=20&c=b4MahNlk4LH6H1ksJApfnlQ5ZPM3KGhI5i_yqhGD9c4=",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Coffee Maker",
    price: 59.99,
    inventoryNumber: 12,
    category: "Home Appliances",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://www.shutterstock.com/image-photo/coffee-machine-260nw-515388751.jpg",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Leather Wallet",
    price: 39.99,
    inventoryNumber: 30,
    category: "Accessories",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://images.unsplash.com/photo-1624538000860-24716b9050f2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdhbGxldHxlbnwwfHwwfHx8MA%3D%3D",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Smartwatch",
    price: 249.99,
    inventoryNumber: 18,
    category: "Electronics",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://media.istockphoto.com/id/486993228/photo/smart-watch.jpg?s=612x612&w=0&k=20&c=dVKA7YSTjnhzYAoYcxDwGEuV18QV-K-YuZCABnjt8pE=",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Desk Lamp",
    price: 29.99,
    inventoryNumber: 22,
    category: "Home Decor",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://media.istockphoto.com/id/1398642201/photo/desk-lamp.jpg?s=612x612&w=0&k=20&c=1zMwXliVyBhhBbrwcMZqCoLrfyC8WabaIXZmiLaat5E=",
    available: true
  },
  {
    _id: new ObjectId(),
    productName: "Backpack",
    price: 49.99,
    inventoryNumber: 35,
    category: "Accessories",
    sellerId: starter_person_records[1]._id,
    pictureURL: "https://media.istockphoto.com/id/1141208525/photo/yellow-open-backpack.jpg?s=612x612&w=0&k=20&c=k0NOqN9FnIGdkaUNx6-fMIBG2IfWwLT_AbDVefqJT_0=",
    available: true
  }
];
/**
 * Initializes the connection to the shopping database.
 */
export async function initDB() {
	try {
        console.log("DB ENV:", {
            MONGO_USER: process.env.MONGO_USER,
            MONGO_PWD: process.env.MONGO_PWD,
            MONGO_HOST: process.env.MONGO_HOST,
          });

          const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/`;
          // Initialize MongoDB client
        console.log("Attempting to connect to MongoDB with URL:", url);
        client = new MongoClient(url!);
        await client.connect();
        console.log("Connected to MongoDb");
        
        const db = client.db(DATABASE_NAME);

		// Get the list of existing collections in the database
		const collections = await db.listCollections().toArray();
		const collectionNames = collections.map((col) => col.name);
        

		// Create "person" collection if it does not exist
		if (!collectionNames.includes("person")) {
			console.log('Creating "person" collection...');
			await db.createCollection("person");
		}

		// Reference to the "person" collection
		personCollection = db.collection("person");      
        
        // Create "product" collection if it does not exist
		if (!collectionNames.includes("product")) {
			console.log('Creating "product" collection...');
			await db.createCollection("product");
		}

		// Reference to the "product" collection
		productCollection = db.collection("product");       


        // Create "order" collection if it does not exist
		if (!collectionNames.includes("order")) {
			console.log('Creating "order" collection...');
			await db.createCollection("order");
		}

		// Reference to the "order" collection
		orderCollection = db.collection("order");  
        let databasepeople;

        const userCount = await personCollection.countDocuments();
        if (userCount === 0) {
            console.log("Inserting initial persons...");
            databasepeople = await personCollection.insertMany(starter_person_records);
            console.log(databasepeople);
        }
    const productCount = await productCollection.countDocuments();
    if (productCount === 0) {
      console.log("Inserting initial products...");
      const databaseProducts = await productCollection.insertMany(starter_product_records);
      console.log(databaseProducts);
    }
        


    } catch (err) {
        if (err instanceof MongoError) {
            console.error("MongoDB connection failed:", err.message);
            throw err;
        } else {
            console.error("Unexpected error:", err);
            throw err;
        }
    }
}

/**
 * Retrieves all Product records from the database.
 * @returns The collection of Product objects or undefined if not initialized.
 */
export async function getAllProducts(): Promise<Collection<Product> | undefined> {
	return productCollection;
}

/**
 * Retrieves all Order records from the database.
 * @returns The collection of Order objects or undefined if not initialized.
 */
export async function getAllOrders(): Promise<Collection<Order> | undefined> {
	return orderCollection;
}


/**
 * Retrieves all Person records from the database.
 * @returns The collection of Person objects or undefined if not initialized.
 */
export async function getAllPeople(): Promise<Collection<Person> | undefined> {
	return personCollection;
}

/**
 * Retrieves a single Person by its unique ID.
 * @param id - The ID of the Person to retrieve.
 * @returns The Person object if found, otherwise undefined.
 */
export async function getOnePerson(id: string): Promise<Person | undefined> {
	return await personCollection?.findOne({ _id: new ObjectId(id) }) || undefined;
}


/**
 * Retrieves a single Person by its username and password.
 * @param username - The username of the Person to retrieve.
 * @param password - The password of the Person to retrieve.
 * @returns The Person object if found, otherwise undefined.
 */
export async function getOnePersonByCredentials(username: string, password: string, role: "customer" | "seller"): Promise<Person | undefined> {
	return await personCollection?.findOne({ username, password, role }) || undefined;
}

/**
 * Retrieves a single Product by its unique ID.
 * @param id - The ID of the Product to retrieve.
 * @returns The Product object if found, otherwise undefined.
 */
export async function getOneProduct(id: string): Promise<Product | undefined> {
	return await productCollection?.findOne({ _id: new ObjectId(id) }) || undefined;
}


/**
 * Adds a new Person to the database.
 * @param person - The Person object to add.
 */
export async function addOnePerson(person: Person) {
	const createdPerson = await personCollection?.insertOne(person);
	console.log(createdPerson)
	return createdPerson?.insertedId!;
}

/**
 * Adds a new Product to the database.
 * @param product - The Product object to add.
 */
export async function addOneProduct(product: Product) {
	const createdProduct = await productCollection?.insertOne(product);
	console.log(createdProduct)
	return createdProduct?.insertedId!;
}

/**
 * Adds a new Order to the database.
 * Updates inventory number of products ordered.
 * @param order - The Order object to add.
 */
export async function addOneOrder(order: Order) {
    const productPromises: Promise<void>[] = []

    for (const item of order.productsInOrder) {
        const product = await productCollection?.findOne({ _id: item.productId });

        if (!product) {
            return undefined; // product may not be found
        }

        if (!product.available) {
            return undefined; // product has no stock
        }

        const newInventoryNumber = product.inventoryNumber - item.productQuantity
        if (newInventoryNumber < 0) {
            return undefined; // product quantity is higher than the inventory number
        }

        await updateOneProduct(item.productId.toHexString(), { inventoryNumber: newInventoryNumber })
    }

	const createdOrder = await orderCollection?.insertOne(order);
	console.log(createdOrder)
	return createdOrder?.insertedId!;
}

/**
 * Updates an existing Person in the database.
 *
 * @param {string} personId - The ID of the Person to update.
 * @param {Partial<Person>} updatedData - An object containing the fields to update.
 * @returns {Promise<Person | undefined>} - The updated Person object if found, otherwise undefined.
 *
 * This function:
 * - Searches for a Person by its ID.
 * - Updates only the specified fields using MongoDB's `$set` operator.
 * - Returns the updated Person document after modification.
 */
export async function updateOnePerson(
	personId: string,
	updatedData: Partial<Person>,
): Promise<Person | undefined> {
	const updatedPerson = await personCollection?.findOneAndUpdate({ _id: new ObjectId(personId) }, {$set: updatedData}, {returnDocument: "after"});
    if (!updatedPerson?.value) {
		return undefined;
	}
	return updatedPerson?.value!
}

/**
 * Updates an existing Product in the database.
 *
 * @param {string} productId - The ID of the Product to update.
 * @param {Partial<Product>} updatedData - An object containing the fields to update.
 * @returns {Promise<Product | undefined>} - The updated Product object if found, otherwise undefined.
 *
 * This function:
 * - Searches for a Product by its ID.
 * - Updates only the specified fields using MongoDB's `$set` operator.
 * - Returns the updated Product document after modification.
 */
export async function updateOneProduct(
	productId: string,
	updatedData: Partial<Product>,
): Promise<Product | undefined> {


    if (typeof updatedData.inventoryNumber === "number") {
		updatedData.available = updatedData.inventoryNumber > 0;
	}

	const updatedProduct = await productCollection?.findOneAndUpdate({ _id: new ObjectId(productId) }, {$set: updatedData}, {returnDocument: "after"});


	return updatedProduct?.value!
}

/**
 * Deletes a new Person to the database.
 * If person is a seller, all their products will be deleted too.
 * If person is a customer, all their orders will be deleted too.
 *  @param personId - The ID of the Person to delete.
 */
export async function deleteOnePerson(personId: string) {
  const person = await getOnePerson(personId);
  if (!person) return undefined;
  console.log(person)

  if (person.role === "customer") {
    await orderCollection?.deleteMany({ personId: new ObjectId(personId) });
  }

  if (person.role === "seller") {
    await productCollection?.deleteMany({ sellerId: new ObjectId(personId) });
  }

  const result = await personCollection?.deleteOne({ _id: new ObjectId(personId) });
  return result?.acknowledged ? person : undefined; 
}

/**
 * Deletes a new Product to the database.
 *  @param productId - The ID of the Product to delete.
 */
export async function deleteOneProduct(productId: string) {
	const deletedProduct = await productCollection?.findOneAndDelete({ _id: new ObjectId(productId) });
    return deletedProduct?.value || undefined;
}


/**
 * Checks if a user with the given username exists.
 */
export async function getOnePersonByUsername(username: string): Promise<Person | undefined> {
	return await personCollection?.findOne({ username }) || undefined;
}

/**
 * Checks if a password is already used by another user.
 */
export async function getOnePersonByPassword(password: string): Promise<Person | undefined> {
	return await personCollection?.findOne({ password }) || undefined;
}

