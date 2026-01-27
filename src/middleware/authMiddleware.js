import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository.js";
import { AuthRepository } from "../repositories/AuthRepository.js";
import AuthService from "../Services/AuthService.js";
import { AppError } from "../Utils/AppError.js";

/**
 * Middleware to protect routes and ensure the user is authenticated.
 */
export const protectUser = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Auth Token is Required", 401));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists in Auth DB (Session Check)
    const tokenHash = AuthService.hashToken(token);
    const session = await AuthRepository.findByTokenHash(tokenHash);

    if (!session || session.isLoggedOut) {
      return next(new AppError("Session has ended. Please login again.", 401));
    }

    // Fetch user from DB using repository
    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401));
    }

    next(error);
  }
};

export const protectAdmin = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return next(new AppError("Admin privileges required to access this route", 403));
}
/**
 * Middleware to restrict access based on user roles.
 * Usage: authorize('admin', 'manager')
 */
// export const authorize = (...allowedRoles) => {
//   return async (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           status: 'error',
//           message: 'User not authenticated',
//         });
//       }

//       const userRoleId = req.user.role_id;

//       // Fetch role from DB
//       const dbRole = await role.findOne({ where: { id: userRoleId } });

//       if (!dbRole || !allowedRoles.includes(dbRole.name)) {
//         return res.status(403).json({
//           status: 'error',
//           message: `Role '${dbRole?.name || 'unknown'}' is not authorized to access this route`,
//         });
//       }

//       next();
//     } catch (err) {
//       return next(err);
//     }
//   };
// };
