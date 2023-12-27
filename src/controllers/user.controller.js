import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const userRegister = asyncHandeler(async (req, res) => {
  // get user details from fronted
  // validation
  // check if user already exists
  // check for avatar
  // upload on cloudinary , avatar
  // create user object
  // remove password and refresh token from res
  // check user creation
  // return res

  const { email, phone, fullName, password } = req.body
  // console.log("email: ", email);
   
  if ([email, phone, fullName, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or phone already exists");
  }

  console.log("req.file:", req.file);


  if (!req.file || !req.file.path) {
    console.log("Invalid req.file structure:", req.file);
    throw new ApiError(400, "Avatar file is required");
  }
  
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) {
    console.log("Invalid req.file structure:", req.file);
    throw new ApiError(400, "Avatar file is required");
  }
  
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  
  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar to Cloudinary");
  }

  const user = await User.create({
    email,
    phone,
    fullName,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});


export { userRegister };
