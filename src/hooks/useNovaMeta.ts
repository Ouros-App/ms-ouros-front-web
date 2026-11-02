import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { dataLocal, obterEstadosComGranjas, obterPublicoMeta } from '@/services/metasService';
import type { NovaMetaFormProps } from '@/types/metas.types';
import type { NovaMetaConsulta, NovaMetaEnvio, NovaMetaFormulario } from '@/types/novaMeta.types';
import { isAbortError } from '@/utils/delay';
import { estadosBrasil } from '@/utils/metas';
import { validateTituloMeta } from '@/utils/metasValidators';
import { sanitizeText } from '@/utils/sanitizadores';

const DIAS_PRAZO_PADRAO = 90;
const MS_POR_DIA = 86400000;

export function useNovaMeta(onLancar: NovaMetaFormProps['onLancar']) {
    const sessao = useContext(AuthContext);
    const { empresaSelecionada } = useAdminEnterprise();
    const admin = sessao?.user?.role === 'admin' || sessao?.user?.accountType === 'admin';
    const enterpriseId = admin ? empresaSelecionada : null;

    const [formulario, setFormulario] = useState<NovaMetaFormulario>(() => ({
        state: '',
        title: '',
        deadline: dataLocal(new Date(Date.now() + DIAS_PRAZO_PADRAO * MS_POR_DIA)),
    }));
    const [consulta, setConsulta] = useState<NovaMetaConsulta>({
        estadosDisponiveis: estadosBrasil,
        audience: null,
        audienceError: '',
        attempt: 0,
    });
    const [envio, setEnvio] = useState<NovaMetaEnvio>({ sending: false, error: '', message: '' });

    const { state, title, deadline } = formulario;
    const { audience, attempt } = consulta;
    const pronto = Boolean(audience && audience.state === state && audience.scope === enterpriseId);
    const quantidade = pronto && audience ? audience.participants_count : 0;

    useEffect(() => {
        if (admin && !enterpriseId) {
            setConsulta((atual) => ({ ...atual, estadosDisponiveis: [] }));
            setFormulario((atual) => ({ ...atual, state: '' }));
            return;
        }
        const controller = new AbortController();
        obterEstadosComGranjas(enterpriseId, controller.signal)
            .then((ufs) => {
                if (controller.signal.aborted || !Array.isArray(ufs)) return;
                if (ufs.length === 0) {
                    setConsulta((atual) => ({ ...atual, estadosDisponiveis: [] }));
                    setFormulario((atual) => ({ ...atual, state: '' }));
                    return;
                }
                const filtrados = estadosBrasil.filter((e) => ufs.includes(e.uf));
                setConsulta((atual) => ({
                    ...atual,
                    estadosDisponiveis: filtrados.length > 0 ? filtrados : estadosBrasil,
                }));
                if (filtrados.length === 1) {
                    setFormulario((atual) => ({ ...atual, state: filtrados[0].uf }));
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setConsulta((atual) => ({ ...atual, estadosDisponiveis: estadosBrasil }));
                }
            });
        return () => controller.abort();
    }, [enterpriseId, admin]);

    useEffect(() => {
        setConsulta((atual) => ({ ...atual, audience: null, audienceError: '' }));
        setEnvio((atual) => ({ ...atual, message: '' }));
        if (!state || (admin && !enterpriseId)) return;
        const controller = new AbortController();
        obterPublicoMeta(state, enterpriseId, controller.signal)
            .then((resultado) => {
                if (controller.signal.aborted) return;
                setConsulta((atual) => ({ ...atual, audience: { ...resultado, scope: enterpriseId } }));
            })
            .catch((falha: unknown) => {
                if (controller.signal.aborted || isAbortError(falha)) return;
                setConsulta((atual) => ({
                    ...atual,
                    audienceError: falha instanceof Error ? falha.message : 'Não foi possível consultar os participantes.',
                }));
            });
        return () => controller.abort();
    }, [state, enterpriseId, admin, attempt]);

    const alterarEstado = (uf: string) => {
        setFormulario((atual) => ({ ...atual, state: uf }));
        setEnvio((atual) => ({ ...atual, error: '' }));
    };
    const alterarPrazo = (valor: string) => setFormulario((atual) => ({ ...atual, deadline: valor }));
    const alterarTitulo = (valor: string) => setFormulario((atual) => ({ ...atual, title: valor }));
    const consultarNovamente = () => setConsulta((atual) => ({ ...atual, attempt: atual.attempt + 1 }));

    const enviar = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();
        const erroTitulo = validateTituloMeta(title);
        if (erroTitulo) {
            setEnvio((atual) => ({ ...atual, error: erroTitulo }));
            return;
        }
        if (!state || !deadline || deadline < dataLocal(new Date())) {
            setEnvio((atual) => ({ ...atual, error: 'Informe a UF e um prazo a partir de hoje.' }));
            return;
        }
        if (!pronto || quantidade === 0) {
            setEnvio((atual) => ({ ...atual, error: 'Consulte uma UF com granjas participantes antes de lançar.' }));
            return;
        }
        setEnvio({ sending: true, error: '', message: '' });
        try {
            const total = await onLancar(sanitizeText(title.trim()), {
                state,
                dateEnd: deadline,
                idEnterprise: enterpriseId,
            });
            setFormulario((atual) => ({ ...atual, title: '' }));
            setEnvio({
                sending: false,
                error: '',
                message: `Meta criada para ${total} granja(s) de ${state}. Cada granja terá seu próprio andamento.`,
            });
        } catch (falha) {
            setEnvio((atual) => ({
                ...atual,
                sending: false,
                error: isAbortError(falha)
                    ? atual.error
                    : falha instanceof Error
                    ? falha.message
                    : 'Não foi possível lançar a meta.',
            }));
        }
    };

    return {
        admin,
        enterpriseId,
        formulario,
        consulta,
        envio,
        pronto,
        quantidade,
        hoje: dataLocal(new Date()),
        alterarEstado,
        alterarPrazo,
        alterarTitulo,
        consultarNovamente,
        enviar,
    };
}