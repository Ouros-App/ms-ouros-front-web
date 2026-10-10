import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { LoginErrors, LoginHelp, LoginValues } from '@/types/auth.types';
import { validateLogin } from '@/utils/validators';

export function useLoginForm(onValidSubmit: (values: LoginValues) => void) {
    const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
    const [errors, setErrors] = useState<LoginErrors>({});
    const [help, setHelp] = useState<LoginHelp | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const handleChange = (field: keyof LoginValues) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
};

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
const found = validateLogin(values);
    setErrors(found);

const [firstInvalid] = Object.keys(found);
    if (firstInvalid) {
        formRef.current?.querySelector<HTMLElement>(`#${firstInvalid}`)?.focus();
    return;
}

    onValidSubmit({ email: values.email.trim(), password: values.password });
};

return { values, errors, help, setHelp, formRef, handleChange, handleSubmit };
}