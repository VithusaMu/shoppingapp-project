/**
 * Import required modules from Express and the model file.
 * - Request and Response are types from Express used for handling HTTP requests and responses.
 */
import { Request, Response } from "express";
import { getOnePerson, addOnePerson, updateOnePerson, deleteOnePerson, Person, getOnePersonByCredentials, getOnePersonByUsername,
	getOnePersonByPassword, } from "../models/model";
import SessionManager from "../auth/SessionManager";

/**
 * Handles the root route.
 * Responds with the login page
 */
export const login = async (req: Request, res: Response) => {
	const { username, password, role } = req.body
	try {
		const user = await getOnePersonByCredentials(username, password, role)
		if (user) {
			const sessionManager = SessionManager.getInstance();
			const session = sessionManager.createSession();

			session.set("username", user.username);
			session.set("role", user.role);
			session.set("personId", user._id.toString());

			res.setHeader("Set-Cookie", session.cookie.toString());
			const { password: _, ...userWithoutPassword } = user;
      		res.json({
       		 message: `Welcome ${user.name}!`,
        	...userWithoutPassword // Include all user properties
      });
		}
		else {
			res.status(401).json({ error: "Invalid credentials" });
		}
	}
	catch (error) {
		console.error("Error logging in:", error);
		res.status(500).json({
			message: "Internal server error",
		});
	}
};

export const getSession = async (req: Request, res: Response) => {
	const session = SessionManager.getInstance().getSession(req);
	if (!session) {
		return res.status(401).json({ message: "No active session" });
	}

	return res.status(200).json({
		personId: session.data.personId,
		role: session.data.role,
		username: session.data.username,
	});
};



export const getHome = async (req: Request, res: Response) => {
	res.status(200).json({message:"Hello from the shopping app"});
}


/**
 * Handles GET requests to /person/:id
 * Fetches a single Person by its ID.
 */
export const getPerson = async (req: Request, res: Response) => {
	console.log("in the getPerson");
	const personId = req.params.id; 
	console.log(personId)

	try {
		const person = await getOnePerson(personId); 
		if (person) {
			res.status(200).json({
				message: "Person Found",
				payload: person,
			});
		} else {
			res.status(404).json({
				message: "Person does not exist",
			});
		}
	} catch (error) {
		console.error("Error getting one Person:", error);
		res.status(500).json({
			message: "Internal server error",
		});
	}
};

/**
 * POST /person - Adds a new Person to the database.
 */
export const createPerson = async (req: Request, res: Response) => {
	const newPerson = req.body;

	try {
		if (!isValidPersonProps(newPerson)) {
			return res.status(400).json({ message: "Invalid person input" });
		}

		const { username, password, phoneNumber, role } = newPerson;

		const existingUser = await getOnePersonByUsername(username);
		if (existingUser) {
			return res.status(400).json({ message: "Username already exists." });
		}
		
		const existingPassword = await getOnePersonByPassword(password);
		if (existingPassword) {
			return res.status(400).json({ message: "Password already in use." });
		}

		if (!/^\d{10}$/.test(phoneNumber.toString())) {
			return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
		}

			
		if (!["customer", "seller"].includes(role.toLowerCase())) {
			return res.status(400).json({ message: "Role must be 'customer' or 'seller'" });
		}
		
		const createdPersonId = await addOnePerson(newPerson);
		if (createdPersonId) {
			const session = SessionManager.getInstance().createSession();
			session.set("username", newPerson.username);
			session.set("role", newPerson.role);
			session.set("personId", createdPersonId.toString());

			res.setHeader("Set-Cookie", session.cookie.toString());
			res.status(201).json({
				message: "Person has been created",
				payload: createdPersonId,
			});
		} else {
			res.status(400).json({
				message: "Person cannot be created",
			});
		}

	} catch (error) {
		console.error("Error creating Person:", error);
		res.status(500).json({
			message: "Internal server error",
		});
	}
};


/**
 * PUT /person/:id - Updates an existing Person by its ID.
 */
export const updatePerson = async (req: Request, res: Response) => {
	const personId = req.params.id
	const updatedData = req.body;
	try {
		const updatedPerson = await updateOnePerson(personId, updatedData)
		if (updatedPerson) {
			const fullPerson = await getOnePerson(personId);
			if (!fullPerson) {
				return res.status(404).json({ message: "Person not found after update" });
			}

			const { password: _, ...userWithoutPassword } = fullPerson;
			return res.status(200).json(userWithoutPassword);
		} else {
			res.status(404).json({
				message: "Person to update does not exist",
			});
		}
	} catch (error) {
		console.error("Error updating Person:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

/**
 * DELETE /person/:id - Deletes a Person from the database by its ID.
 */
export const deletePerson = async (req: Request, res: Response) => {
	const personId = req.params.id
	try {
		const deletedPerson = await deleteOnePerson(personId)
		if (deletedPerson) {
			res.status(200).json({
				message: "Person has been deleted",
				payload: deletedPerson,
			});
		} else {
			res.status(404).json({
				message: "Person to delete does not exist",
			});
		}
	} catch (error) {
		console.error("Error deleting Person:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const logout = async (req: Request, res: Response) => {
  const sessionManager = SessionManager.getInstance();
  const session = sessionManager.getSession(req);
  
  if (session) {
    session.destroy();
    res.setHeader("Set-Cookie", session.cookie.toString());
    res.status(200).json({ message: "Logged out successfully" });
  } else {
    res.status(200).json({ message: "No active session to logout" });
  }
};

const isValidPersonProps = (props: any): props is Person => {
	return (
		typeof props.username === "string" &&
		typeof props.password === "string" &&
		typeof props.email === "string" &&
		typeof props.name === "string" &&
		typeof props.phoneNumber === "number" &&
		["customer", "seller"].includes(props.role)
	);
};
