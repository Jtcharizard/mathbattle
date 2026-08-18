(function (EA) {
  'use strict';
  var tests = [];
  function test(name, fn) { tests.push({ name: name, fn: fn }); }
  function ok(value, message) { if (!value) throw new Error(message || 'asserção falsa'); }
  function config(seed) { return { seed: seed, mode: 'exibicao', botsA: 1, botsB: 1, strategyA: 'analytical', strategyB: 'random', obstacles: 0, turnLimit: 12, tournamentGames: 4, population: 8, generations: 1, families: EA.EQUATION_FAMILIES.slice() }; }
  function fixture(seed) {
    var mode = { value: 'exibicao' }, panel = { textContent: '' }, controller = new EA.TournamentController(), current = null, summary = null, cfg = config(seed);
    return {
      mode: mode,
      panel: panel,
      controller: controller,
      get current() { return current; },
      get summary() { return summary; },
      submit: function () {
        cfg.mode = mode.value;
        if (cfg.mode === 'torneio') {
          summary = controller.runAll(cfg);
          current = summary.lastGame;
          panel.textContent = EA.TournamentController.formatSummary(summary);
        } else {
          controller.cancel();
          if (cfg.mode === 'laboratorio') {
            cfg.strategyA = 'evolution';
            cfg.strategyB = 'analytical';
          }
          current = new EA.GameEngine(cfg);
        }
        return current;
      }
    };
  }

  test('36. formulário seleciona Torneio pelo controlador real', function () { var f=fixture('ui-1');f.mode.value='torneio';ok(f.submit() instanceof EA.GameEngine); });
  test('37. partida criada pelo torneio possui arena', function () { var f=fixture('ui-2');f.mode.value='torneio';f.submit();ok(f.current.arena&&f.current.arena.width>0); });
  test('38. pelo menos uma partida chega ao fim', function () { var f=fixture('ui-3');f.mode.value='torneio';f.submit();ok(f.current.finished&&f.summary.games>0); });
  test('39. torneio contabiliza estatística', function () { var f=fixture('ui-4');f.mode.value='torneio';f.submit();var w=f.summary.wins;ok(w.A+w.B+w.Empate>0); });
  test('40. torneio executa várias partidas', function () { var f=fixture('ui-5');f.mode.value='torneio';f.submit();ok(f.summary.games===4); });
  test('41. placar final é coerente', function () { var f=fixture('ui-6');f.mode.value='torneio';f.submit();var w=f.summary.wins;ok(w.A+w.B+w.Empate===f.summary.games&&f.summary.completed); });
  test('42. novo torneio funciona depois do primeiro', function () { var f=fixture('ui-7');f.mode.value='torneio';f.submit();f.submit();ok(f.summary.games===4&&f.summary.completed); });
  test('43. troca de Exibição para Torneio', function () { var f=fixture('ui-8');f.submit();f.mode.value='torneio';f.submit();ok(f.summary.completed&&f.current.finished); });
  test('44. troca de Torneio para Laboratório', function () { var f=fixture('ui-9');f.mode.value='torneio';f.submit();f.mode.value='laboratorio';f.submit();ok(f.current.config.mode==='laboratorio'&&f.current.bots[0].strategy==='evolution'); });
  test('45. torneio inicia depois de simulação pausada', function () { var f=fixture('ui-10'),g=f.submit();g.paused=true;f.mode.value='torneio';f.submit();ok(f.summary.completed); });
  test('46. fluxo do controlador não lança exceção', function () { var f=fixture('ui-11'),failed=false;try{f.mode.value='torneio';f.submit();}catch(e){failed=true;}ok(!failed); });
  test('47. painel visual recebe resultados', function () { var f=fixture('ui-12');f.mode.value='torneio';f.submit();ok(/Vitórias A:/.test(f.panel.textContent)&&/Eliminações:/.test(f.panel.textContent)); });
  test('48. seed repete placar do torneio', function () { var a=fixture('same-ui'),b=fixture('same-ui');a.mode.value=b.mode.value='torneio';a.submit();b.submit();ok(JSON.stringify(a.summary.wins)===JSON.stringify(b.summary.wins)&&JSON.stringify(a.summary.stats)===JSON.stringify(b.summary.stats)); });
  test('49. alternância de lados não altera configuração-base', function () { var c=new EA.TournamentController(),base=config('sides'),m0=c.configForMatch(base,0),m1=c.configForMatch(base,1);ok(m0.strategyA==='analytical'&&m1.strategyA==='random'&&m1.strategyB==='analytical'&&base.strategyA==='analytical'); });
  test('50. controlador rejeita partida sem arena na origem', function () { var c=new EA.TournamentController({createGame:function(){return{};}}),failed=false;c.prepare(config('bad'));try{c.playMatch(c.baseConfig,0);}catch(e){failed=/arena válida/.test(e.message);}ok(failed); });

  test('51. zero exato é exibido como zero', function () { ok(EA.makeEquation('quadratica',{x:0,y:0},1,[0,0],100).text()==='y = 0'); });
  test('52. valor positivo pequeno continua distinguível', function () { ok(EA.makeEquation('quadratica',{x:0,y:0},1,[0.0042,0],100).text().indexOf('0.0042x²')>=0); });
  test('53. valor negativo pequeno preserva sinal', function () { ok(EA.makeEquation('linear',{x:0,y:0},1,[-0.031,0],100).text()==='y = −0.031x'); });
  test('54. valor normal remove zeros supérfluos', function () { ok(EA.makeEquation('linear',{x:0,y:0},1,[2.4,0],100).text()==='y = 2.4x'); });
  test('55. valor grande permanece legível', function () { ok(EA.formatNumber(9999)==='9999'); });
  test('56. valor muito pequeno usa notação científica', function () { ok(EA.makeEquation('cubica',{x:0,y:0},1,[0.000032,0,0.8],100).text()==='y = 3.2×10⁻⁵x³ + 0.8x'); });
  test('57. sinais não produzem soma de negativo', function () { var x=EA.makeEquation('quadratica',{x:0,y:0},1,[0.0042,-0.031],100).text();ok(x==='y = 0.0042x² − 0.031x'&&x.indexOf('+ −')<0); });
  test('58. termos realmente zerados são omitidos', function () { ok(EA.makeEquation('cubica',{x:0,y:0},1,[0,2,0],100).text()==='y = 2x²'); });
  test('59. todas as famílias possuem texto legível', function () { EA.EQUATION_FAMILIES.forEach(function(family){var text=EA.makeEquation(family,{x:0,y:0},1,[0.0032,-0.02,0.4],100).text();ok(text&&text.indexOf('undefined')<0&&text.indexOf('NaN')<0);}); });
  test('60. fase trigonométrica usa sinal correto', function () { var x=EA.makeEquation('senoide',{x:0,y:0},1,[2,3,-0.25],100).text();ok(x==='y = 2 · sen(3x − 0.25)'); });

  test('61. configuração mínima cria 1 contra 1', function () { var g=new EA.GameEngine({seed:'1x1',botsA:1,botsB:1});ok(g.bots.length===2); });
  test('62. configuração cria 5 contra 5', function () { var g=new EA.GameEngine({seed:'5x5',botsA:5,botsB:5});ok(g.living('A').length===5&&g.living('B').length===5); });
  test('63. configuração cria 10 contra 10', function () { var g=new EA.GameEngine({seed:'10x10',botsA:10,botsB:10});ok(g.bots.length===20); });
  test('64. configuração cria exatamente 40 bots', function () { var g=new EA.GameEngine({seed:'20x20',botsA:20,botsB:20});ok(g.bots.length===40&&g.living('A').length===20&&g.living('B').length===20); });
  test('65. 40 bots permanecem dentro da arena', function () { var g=new EA.GameEngine({seed:'bounds-40',botsA:20,botsB:20,width:600,obstacles:8});ok(g.bots.every(function(b){return b.x-b.radius>=0&&b.x+b.radius<=g.arena.width&&b.y-b.radius>=0&&b.y+b.radius<=g.arena.ground;})); });
  test('66. nenhum dos 40 bots nasce em obstáculo', function () { var g=new EA.GameEngine({seed:'blocks-40',botsA:20,botsB:20,obstacles:8});ok(g.bots.every(function(b){return !g.arena.blocked(b.x,b.y,b.radius);})); });
  test('67. posições iniciais não se sobrepõem', function () { var g=new EA.GameEngine({seed:'overlap-40',botsA:20,botsB:20,width:600}),valid=true;g.bots.forEach(function(a,i){g.bots.slice(i+1).forEach(function(b){if(EA.distance(a,b)<a.radius+b.radius)valid=false;});});ok(valid); });
  test('68. bots mortos não recebem turno', function () { var g=new EA.GameEngine({seed:'dead-turn',botsA:3,botsB:3,strategyA:'random',strategyB:'random'}),dead=g.bots[0];dead.applyDamage(999);g.paused=false;for(var i=0;i<8;i+=1)g.step(true);ok(dead.shots===0); });
  test('69. alvo morto é substituído', function () { var g=new EA.GameEngine({seed:'dead-target',botsA:2,botsB:2}),shooter=g.living('A')[0],first=g.targetFor(shooter);first.applyDamage(999);var replacement=g.targetFor(shooter);ok(replacement&&replacement!==first&&replacement.alive); });
  test('70. batalha 20 contra 20 termina no limite', function () { var g=new EA.GameEngine({seed:'large-end',botsA:20,botsB:20,strategyA:'random',strategyB:'random',turnLimit:45});g.runFast();ok(g.finished&&g.turn<=45); });
  test('71. torneio com batalhas 20 contra 20 termina', function () { var result=new EA.TournamentController().runAll({seed:'large-tour',botsA:20,botsB:20,strategyA:'random',strategyB:'random',turnLimit:20,tournamentGames:2});ok(result.completed&&result.games===2&&result.lastGame.bots.length===40); });
  test('72. batalha grande é determinística', function () { var cfg={seed:'large-same',botsA:20,botsB:20,strategyA:'random',strategyB:'random',turnLimit:25},a=new EA.GameEngine(cfg),b=new EA.GameEngine(cfg);a.runFast();b.runFast();ok(a.winner===b.winner&&JSON.stringify(a.history)===JSON.stringify(b.history)); });
  test('73. seeds diferentes mudam formação grande', function () { var a=new EA.GameEngine({seed:'large-a',botsA:20,botsB:20}),b=new EA.GameEngine({seed:'large-b',botsA:20,botsB:20});ok(JSON.stringify(a.bots.map(function(x){return[x.x,x.y];}))!==JSON.stringify(b.bots.map(function(x){return[x.x,x.y];}))); });
  test('74. pausa e retomada não avançam duas vezes', function () { var g=new EA.GameEngine({seed:'pause-safe',botsA:2,botsB:2});g.paused=true;g.step();g.step();ok(g.turn===0);g.paused=false;g.step();ok(g.turn===1); });
  test('75. novo torneio cancela agendamento anterior', function () { var queued=[],cancelled=[],c=new EA.TournamentController({schedule:function(fn){queued.push(fn);return queued.length;},cancelSchedule:function(id){cancelled.push(id);}});c.start(config('old'));c.start(config('new'));ok(cancelled.length>=1&&c.baseConfig.seed==='new'); });
  test('76. preset Batalha caótica aplica 10 contra 10', function () { var c=EA.chaoticConfig({seed:'chaos',botsA:2,botsB:3,turnLimit:10});ok(c.botsA===10&&c.botsB===10&&c.turnLimit>=240&&c.obstacles===4); });
  test('77. placar informa vivos, iniciais, PV e eliminados', function () { var g=new EA.GameEngine({seed:'score',botsA:4,botsB:4,hp:100}),victim=g.living('A')[0];victim.applyDamage(999);ok(g.scoreText('A')==='3/4 ativos · 300 PV · 1 eliminados'); });
  test('78. limites rejeitam mais de 40 bots por time', function () { var g=new EA.GameEngine({seed:'clamp',botsA:999,botsB:999});ok(g.bots.length===80); });
  test('79. mesma seed gera o mesmo mapa procedural',function(){var a=new EA.GameEngine({seed:'map-same',mapType:'caos',density:'extrema'}),b=new EA.GameEngine({seed:'map-same',mapType:'caos',density:'extrema'});ok(a.arena.type===b.arena.type&&JSON.stringify(a.arena.obstacles)===JSON.stringify(b.arena.obstacles));});
  test('80. mesma seed gera os mesmos spawns',function(){var c={seed:'spawn-same',botsA:30,botsB:30,spawnMode:'squads'},a=new EA.GameEngine(c),b=new EA.GameEngine(c);ok(JSON.stringify(a.bots.map(function(x){return[x.x,x.y];}))===JSON.stringify(b.bots.map(function(x){return[x.x,x.y];})));});
  test('81. mesma seed gera os mesmos arquétipos',function(){var c={seed:'arch-same',botsA:20,botsB:20,archetypeModeA:'aleatoria',archetypeModeB:'aleatoria'},a=new EA.GameEngine(c),b=new EA.GameEngine(c);ok(JSON.stringify(a.bots.map(function(x){return x.archetype;}))===JSON.stringify(b.bots.map(function(x){return x.archetype;})));});
  test('82. obstáculos procedurais respeitam limites',function(){var g=new EA.GameEngine({seed:'ob-limits',mapType:'fortaleza',density:'extrema'});ok(g.arena.obstacles.every(function(o){return o.x>=0&&o.y>=0&&o.x+o.w<=g.arena.width&&o.y+o.h<=g.arena.ground+1;}));});
  test('83. mapas mantêm área jogável',function(){['planicie','fortaleza','canion','ilhas','arena','caos','aleatorio'].forEach(function(type){var g=new EA.GameEngine({seed:'play-'+type,mapType:type,density:'extrema'});ok(g.arena.playableWidth>=g.arena.width*.4&&g.living('A').length&&g.living('B').length);});});
  test('84. todos os presets de mapa funcionam',function(){['planicie','fortaleza','canion','ilhas','arena','caos'].forEach(function(type){var g=new EA.GameEngine({seed:'preset-'+type,mapType:type});ok(g.arena.type===type);});});
  test('85. todos os modos de spawn criam posições válidas',function(){['frentes','espalhado','squads','cerco','caos'].forEach(function(mode){var g=new EA.GameEngine({seed:'mode-'+mode,botsA:20,botsB:20,spawnMode:mode,density:'alta'});ok(g.bots.every(function(b){return!g.arena.blocked(b.x,b.y,b.radius)&&b.x>0&&b.x<g.arena.width;}));});});
  test('86. 40 bots por time criam 80 participantes',function(){var g=new EA.GameEngine({seed:'80',botsA:40,botsB:40,width:1600});ok(g.bots.length===80);});
  test('87. geração procedural possui limite de tentativas',function(){var g=new EA.GameEngine({seed:'attempts',density:'extrema',mapType:'caos'});ok(g.arena.generationAttempts<=24*30);});
  test('88. reiniciar reproduz mapa spawns e arquétipos',function(){var g=new EA.GameEngine({seed:'reset-v3',botsA:30,botsB:30,mapType:'aleatorio',spawnMode:'caos',archetypeModeA:'aleatoria'}),before=JSON.stringify({a:g.arena,b:g.bots.map(function(x){return[x.x,x.y,x.archetype];})});g.reset();ok(before===JSON.stringify({a:g.arena,b:g.bots.map(function(x){return[x.x,x.y,x.archetype];})}));});
  test('89. partida completa 40 contra 40 termina',function(){var g=new EA.GameEngine({seed:'full-80',botsA:40,botsB:40,strategyA:'random',strategyB:'random',turnLimit:80,width:1600});g.runFast();ok(g.finished&&g.turn<=80);});
  test('90. presets rápidos cobrem 5 a 40',function(){[5,10,20,30,40].forEach(function(n){var c=EA.battlePreset({seed:'p'+n},n);ok(c.botsA===n&&c.botsB===n);});});
  test('91. arquétipos alteram preferência de alvo',function(){var g=new EA.GameEngine({seed:'targets',botsA:1,botsB:3,archetypeModeA:'uniforme',archetypeA:'hunter'}),bot=g.living('A')[0],weak=g.living('B')[2];weak.hp=1;ok(g.targetFor(bot)===weak);});

  function run() {
    var list=document.getElementById('results'),summary=document.getElementById('summary'),start=performance.now(),passed=0;
    tests.forEach(function(t){var li=document.createElement('li');try{t.fn();passed+=1;li.className='pass';li.textContent='✓ '+t.name;}catch(e){li.className='fail';li.textContent='✗ '+t.name+' — '+e.message;}list.appendChild(li);});
    var previous=summary.textContent.match(/Aprovados: (\d+) · Reprovados: (\d+)/),oldPassed=previous?Number(previous[1]):0,oldFailed=previous?Number(previous[2]):0,total=35+tests.length,allPassed=oldPassed+passed,allFailed=oldFailed+(tests.length-passed);
    summary.textContent='Total: '+total+' · Aprovados: '+allPassed+' · Reprovados: '+allFailed+' · Tempo adicional: '+(performance.now()-start).toFixed(1)+' ms';
    document.title=(allFailed===0?'PASS':'FAIL')+' '+allPassed+'/'+total+' — Equation Arena';
  }
  run();
}(window.EA));
