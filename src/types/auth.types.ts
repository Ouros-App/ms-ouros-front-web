export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = Partial<Record<keyof LoginValues, string>>;
export type LoginStatus = 'idle' | 'loading' | 'success' | 'error';
export type LoginStep = 'credentials' | 'verification';
export type LoginHelp = 'senha' | 'conta';

export interface LoginLocationsState {
  from?: string;
}

export interface LoginCardProps {
  status: LoginStatus;
  message: string;
  onSubmit: (values: LoginValues) => void;
  onForgotPassword?: () => void;
}

export interface NativeLoginStartResponse {
  challenge_id: string;
  expires_in: number;
  masked_email: string;
}

export interface NativeLoginVerifyRequest {
  email: string;
  password: string;
  challenge_id: string;
  code: string;
}

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  refresh_token?: string;
  token_type: string;
  scope?: string;
}

export interface PendingChallenge {
  email: string;
  password: string;
  challengeId: string;
  maskedEmail: string;
  expiresIn: number;
  isMock?: boolean;
}

export interface VerificationCardProps {
  maskedEmail: string;
  status: LoginStatus;
  message: string;
  onVerify: (code: string) => void;
  onResend: () => Promise<void> | void;
  onBack: () => void;
  expiresIn?: number;
  cooldownSeconds?: number;
  isMock?: boolean;
}
