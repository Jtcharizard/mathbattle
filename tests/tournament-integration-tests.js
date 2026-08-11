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

  function run() {
    var list=document.getElementById('results'),summary=document.getElementById('summary'),start=performance.now(),passed=0;
    tests.forEach(function(t){var li=document.createElement('li');try{t.fn();passed+=1;li.className='pass';li.textContent='✓ '+t.name;}catch(e){li.className='fail';li.textContent='✗ '+t.name+' — '+e.message;}list.appendChild(li);});
    var previous=summary.textContent.match(/Aprovados: (\d+) · Reprovados: (\d+)/),oldPassed=previous?Number(previous[1]):0,oldFailed=previous?Number(previous[2]):0,total=35+tests.length,allPassed=oldPassed+passed,allFailed=oldFailed+(tests.length-passed);
    summary.textContent='Total: '+total+' · Aprovados: '+allPassed+' · Reprovados: '+allFailed+' · Tempo adicional: '+(performance.now()-start).toFixed(1)+' ms';
    document.title=(allFailed===0?'PASS':'FAIL')+' '+allPassed+'/'+total+' — Equation Arena';
  }
  run();
}(window.EA));
