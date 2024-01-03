import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const userRegister = asyncHandler(async (req, res) => {
  const { email, phone, fullName, password } = req.body;

  if ([email, phone, fullName, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or phone already exists");
  }

  console.log(req.file);

  const avatarLocalPath = req.file?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  const user = await User.create({
    email,
    phone,
    fullName,
    password,
    avatar: avatar?.url || "",
  });    

  // If user not created send message response
  if (!user) {
   throw new ApiError(400,'User registration failed, please try again later')
  }
  
    await user.save();
    user.password = undefined;
    user.refreshToken = undefined;

    res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
 
});

export { userRegister };

