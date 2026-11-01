import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useAdminEnterprise } from '@/context/AdminEnterpriseContext';
import { obterEstadosComGranjas, obterPublicoMeta, dataLocal, type StateGoalAudience } from '@/services/metasService';
import type { NovaMetaFormProps } from '@/types/metas.types';
import { estadosBrasil } from '@/utils/metas';
import { isAbortError } from '@/utils/delay';
import { validateTituloMeta, LIMITES_META } from '@/utils/metasValidators';
import { sanitizeText } from '@/utils/sanitizadores';
import './NovaMetaForm.css';

export function NovaMetaForm({ onLancar }: NovaMetaFormProps) {
    const session = useContext(AuthContext);
    const { empresaSelecionada } = useAdminEnterprise();
    const admin = session?.user?.role === 'admin' || session?.user?.accountType === 'admin';
    const enterpriseId = admin ? empresaSelecionada : null;
    const [estadosDisponiveis, setEstadosDisponiveis] = useState<{ uf: string; nome: string }[]>(estadosBrasil);
    const [state, setState] = useState('');
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState(() => dataLocal(new Date(Date.now() + 90 * 86400000)));
    const [audience, setAudience] = useState<(StateGoalAudience & { scope: number | null }) | null>(null);
    const [audienceError, setAudienceError] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const ready = Boolean(audience && audience.state === state && audience.scope === enterpriseId);
    const count = ready ? audience!.participants_count : 0;

    useEffect(() => {
        if (admin && !enterpriseId) {
            setEstadosDisponiveis([]);
            setState('');
            return;
        }
        const controller = new AbortController();
        obterEstadosComGranjas(enterpriseId, controller.signal)
            .then((ufs) => {
                if (controller.signal.aborted) return;
                if (Array.isArray(ufs)) {
                    if (ufs.length > 0) {
                        const filtrados = estadosBrasil.filter((e) => ufs.includes(e.uf));
                        setEstadosDisponiveis(filtrados.length > 0 ? filtrados : estadosBrasil);
                        if (filtrados.length === 1) {
                            setState(filtrados[0].uf);
                        }
                    } else {
                        setEstadosDisponiveis([]);
                        setState('');
                    }
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) setEstadosDisponiveis(estadosBrasil);
            });
        return () => controller.abort();
    }, [enterpriseId, admin]);

    useEffect(() => {
        setAudience(null);
        setAudienceError('');
        setMessage('');
        if (!state || (admin && !enterpriseId)) return;
        const controller = new AbortController();
        obterPublicoMeta(state, enterpriseId, controller.signal).then((result) => {
            if (!controller.signal.aborted) setAudience({ ...result, scope: enterpriseId });
        }).catch((failure: unknown) => {
            if (!controller.signal.aborted && !isAbortError(failure))
                setAudienceError(failure instanceof Error ? failure.message : 'Não foi possível consultar os participantes.');
        });
        return () => controller.abort();
    }, [state, enterpriseId, admin, attempt]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const titleError = validateTituloMeta(title);
        if (titleError) { setError(titleError); return; }
        if (!state || !deadline || deadline < dataLocal(new Date())) {
            setError('Informe a UF e um prazo a partir de hoje.'); return;
        }
        if (!ready || count === 0) { setError('Consulte uma UF com granjas participantes antes de lançar.'); return; }
        setSending(true); setError(''); setMessage('');
        try {
            const actualCount = await onLancar(sanitizeText(title.trim()), {
                state, dateEnd: deadline, idEnterprise: enterpriseId,
            });
            setTitle('');
            setMessage(`Meta criada para ${actualCount} granja(s) de ${state}. Cada granja terá seu próprio andamento.`);
        } catch (failure) {
            if (!isAbortError(failure)) setError(failure instanceof Error ? failure.message : 'Não foi possível lançar a meta.');
        } finally { setSending(false); }
    };

    return <form className="nova-meta" onSubmit={submit} noValidate>
        <span className="nova-meta__titulo">Adicionar meta estadual</span>
        {admin && !enterpriseId && <p role="status">Selecione uma integradora no contexto de empresa para lançar a meta.</p>}
        <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-uf">Estado</label>
            <select id="meta-uf" className="nova-meta__campo nova-meta__select" value={state}
                onChange={(e) => { setState(e.target.value); setError(''); }} disabled={sending || (admin && !enterpriseId) || estadosDisponiveis.length === 0}>
                <option value="">{estadosDisponiveis.length === 0 ? (admin && !enterpriseId ? 'Selecione uma empresa' : 'Nenhum estado com granjas cadastradas') : 'Selecione a UF'}</option>
                {estadosDisponiveis.map((uf) => <option key={uf.uf} value={uf.uf}>{uf.nome} ({uf.uf})</option>)}
            </select>
        </div>

        <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-prazo">Prazo</label>
            <input id="meta-prazo" className="nova-meta__campo" type="date" min={dataLocal(new Date())}
                value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={sending} />
        </div>

        <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-nova">Título da meta</label>
            <input id="meta-nova" className="nova-meta__campo" value={title} onChange={(e) => setTitle(e.target.value)}
                maxLength={LIMITES_META.tituloMax} placeholder="Realizar manutenção preventiva" disabled={sending} />
        </div>

        <div className="nova-meta__aviso" role="status" aria-live="polite">
            {state && !ready && !audienceError && !(admin && !enterpriseId) && 'Consultando granjas participantes...'}
            {ready && (count ? `${count} granja(s) de ${state} receberão a meta na empresa selecionada.` : 'Nenhuma granja elegível nesta UF e empresa.')}
        </div>
        {audienceError && <div role="alert"><p>{audienceError}</p>
            <button type="button" onClick={() => setAttempt((n) => n + 1)}>Consultar novamente</button></div>}
        <p className="nova-meta__aviso">Serão incluídas as granjas elegíveis no momento do lançamento. Novas granjas não entram automaticamente.</p>
        <button type="submit" className="nova-meta__botao nova-meta__botao--lancar" disabled={sending || !ready || count === 0}>
            {sending ? 'Lançando...' : 'Lançar meta estadual'}
        </button>
        {error && <p className="nova-meta__erro" role="alert">{error}</p>}
        {message && <p className="nova-meta__aviso" role="status">{message}</p>}
        
    </form>;
}
