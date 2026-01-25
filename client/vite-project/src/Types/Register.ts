// Payload structure sent when registering a new user

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  pin: string;
  dateOfBirth: string; 
}
// Response structure returned after successful registration

export interface RegisterResponse {
  message: string;
}
