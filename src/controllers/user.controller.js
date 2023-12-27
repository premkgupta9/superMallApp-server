import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandeler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const userRegister = asyncHandeler(async (req, res) => {
  const { email, phone, fullName, password } = req.body;

  if (
    [email, phone, fullName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existedUser) {
    throw new ApiError(400, "User with email or phone already exists");
  }

  try {
    const user = await User.create({
      email,
      phone,
      fullName,
      password,
      avatar: {
        public_id: email,
        secure_url: "avatar.img.url",
      },
    });

    console.log("req.file:", req.file);

    if (req.file) {
      const localPath = req.file.avatar;
      const avatar = await uploadOnCloudinary(localPath);
      user.avatar = avatar?.url;
    }

    await user.save();
    user.password = undefined;
    user.refreshToken = undefined;

    res
      .status(201)
      .json(new ApiResponse(201, user, "User registered successfully"));
  } catch (error) {
    console.error("Error during user registration:", error);
    throw new ApiError(400, "Error during user registration");
  }
});

export { userRegister };
