import { FormulaPontuacao } from './FormulaPontuacao';
import { ListaLigas } from './ListaLigas';
import './RankingInfo.css';

export function RankingInfo(){
    return(
        <section className="ranking-info" aria-label="Como funciona o ranking">
            <div className="ranking-info__coluna">
                <h2 className="ranking-info__titulo">Pontuação</h2>
                <p className="ranking-info__texto">O indicador é feito pela seguinte conta:</p>
                <FormulaPontuacao />
            </div>
            
            <div className="ranking-info__coluna">
                <h2 className="ranking-info__titulo">Ligas</h2>
                <p className="ranking-info__texto">A distribuição de integrados para cada liga é feita da seguinte maneira:</p>
                <ListaLigas />
            </div>
        </section>
    );
}