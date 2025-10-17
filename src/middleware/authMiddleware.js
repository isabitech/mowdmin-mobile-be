import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";

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
      return res.status(401).json({
        status: "error",
        message: "Auth Token is Required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User no longer exists",
      });
    }

    // if (!user.isActive) {
    //   return res.status(401).json({
    //     status: "error",
    //     message: "User account is deactivated",
    //   });
    // }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    next(error);
  }
};


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
