
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

export interface Profile {
  profileName: string,
	pin: string,
	progress: Record<string, any>,
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