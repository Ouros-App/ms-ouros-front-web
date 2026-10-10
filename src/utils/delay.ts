export function wait(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if(signal?.aborted){
            reject(new DOMException('Operação Cancelada', 'AbortError'));
            return;
        }

        const onAbort = () => {
            window.clearTimeout(timer);
            reject(new DOMException('Operação Cancelada', 'AbortError'));
        }

        const timer = window.setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, ms);

        signal?.addEventListener('abort', onAbort,{once:true});
    });
}

export const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === 'AbortError';