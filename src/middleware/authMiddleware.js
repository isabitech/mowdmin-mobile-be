import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import user from '../models/user.js';
import role from '../models/role.js';

/**
 * Middleware to protect routes and ensure the user is authenticated.
 */
export const protectUser = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      const User = await user.findByPk(decoded.id);

      if (!User) {
        return res.status(401).json({
          status: 'error',
          message: 'User no longer exists',
        });
      }

      if (!User.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account is deactivated',
        });
      }

      // Attach user to request object
      req.user = User;
      next();
    } catch (error) {
      // Handle expired or invalid token
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token has expired',
        });
      }

      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid or expired',
        data: error,
      });
    }
  } catch (error) {
    // Pass unexpected errors to global error handler
    next(error);
  }
};

/**
 * Middleware to restrict access based on user roles.
 * Usage: authorize('admin', 'manager')
 */
export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
      }

      const userRoleId = req.user.role_id;

      // Fetch role from DB
      const dbRole = await role.findOne({ where: { id: userRoleId } });

      if (!dbRole || !allowedRoles.includes(dbRole.name)) {
        return res.status(403).json({
          status: 'error',
          message: `Role '${dbRole?.name || 'unknown'}' is not authorized to access this route`,
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Authorization failed',
        error: err.message,
      });
    }
  };
};
