const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const sendEmail = require("../utils/sendEmail")
const crypto = require('crypto');

// Register User 

exports.registerUser = catchAsyncErrors(async (req, resp, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name, email, password,
    avatar: {
      public_id: 'This is a sample id',
      url: "profilePicUrl"
    }
  });

  const token = user.getJWTToken()

  sendToken(user, 201, resp)
});



// Login User 
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res);
});


// Logout User 
exports.logoutUser = catchAsyncErrors(async (req, resp, next) => {
  resp.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  resp.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, resp, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404))
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false })

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message
    });
    resp.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully.`
    })
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false })

    return next(new ErrorHandler(error.message, 500))
  }
});


// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, resp, next) => {
  const user = await User.findById(req.user.id);

  resp.status(200).json({
    success: true,
    user,
  });
});

// Update User Password
exports.updatePassword = catchAsyncErrors(async (req, resp, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("New Password and Confirm Password is not matched.", 400));
  }

  user.password = req.body.newPassword;
  await user.save()

  sendToken(user, 200, resp)
});


// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, resp, next) => {

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }

  // NB: we will add cloudinary later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  resp.status(200).json({
    success: true
  })
});


// Get All Users (Admin)
exports.getAllUsers = catchAsyncErrors(async (req, resp, next) => {
  const users = await User.find();
  resp.status(200).json({
    success: true,
    users
  });
});



// Get Single Users (Admin)
exports.getSingleUsers = catchAsyncErrors(async (req, resp, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id: ${req.params.id}`))
  }

  resp.status(200).json({
    success: true,
    user
  });
});



// Update User Role(Admin)
exports.updateUserRole = catchAsyncErrors(async (req, resp, next) => {

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });
  
  resp.status(200).json({
    success: true,
    message:"User Updated Successfully."
  });
});


// Delete User(Admin)
exports.deleteUser = catchAsyncErrors(async (req, resp, next) => {

  //  We will remove cloudinary
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorHandler(`User does not exist with id: ${req.params.id}`))
  }

  await user.remove()

  resp.status(200).json({
    success: true,
    "message": "User deleted successfylly."
  });
});