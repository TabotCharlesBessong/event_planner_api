// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import User, { UserRole } from "../models/user.model";
import { sendEmail } from "../utils/email";

// Generate JWT token
const generateToken = (id: number): string => {
  // @ts-ignore
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Generate reset token
const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString("hex");
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || UserRole.CLIENT,
      isVerified: false
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: ["id", "name", "email", "role"],
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify/:token
// @access  Public
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    // Update user
    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verify user error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid verification token",
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpire;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please make a PUT request to:</p>
      <p>${resetUrl}</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
      });

      res.status(200).json({
        success: true,
        message: "Email sent",
      });
    } catch (error) {
      // Reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Find user
    const user = await User.findOne({
      where: {
        resetPasswordToken: resetToken,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
