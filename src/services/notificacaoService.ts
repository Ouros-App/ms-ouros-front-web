import { wait } from "@/utils/delay";

export async function contarNaoLidas(signal?: AbortSignal): Promise<number>{
    await wait(400, signal);
    return 3;
}