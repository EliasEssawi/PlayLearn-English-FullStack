
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}

export interface sendVerificationCodeRequest {
  email: string;
}

export interface verifyPinRequest{
  email: string,
  profileName: string,
  pin: string,
}

export interface verifyPinResponse{
  success: boolean;
  profile:Profile;
}

export interface Profile {
  profileName: string,
	pin: string,
  role?: string,
	progress?: Record<string, any>,
	points : Number
}

export interface getProfilesResponse {
  success: boolean;
  profiles:Profile[];
}

export interface VerifyCodeRequest{
  email: string;
  code: string;
}

export interface ChangePassRequest{
  email: string;
  code: string;
  newPassword: string;
}