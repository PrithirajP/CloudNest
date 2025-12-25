import catchAsync from "express-async-handler";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { USER_TOKEN, cookieOptions } from "../constants/options.js";
import { uploadFilesToCloudinary } from "../utils/features.js";

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import redisCache from "../config/DB/redis.config.js";

const signUp = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const file = req.file;
  if (!file) return next(new ApiError("Please Upload Avatar", 400));

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(
      new ApiError("User with this email already exists, Try another email", 400)
    );
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    isVerified: true, // force-verified so email verification is disabled
  });

  const result = await uploadFilesToCloudinary([file]);
  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  user.avatar = avatar;
  await user.save();

  const token = user.generateToken();

  res.status(201).cookie(USER_TOKEN, token, cookieOptions).json({
    status: "success",
    message: "User created successfully",
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email }).select("+password");
  if (!userExists) {
    return next(new ApiError("User does not exist. Please sign up first.", 400));
  }

  const isValidPassword = await userExists.matchPassword(password);
  if (!isValidPassword) {
    return next(new ApiError("Invalid Credentials, Try again", 400));
  }

  // removed email verification gate — users can log in immediately
  redisCache.del("/api/v1/auth/me", () => {});

  const token = userExists.generateToken();

  res.status(200).cookie(USER_TOKEN, token, cookieOptions).json({
    status: "success",
    message: "User Logged in successfully",
  });
});

const challengeStore = {};

const twoFactorAuth = catchAsync(async (req, res, next) => {
  const { _id, firstName, lastName } = req.user;

  const challengePayload = await generateRegistrationOptions({
    rpID: "localhost",
    rpName: "File Management System",
    userName: firstName + lastName,
  });
  challengeStore[_id] = challengePayload.challenge;

  return res.json({
    status: "success",
    challengePayload,
    message: "Two Factor Authentication Successfully",
  });
});

const verifyTwoFactorAuth = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { credentials } = req.body;
  const challenge = challengeStore[_id];

  const verifiedChallenge = await verifyRegistrationResponse({
    expectedChallenge: challenge,
    expectedOrigin: "http://localhost:5173",
    expectedRPID: "localhost",
    response: credentials,
  });

  if (!verifiedChallenge.verified) {
    return next(new ApiError("Could not verify", 400));
  }
  console.log(verifiedChallenge.registrationInfo);

  return res.json({
    status: "success",
    verified: true,
    message: "Two Factor Authentication Verified",
  });
});

const getMyProfile = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.json({
    status: "success",
    user,
    message: "Profile Fetch Successfully",
  });
});

const logout = catchAsync(async (req, res, next) => {
  redisCache.del("/api/v1/auth/me", (err) => {
    if (err) console.error(err);
  });

  res.clearCookie(USER_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "PRODUCTION",
    sameSite: "none",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

export {
  signUp,
  login,
  logout,
  getMyProfile,
  twoFactorAuth,
  verifyTwoFactorAuth,
};
