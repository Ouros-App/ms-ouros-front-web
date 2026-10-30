import { memo } from 'react';
import type { CampoPerfilProps } from '@/types/perfil.types';
import './CampoPerfil.css';

function CampoPerfilBase({
    id,
    rotulo,
    value,
    onChange,
    tipo = 'text',
    erro,
    ajuda,
    placeholder,
    somenteLeitura = false,
    desabilitado = false,
    autoComplete,
    inputMode,
    maxLength,
    acao,
}: CampoPerfilProps){
    const descricoes = [erro ? `${id}-erro` : null, ajuda ? `${id}-ajuda` : null].filter(Boolean).join(' ');
    
    return(
    <div className="campo-perfil">
        <div className={`campo-perfil__caixa${somenteLeitura ? ' campo-perfil__caixa--leitura' : ''}${erro ? ' campo-perfil__caixa--erro' : ''}`}>
            <label htmlFor={id} className="campo-perfil__rotulo">
                {rotulo}
            </label>
            
            <input
            id={id}
            name={id}
            type={tipo}
            className="campo-perfil__input"
            value={value}
            onChange={(evento) => onChange?.(evento.target.value)}
            placeholder={placeholder}
            readOnly={somenteLeitura}
            disabled={desabilitado}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            aria-invalid={erro ? true : undefined}
            aria-describedby={descricoes || undefined}
            aria-readonly={somenteLeitura ? true : undefined}
            />
            {acao}
    </div>
    {ajuda && (
        <p id={`${id}-ajuda`} className="campo-perfil__ajuda">
            {ajuda}
        </p>
    )}
    
    {erro && (
        <p id={`${id}-erro`} className="campo-perfil__erro" role="alert">
            {erro}
        </p>
    )}
    </div>
);
}

export const CampoPerfil = memo(CampoPerfilBase);