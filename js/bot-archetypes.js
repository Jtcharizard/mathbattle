(function (EA) {
  'use strict';
  var order = ['sniper','rusher','tank','hunter','avenger','berserker','genius','chaos','commander'];
  var data = {
    sniper:{label:'Sniper',precision:1.35,aggression:.7,decision:1.4,risk:.55,target:'distant'},
    rusher:{label:'Rusher',precision:.72,aggression:1.4,decision:.6,risk:1.35,target:'near'},
    tank:{label:'Tank',precision:.9,aggression:.65,decision:1,risk:.35,target:'near'},
    hunter:{label:'Hunter',precision:1.05,aggression:1.2,decision:.9,risk:.9,target:'weak'},
    avenger:{label:'Avenger',precision:1,aggression:1.15,decision:.9,risk:1,target:'attacker'},
    berserker:{label:'Berserker',precision:.85,aggression:1.1,decision:.7,risk:1.5,target:'near'},
    genius:{label:'Genius',precision:1.55,aggression:.9,decision:1.6,risk:.65,target:'threat'},
    chaos:{label:'Chaos Bot',precision:.55,aggression:1,decision:.5,risk:1.8,target:'chaos'},
    commander:{label:'Commander',precision:1.15,aggression:.9,decision:1.25,risk:.6,target:'threat'}
  };
  function choose(mode,fixed,index,rng){if(mode==='uniforme')return data[fixed]?fixed:'rusher';if(mode==='personalizada')return index%3===0&&data[fixed]?fixed:order[index%order.length];if(mode==='aleatoria')return rng.pick(order);return order[index%order.length];}
  EA.assignArchetype=function(bot,mode,fixed,index,rng){bot.archetype=choose(mode,fixed,index,rng);bot.archetypeData=data[bot.archetype];return bot.archetype;};
  EA.rankTargets=function(bot,enemies,rng){var profile=bot.archetypeData||data.rusher,hpRatio=bot.hp/bot.maxHp;return enemies.map(function(enemy){var distance=EA.distance(bot,enemy),score=0;if(profile.target==='distant')score=distance;if(profile.target==='near')score=-distance;if(profile.target==='weak')score=-enemy.hp*5-distance*.1;if(profile.target==='attacker')score=(enemy===bot.lastAttacker?5000:0)-distance;if(profile.target==='threat')score=enemy.damage*8+enemy.kills*300-enemy.hp*.2;if(profile.target==='chaos')score=rng.range(-1000,1000);if(bot.archetype==='berserker')score+=(1-hpRatio)*(600-distance);return{enemy:enemy,score:score};}).sort(function(a,b){return b.score-a.score;}).map(function(item){return item.enemy;});};
  EA.ARCHETYPES=data;EA.ARCHETYPE_ORDER=order;
}(window.EA));
