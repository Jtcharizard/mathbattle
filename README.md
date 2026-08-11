# Equation Arena

**Equation Arena** é um jogo completo de batalhas matemáticas entre bots. Duas equipes ocupam lados opostos de uma arena cartesiana; a cada turno, um algoritmo escolhe uma família de equação, calcula seus coeficientes e transforma a curva em um disparo animado. Tudo acontece localmente no navegador, sem servidor, build, bibliotecas, fontes ou APIs externas.

## Funcionalidades

- Arena Canvas 2D com grade, eixos, obstáculos, bots, barras de vida, trajetória e impacto.
- Partidas determinísticas por seed, de 1 a 5 bots por time, fogo amigo opcional e desempate por vida, dano e acertos.
- Sete famílias: linear, quadrática, cúbica limitada, senoide, cossenoide, arco balístico e híbrida.
- Modos **Exibição**, **Torneio**, **Laboratório evolutivo** e **Passo a passo**.
- Telemetria, log, placar, histórico, relatório texto e exportação/importação JSON validada.
- Persistência tolerante a falhas via `localStorage` e campeão evolutivo salvo.
- Interface responsiva, navegação por teclado, foco visível, região `aria-live`, descrição textual do Canvas e suporte a movimento reduzido.

## Como jogar

1. Abra `index.html` ou publique a pasta no GitHub Pages.
2. Escolha seed, modo, quantidade de bots e estratégias. Os ajustes avançados controlam vida, dano, arena, obstáculos, turnos e evolução.
3. Clique em **Iniciar batalha**. Pause, continue, acelere ou avance um turno quando quiser.
4. Observe a equação, família, alvo, resultado real e telemetria. No laboratório, pause e avance para inspecionar gerações.
5. Use **Salvar campeão** após um bot evolutivo gerar um melhor indivíduo. Exporte a sessão ou um relatório quando desejar.

Uma seed vazia é gerada no navegador. Copie a seed exibida ou use **Mesma seed** para reconstruir a arena e a sequência inicial. Configurações iguais e seed igual usam a mesma sequência pseudoaleatória.

## Estratégias

- **Aleatório:** sorteia família e parâmetros válidos pelo PRNG determinístico; é a linha de base.
- **Analítico:** calcula a inclinação geométrica e faz uma busca numérica limitada em candidatos quadráticos, simulando colisões e escolhendo o menor erro observado.
- **Adaptativo:** registra erro vertical e distância dos disparos, corrige a inclinação para situações seguintes e explora ocasionalmente uma nova curva.
- **Evolutivo:** mantém uma população persistente no bot, simula genomas sem animação e dispara com o melhor candidato encontrado.

### Algoritmo genético e fitness

Cada genoma contém família, três genes de coeficientes, domínio e taxa de mutação. A evolução usa elitismo de dois indivíduos, seleção por torneio, cruzamento gene a gene, mutação gaussiana limitada e uma pequena chance de trocar de família. População (8–80), gerações por turno (1–30), domínio, genes e operações são limitados.

O fitness recompensa fortemente a colisão inimiga e a proximidade, penaliza aliado, obstáculo precoce, saída imediata, parâmetros inválidos e complexidade excessiva. O melhor fitness histórico nunca diminui por elitismo. A interface mostra geração, melhor valor e média. A evolução é síncrona, mas deliberadamente limitada; entre turnos o laço da interface cede ao navegador.

## Famílias matemáticas

As equações são objetos seguros, nunca texto executável. Cada objeto valida família, coeficientes finitos, domínio e sentido. As curvas partem do atirador e espelham horizontalmente para os dois times. O projétil é amostrado em passos curtos e cada segmento testa círculos dos bots, retângulos dos obstáculos, terreno, limites e máximo de 400 pontos.

## Modos

- **Exibição:** batalha visual única.
- **Torneio:** série acelerada de partidas determinísticas, alternando estratégias entre lados e agregando vitórias, dano, acertos e eliminações.
- **Laboratório evolutivo:** força Evolutivo contra Analítico, expõe telemetria e permite pausar, continuar, avançar geração/turno e salvar o campeão.
- **Passo a passo:** inicia pausado e só calcula um disparo por acionamento de **Próximo turno**.

## Tecnologias e estrutura

Somente HTML5, CSS3 e JavaScript ES5/ES6 tradicional, com Canvas 2D e `requestAnimationFrame`/temporizadores do navegador; não há módulos, CDN ou processo de build.

```text
index.html                 interface semântica
css/styles.css             visual neon e responsividade
js/prng.js                 PRNG determinístico
js/math-utils.js           geometria e limites
js/equation.js             famílias seguras
js/projectile.js           trajetória e colisões
js/arena.js / bot.js       mundo e entidades
js/bot-strategies.js       quatro estratégias
js/evolution-engine.js     algoritmo genético
js/game-engine.js          turnos, dano e vitória
js/tournament-controller.js partidas, alternância e placar do torneio
js/renderer.js             Canvas 2D
js/storage.js / io.js      persistência e JSON
js/app.js                  interface e modos
tests/                     runner com 60 testes
LICENSE                    licença MIT
```

## Execução local e testes

O jogo e os testes funcionam por duplo clique (`file://`). Alternativamente, qualquer servidor estático pode ser usado:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/` para jogar e `http://localhost:8000/tests/test-runner.html` para executar os 60 testes unitários e de integração. O runner aciona o mesmo controlador usado pelo formulário para validar torneios e mostra total, aprovados, reprovados, tempo e detalhes de falhas, além de permitir nova execução.

## Exportação, importação e armazenamento

**Exportar dados** produz JSON versão 1 com seed, configurações, arena, bots, estatísticas, histórico resumido, campeão e dados evolutivos. **Importar dados** aceita apenas arquivo JSON, valida versão, tipos, limites, configurações e quantidade de bots antes de substituir a sessão. Conteúdo importado nunca vira HTML ou código. **Relatório texto** cria um resumo leve.

Se `localStorage` estiver bloqueado ou cheio, a batalha continua; dados temporários ficam na memória da aba e a interface informa a limitação ao salvar.

## Publicação no GitHub Pages

1. Envie todos os arquivos para a branch desejada do GitHub.
2. Em **Settings → Pages**, selecione **Deploy from a branch**, a branch e a pasta `/ (root)`.
3. Aguarde a URL publicada. Todos os caminhos são relativos, respeitam subpastas e não dependem de backend.

## Acessibilidade

Controles têm labels, alvos de toque, foco evidente e contraste alto. Resultados usam texto além de cor. O Canvas possui descrição textual atualizada; avisos e log usam regiões anunciáveis. O layout reorganiza painéis abaixo de 1050 px e 720 px e `prefers-reduced-motion` reduz transições e cadência visual.

## Limitações reais

- Obstáculos são retângulos estáticos e o terreno é plano; não há física destrutiva.
- A busca evolutiva é limitada para manter celulares responsivos e não garante atingir o alvo em toda configuração.
- O campeão salvo é um genoma reutilizável/exportável; nesta versão, enfrentá-lo significa carregar/importar seus dados e iniciar o laboratório, não existe edição manual de genomas.
- Áudio não foi implementado (era opcional).
- A descrição textual resume o último turno, não reproduz cada ponto animado da curva.

## Licença

Distribuído sob a [Licença MIT](LICENSE).
