import { Request, Response } from "express"
import { IUser, Role, Status, User } from "../model/user"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../util/tokens";
import { AuthRequest } from "../middleware/auth"

export const register = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, role } = req.body

    if (!firstname || !lastname || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (role !== Role.USER && role !== Role.AUTHOR && role !== Role.ADMIN) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email alrady registered" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const approvalStatus =
      role === Role.AUTHOR ? Status.PENDING : Status.APPROVED

    const newUser = new User({
      firstname, 
      lastname,
      email,
      password: hashedPassword,
      roles: [role],
      approved: approvalStatus
    })

    await newUser.save()

    res.status(201).json({
      message:
        role === Role.AUTHOR
          ? "Author registered successfully. waiting for approvel"
          : "User registered successfully",
      data: {
        id: newUser._id,
        email: newUser.email,
        roles: newUser.roles,
        approved: newUser.approved
      }
    })
  } catch (err: any) {
    res.status(500).json({ message: err?.message  || "hasdhsa"})
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const valid = await bcrypt.compare(password, existingUser.password)
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const accessToken = signAccessToken(existingUser)
    const refreshToken = signRefreshToken(existingUser);

    res.status(200).json({
      message: "success",
      data: {
        email: existingUser.email,
        roles: existingUser.roles,
        accessToken,
        refreshToken
      }
    })
  } catch (err: any) {
    res.status(500).json({ message: err?.message })
  }
}

export const getMyDetails = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  const userId = req.user.sub
  const user =
    ((await User.findById(userId).select("-password")) as IUser) || null

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  const { firstname, lastname, email, roles, approved } = user

  res.status(200).json({
    message: "Ok",
    data: { firstname, lastname, email, roles, approved }
  })
}

export const registerAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      roles: [Role.ADMIN],
      approved: Status.APPROVED
    });

    await newAdmin.save();

    return res.status(201).json({
      message: "Admin created successfully",
      data: {
        id: newAdmin._id,
        email: newAdmin.email,
        roles: newAdmin.roles,
        approved: newAdmin.approved
      }
    });
  } catch (err: any) {
    console.error("Admin Register Error:", err);
    return res.status(500).json({ message: err?.message || "Internal error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Refresh token required" });

  const payload = verifyRefreshToken(token);
  if (!payload) return res.status(403).json({ message: "Invalid or expired refresh token" });

  const user = await User.findById(payload.sub);
  if (!user) return res.status(404).json({ message: "User not found" });

  const accessToken = signAccessToken(user); 

  res.status(200).json({ accessToken });
};
