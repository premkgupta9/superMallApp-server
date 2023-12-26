import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const userRegister = asyncHandler(async (req, res) => {
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
    
    if (
        [email, phone, fullName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedUser) {
   throw new ApiError("user with email or phone is already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
     throw new ApiError(400, "Avatar file is required");
    }

  const user = await User.create({
    email,
    phone,
    fullName,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
     throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));

});

export { userRegister };
