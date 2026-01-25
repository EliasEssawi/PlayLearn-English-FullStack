
export interface LoginRequest {// Request payload for user login

  email: string;
  password: string;
}

export interface LoginResponse {// Response returned after login attempt

  message: string;
}

export interface sendVerificationCodeRequest {// Request payload to send a verification code to user's email

  email: string;
}

export interface verifyPinRequest{// Request payload to verify a profile PIN

  email: string,
  profileName: string,
  pin: string,
}

export interface verifyPinResponse{// Response returned after successful PIN verification

  success: boolean;
  profile:Profile;
}

export interface Profile {// Represents a user profile

  profileName: string,
	pin: string,
  role?: string,
	progress?: Record<string, any>,
	points : Number
}

export interface getProfilesResponse {// Response returned when fetching user profiles

  success: boolean;
  profiles:Profile[];
}

export interface VerifyCodeRequest{// Request payload to verify password reset code

  email: string;
  code: string;
}

export interface ChangePassRequest{// Request payload to change user password

  email: string;
  code: string;
  newPassword: string;
}