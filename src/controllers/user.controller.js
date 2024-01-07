import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
<<<<<<< HEAD
import asyncHandler from "../utils/asyncHandler.js";
=======
import { asyncHandler } from "../utils/asyncHandler.js";
>>>>>>> 32f14510a85c19fde6992a2b7e96336fea008008
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

<<<<<<< HEAD
const userRegister = asyncHandler(async (req, res, next) => {
  // get user details from fronted
  // validation
  // check if user already exists
  // check for avatar
  // upload on cloudinary , avatar
  // create user object
  // remove password and refresh token from res
  // check user creation
  // return res
=======
const generateAccessAndRefereshTokens = async(userId) => {
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken() 

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}

  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const userRegister = asyncHandler(async (req, res) => {
  const { email, phone, fullName, password, role } = req.body;
>>>>>>> 32f14510a85c19fde6992a2b7e96336fea008008

  const { email, phone, fullName, password } = req.body;
  // console.log("email: ", email);

  if (!email || !phone || !fullName || !password) {
    return next(new ApiError(400, "All fields are required"));
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedUser) {
    return next(new ApiError("user with email or phone is already exist,"));
  }

<<<<<<< HEAD
  const avatarLocalPath = req.files?.avatar[0]?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
=======
  // console.log(req.file);
  const avatarLocalPath = req.file?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath)
>>>>>>> 32f14510a85c19fde6992a2b7e96336fea008008

  const user = await User.create({
    email,
    phone,
    fullName,
    password,
<<<<<<< HEAD
    avatar: {
      public_id: email,
      secure_url: "img.url",
    },
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return next(
      new ApiError(500, "Something went wrong while registering the user")
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});

export { userRegister };
=======
    role,
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

const userLogin = asyncHandler(async(req, res) => {
      const { email , phone, password } = req.body

      if (!email && !phone) {
        throw new ApiError(400, "email or phone is required")
      }
  
     const user = await User.findOne({
        $or: [{email}, {phone}]
      })

      if (!user) {
        throw new ApiError(404,"User does not exist" )
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
      throw new ApiError(401,"Password is wrong" )
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const adminLogin = asyncHandler(async(req, res) => {
  const { email , phone, password } = req.body

  if (!email && !phone) {
    throw new ApiError(400, "email or phone is required")
  }

 const user = await User.findOne({
    $or: [{email}, {phone}]
  })

  if (!user) {
    throw new ApiError(404,"User does not exist" )
}
if (user.role === "USER") {
  throw new ApiError(400, "you are not allowed")
}
const isPasswordCorrect = await user.isPasswordCorrect(password)

if (!isPasswordCorrect) {
  throw new ApiError(401,"Password is wrong" )
}

const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200, 
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)
})

const logout = asyncHandler( async(req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
            refreshToken: undefined
        }
    },
    {
        new: true
    }
)

const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")   
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

const changePassword = asyncHandler( async(req, res) =>{
  const {oldPassword, newPassword} = req.body

 const user = await User.findById(req.user?._id)
 const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

 if (!isPasswordCorrect) {
  throw new ApiError(400, "Invalid old password")
 }

 user.password = newPassword
 await user.save({validateBeforeSave: false})

 return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getUser = asyncHandler( async( req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
})

 const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select("-refreshToken");

  if (!user) {
      throw new ApiError(404, "User does not exist");
  }

  const existingUser = await User.findOne({
      $or: [
          { email: req.body?.email },
          { phone: req.body?.phone }
          
      ]
  });

  if (existingUser) {
      if (existingUser.email === req.body?.email) {
          throw new ApiError(400, "Email is already in use");
      }
      if (existingUser.phone === req.body?.phone) {
          throw new ApiError(400, "phone is already in use");
      }
  }

  for (const key in req.body) {
      user[key] = req.body[key];
  }
 
  const updatedUser = await user.save();
  res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
})

export { 
  userRegister,
  adminLogin,
  userLogin,
  logout,
  refreshAccessToken,
  changePassword,
  getUser,
  updateProfile
};

>>>>>>> 32f14510a85c19fde6992a2b7e96336fea008008
