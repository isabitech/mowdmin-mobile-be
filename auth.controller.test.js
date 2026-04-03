const authController = require("../../../src/controllers/auth.controller");
const authService = require("../../../src/services/auth.service");

jest.mock("../../../src/services/auth.service");

describe("AuthController Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("register", () => {
    it("should return 201 and success message on valid registration", async () => {
      req.body = {
        name: "John Doe",
        email: "john@example.com",
        password: "Password123!",
      };

      const mockData = {
        user: { _id: "123", name: "John Doe", email: "john@example.com" },
        accessToken: "jwt_access",
        refreshToken: "jwt_refresh",
      };

      authService.register.mockResolvedValue(mockData);

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message:
          "User Registered Successfully. Check your email for verification OTP.",
        data: mockData,
      });
    });
  });

  describe("login", () => {
    it("should return 200 and tokens on successful login", async () => {
      req.body = {
        email: "john@example.com",
        password: "Password123!",
      };

      const mockData = {
        user: { _id: "123", name: "John Doe", email: "john@example.com" },
        accessToken: "jwt_access",
        refreshToken: "jwt_refresh",
      };

      authService.login.mockResolvedValue(mockData);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Login Successful",
        data: mockData,
      });
    });

    it("should handle unauthorized error from service", async () => {
      req.body = { email: "wrong@example.com", password: "wrong" };
      const error = new Error("Invalid credentials");
      error.statusCode = 401;

      authService.login.mockRejectedValue(error);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("verifyOTP", () => {
    it("should verify email and return 200", async () => {
      req.body = { email: "john@example.com", otp: "1234" };
      authService.verifyOTP.mockResolvedValue(true);

      await authController.verifyOTP(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "success",
        message: "Email Verified Successfully",
      });
    });
  });
});
