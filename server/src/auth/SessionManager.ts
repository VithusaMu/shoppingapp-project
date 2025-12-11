import crypto from "crypto";
import Session from "./Session";
import Cookie from "./Cookie";
import { Request, Response } from "express";

/**
 * The SessionManager class is a singleton that manages all sessions
 * by creating new sessions and removing expired sessions.
 */
export default class SessionManager {
	private static instance: SessionManager;
	sessions: Session[];
	cleanUp: NodeJS.Timeout;

	private constructor() {
		this.sessions = [];

		// Run clean up every second.
		this.cleanUp = setInterval(this.cleanUpSessions, 1000);
	}

	/**
	 * 
	 * If no instance of the SessionManager exists, a new instance is created.
	 * @returns The singleton instance of the SessionManager.
	 */
	static getInstance = (): SessionManager => {
		if (!SessionManager.instance) {
			SessionManager.instance = new SessionManager();
		}

		return SessionManager.instance;
	};

	/**
	 * Creates a new session and adds it to the sessions array.
	 * The session ID is a random 4-character hex string.
	 * @returns A new session.
	 */
	createSession() {
		const sessionId = crypto.randomBytes(2).toString("hex");
		const session = new Session(sessionId);

		this.sessions.push(session);

		return session;
	}

	/**
	 * Searches for a session with the given sessionId.
	 * Uses linear search to find the session which
	 * isn't the most efficient way to find something,
	 * but it's good enough for this assignment.
	 * @returns The session with the given sessionId.
	 */
	get(sessionId: string) {
		return this.sessions.find((session) => session.id === sessionId);
	}

	/**
	 * Removes all expired sessions from the sessions array.
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
	 */
	cleanUpSessions() {
		this.sessions = this.sessions?.filter(
			(session) => !session.isExpired(),
		);
	}

	stopCleanUp() {
		process.nextTick(clearInterval, this.cleanUp);
	}

	/**
	 * @returns The cookies of the request as a Record type object.
	 * @example name=Pikachu;type=Electric => [{ name: "name", value: "Pikachu" }, { name: "type", value: "Electric" }]
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie
	 * @see https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type
	 */
	getCookies = (req: Request): Cookie[] => {
		const cookieHeader = req.headers.cookie;
		const cookies: Cookie[] = [];

		if (cookieHeader) {
			cookieHeader.split(';').forEach((cookie) => {
				const [name, value] = cookie.split('=');
				cookies.push(new Cookie(name.trim(), value.trim()));
			});
		}

		return cookies;
	};

	findCookie = (req: Request, name: string) => {
		const cookies = this.getCookies(req)
		return cookies.find((cookie) => cookie.name === name);
	};

	getSession = (req: Request): Session | undefined => {
		const cookies = this.getCookies(req)
		const sessionId = this.findCookie(req, 'session_id')?.value;
		let session: Session | undefined;

		if (sessionId) {
			session = SessionManager.getInstance().get(sessionId);
		}

		if (!session) {
			session = SessionManager.getInstance().createSession();
			cookies.push(session.cookie);
		}

		return session;
	};
}
