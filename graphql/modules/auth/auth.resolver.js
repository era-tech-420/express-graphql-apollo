const { ValidationError } = require("apollo-server-express");
const User = require("../../../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { storeFile, deleteFile } = require("../../../helpers");

// signup
const signUpMutation = async (parent, args, context, info) => {
  const { name, email, password } = args;
  const already_exsist = await User.findOne({ email });
  if (already_exsist) {
    throw new ValidationError("Email already exists");
  }
  const hashed_password = await argon2.hash(password);
  const user = await User.create({
    name,
    email,
    password: hashed_password,
  });
  return user;
};

// login
const loginMutation = async (parent, args, context, info) => {
  const { email, password } = args;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ValidationError("Invalid email given");
  }

  if (!(await argon2.verify(user.password, password))) {
    throw new ValidationError("Invalid password given!");
  }
  const token = jwt.sign(
    { data: { userId: user._id, email } },
    "my super secret",
    { expiresIn: "48h" }
  );
  return {
    user,
    token,
  };
};

// updateProfile
const updateProfileMutation = async (parent, args, context, info) => {
  const update_date = {};
  let auth_user = context.auth_user;

  if (args.name) {
    update_date["name"] = args.name;
  }

  if (args.profile_picture) {
    const fileObject = await args.profile_picture;

    const { filePath } = await storeFile(fileObject);

    filePath && deleteFile(auth_user.profile_picture);

    update_date["profile_picture"] = filePath;
  }

  let updated_user = Object.keys(update_date).length
    ? await User.findByIdAndUpdate(auth_user._id, update_date, {
        new: true,
      })
    : auth_user;

  return updated_user;
};

// meQuery
const meQuery = (parents, args, context, info) => {
  return context.auth_user;
};

const resolver = {
  Query: {
    me: meQuery,
  },
  Mutation: {
    signup: signUpMutation,
    login: loginMutation,
    updateProfile: updateProfileMutation,
  },
};

module.exports = {
  resolver,
};
