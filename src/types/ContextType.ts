import { Request, Response } from "express"

export default interface ContextType {
	req: Request
	res: Response
	user: {
		id: string | null
		isAuthenticated: boolean
	}
}
