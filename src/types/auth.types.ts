export interface LoginValues{
    email: string;
    password: string;
}

export type LoginErrors =  Partial<Record<keyof LoginValues, string>>;
export type LoginStatus = 'idle' | 'loading' | 'success' | 'error';
export type LoginHelp = 'senha' | 'conta';

export interface LoginLocationsState{
    from?: string;
}

export interface LoginCardProps{
    status: LoginStatus;
    message: string;
    onSubmited: (values: LoginValues) => void;
}