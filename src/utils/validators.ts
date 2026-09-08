export const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
export const isRequired = (v: string) => v.trim().length > 0;
