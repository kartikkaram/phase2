import { UserRole } from "../entities/user.entities";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      username: string; 
      email?: string;   
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
