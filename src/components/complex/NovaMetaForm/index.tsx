import { useNovaMeta } from '@/hooks/useNovaMeta';
import type { NovaMetaFormProps } from '@/types/metas.types';
import { LIMITES_META } from '@/utils/metasValidators';
import './NovaMetaForm.css';

export function NovaMetaForm({ onLancar }: NovaMetaFormProps) {
    const {
        admin, enterpriseId, formulario, consulta, envio, pronto, quantidade, hoje,
        alterarEstado, alterarPrazo, alterarTitulo, consultarNovamente, enviar,
    } = useNovaMeta(onLancar);
    const { state, title, deadline } = formulario;
    const { estadosDisponiveis, audienceError } = consulta;
    const { sending, error, message } = envio;
    const semEmpresa = admin && !enterpriseId;

    return <form className="nova-meta" onSubmit={enviar} noValidate>
        <span className="nova-meta__titulo">Adicionar meta estadual</span>
        {semEmpresa && <p role="status">Selecione uma integradora no contexto de empresa para lançar a meta.</p>}
        <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-uf">Estado</label>
            <select id="meta-uf" className="nova-meta__campo nova-meta__select" value={state}
                onChange={(e) => alterarEstado(e.target.value)} disabled={sending || semEmpresa || estadosDisponiveis.length === 0}>
                <option value="">{estadosDisponiveis.length === 0 ? (semEmpresa ? 'Selecione uma empresa' : 'Nenhum estado com granjas cadastradas') : 'Selecione a UF'}</option>
                {estadosDisponiveis.map((uf) => <option key={uf.uf} value={uf.uf}>{uf.nome} ({uf.uf})</option>)}
            </select>
        </div>

        <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-prazo">Prazo</label>
            <input id="meta-prazo" className="nova-meta__campo" type="date" min={hoje}
                value={deadline} onChange={(e) => alterarPrazo(e.target.value)} disabled={sending} />
        </div>

        <div className="nova-meta__grupo">
            <label className="nova-meta__rotulo" htmlFor="meta-nova">Título da meta</label>
            <input id="meta-nova" className="nova-meta__campo" value={title} onChange={(e) => alterarTitulo(e.target.value)}
                maxLength={LIMITES_META.tituloMax} placeholder="Realizar manutenção preventiva" disabled={sending} />
        </div>

        <div className="nova-meta__aviso" role="status" aria-live="polite">
            {state && !pronto && !audienceError && !semEmpresa && 'Consultando granjas participantes...'}
            {pronto && (quantidade ? `${quantidade} granja(s) de ${state} receberão a meta na empresa selecionada.` : 'Nenhuma granja elegível nesta UF e empresa.')}
        </div>
        {audienceError && <div role="alert"><p>{audienceError}</p>
            <button type="button" onClick={consultarNovamente}>Consultar novamente</button></div>}
        <p className="nova-meta__aviso">Serão incluídas as granjas elegíveis no momento do lançamento. Novas granjas não entram automaticamente.</p>
        <button type="submit" className="nova-meta__botao nova-meta__botao--lancar" disabled={sending || !pronto || quantidade === 0}>
            {sending ? 'Lançando...' : 'Lançar meta estadual'}
        </button>
        {error && <p className="nova-meta__erro" role="alert">{error}</p>}
        {message && <p className="nova-meta__aviso" role="status">{message}</p>}
    </form>;
}