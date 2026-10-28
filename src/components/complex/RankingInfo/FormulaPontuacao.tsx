export function FormulaPontuacao(){
  return(
    <div className="formula-pontuacao">
      <div className="formula-pontuacao__bloco">
        <h3 className="formula-pontuacao__titulo">Consumo de água por ave (CAA)</h3>
        <p className="formula-pontuacao__conta">Litros ÷ Quantidade de aves</p>
      </div>
  
      <div className="formula-pontuacao__bloco">
        <h3 className="formula-pontuacao__titulo">Consumo de energia por ave (CEA)</h3>
        <p className="formula-pontuacao__conta">Energia ÷ Quantidade de aves</p>
      </div>
  
      <div className="formula-pontuacao__bloco">
        <h3 className="formula-pontuacao__titulo">Consumo Geral do Integrado (CGI)</h3>
        <p className="formula-pontuacao__conta">(CAA × 0,7) + (CEA × 0,3) = CGI</p>
      </div>
    </div>
  );
}