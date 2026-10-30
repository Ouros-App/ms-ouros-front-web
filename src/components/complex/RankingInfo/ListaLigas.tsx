import { ligas } from '@/utils/ranking';
import { imagemDaLiga } from './ligaImagem';

export function ListaLigas() {
  return (
    <ul className="lista-ligas">
      {ligas.map((liga) => {
  const imagem = imagemDaLiga(liga.id);
        return (
          <li key={liga.id} className="lista-ligas__item">
            <span className="lista-ligas__selo" style={{ backgroundColor: imagem ? undefined : liga.cor }}>
              {imagem && <img src={imagem} alt={`Selo da liga ${liga.nome}`} className="lista-ligas__imagem" />}
            </span>
            <div className="lista-ligas__texto">
              <h3 className="lista-ligas__nome">{liga.nome}</h3>
              <p className="lista-ligas__descricao">{liga.descricao}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}