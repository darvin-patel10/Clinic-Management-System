import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";


export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        //check if User is Alrady exist in the database
        const isAlreadyRegistred = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (isAlreadyRegistred) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Password Hashing (encryption)
        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");


        //Creat New User
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        //Generate OTP

        const otp = generateOtp();
        const html = getOtpHtml(otp);
        const otpHash = crypto
            .createHash("sha256")
            .update(otp)
            .digest("hex");

        await otpModel.create({
            email,
            user: user._id,
            otpHash
        });

        await sendEmail(email, "Verify Your Email", `Your OTP code is ${otp}`, html);

        //Creat JWT token

        // const refreshToken = jwt.sign({
        //     id: user._id
        // }, config.JWT_SECRET,
        //     {
        //         expiresIn: "7d"
        //     })

        // const refreshTokenHash = crypto
        //     .createHash("sha256")
        //     .update(refreshToken)
        //     .digest("hex");

        // const session = await sessionModel.create({
        //     user: user._id,
        //     refreshTokenHash,
        //     ip: req.ip,
        //     userAgent: req.headers["user-agent"]
        // });

        // const accessToken = jwt.sign({
        //     id: user._id,
        //     sessionId: session._id
        // }, config.JWT_SECRET,
        //     {
        //         expiresIn: "15m"
        //     });

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: "strict",
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // });

        res.status(201).json({
            massage: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified
            },
        })
    }
    catch (error) {
        console.log(error);
    }
}

export async function verifyEmail(req, res) {
    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
        return res.status(400).json({
            message: "Email and OTP are required"
        });
    }

    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    })

    if (!otpDoc) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    const user = await userModel.findByIdAndUpdate(
        otpDoc.user,
        { verified: true },
        { new: true }
    );

    await otpModel.deleteMany({
        user: otpDoc.user
    });

    //Creat JWT token

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        })

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        message: "Email verified successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified
        },
        accessToken
    });
}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(401).json({
            massage: "Invalid email"
        })
    }

    if (!user.verified) {
        return res.status(401).json({
            massage: "Email not verified"
        })
    }

    const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    const isPasswordValid = hashedPassword === user.password;

    if (!isPasswordValid) {
        return res.status(401).json({
            massage: "Invalid password"
        })
    }

    //Create newRefreshToken
    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        })

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        massage: "User logged in successfully",
        user: {
            username: user.username,
            email: user.email
        },
        accessToken
    })
}

export async function getMe(req, res) {
    // req.user is injected by the `authenticate` middleware.
    // No token work needed here — the middleware already verified everything.
    const user = req.user;

    res.status(200).json({
        message: "User fetched successfully",
        user: {
            username: user.username,
            email: user.email,
        }
    })
}

export async function refreshToken(req, res) {

    //Get the token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    // Check refreshTocken is logout or not
    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if (!session) {
        return res.status(404).json({
            message: "Session not found"
        })
    }

    //Creat New Token

    const accessToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        });

    const newRefreshToken = jwt.sign({
        id: decoded.id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        })

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        message: "Access Token refrehed successfully",
        accessToken
    })
}

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if (!session) {
        return res.status(404).json({
            message: "Invalid refresh token"
        })
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");
    res.status(200).json({
        message: "User logged out successfully"
    });
}

export async function forgotPassword(req, res) {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const otp = generateOtp();
    const html = getOtpHtml(otp);
    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const otpDoc = await otpModel.create({
        email,
        user: user._id,
        otpHash
    });

    if (!otpDoc) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    await sendEmail(email, "Forgot Password", `Your OTP code is ${otp}`, html);

    res.status(200).json({
        message: "OTP sent successfully",
        forgot: false
    });
}

export async function otpverify(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            message: "Email and OTP are required"
        });
    }

    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const otpDoc = await otpModel.findOne({
        email,
        otpHash
    });

    if (!otpDoc) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    const user = await userModel.findOne({ _id: otpDoc.user });

    await otpModel.deleteMany({
        user: otpDoc.user
    });

    // Issue a short-lived, signed reset token — the client cannot forge this.
    // The `purpose` claim ensures this token cannot be reused for other endpoints.
    const resetToken = jwt.sign(
        {
            id: user._id,
            email: user.email,
            purpose: "password_reset"
        },
        config.JWT_SECRET,
        { expiresIn: "10m" }
    );

    res.status(200).json({
        message: "OTP verified successfully",
        resetToken   // Client must send this back to /reset-password
    });
}

export async function resetPassword(req, res) {
    const { password, resetToken } = req.body;

    if (!resetToken || !password) {
        return res.status(400).json({
            message: "Reset token and new password are required"
        });
    }

    // Verify the server-issued token — this is the only authorization check.
    // Email is extracted from the verified payload, NOT trusted from the client.
    let decoded;
    try {
        decoded = jwt.verify(resetToken, config.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired reset token. Please request a new OTP."
        });
    }

    // Guard against tokens issued for other purposes (e.g., access tokens)
    if (decoded.purpose !== "password_reset") {
        return res.status(401).json({
            message: "Invalid token purpose"
        });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const hashedPassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
        message: "Password reset successfully"
    });
}