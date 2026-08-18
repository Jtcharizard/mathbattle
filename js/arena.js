(function (EA) {
  'use strict';
  function Arena(config,rng){var map=new EA.MapGenerator(config,rng).generate();this.type=map.type;this.width=map.width;this.height=map.height;this.ground=map.ground;this.obstacles=map.obstacles;this.playableWidth=map.playableWidth;this.generationAttempts=map.generationAttempts;}
  Arena.prototype.blocked=function(x,y,radius){return this.obstacles.some(function(o){return x+radius>o.x&&x-radius<o.x+o.w&&y+radius>o.y&&y-radius<o.y+o.h;});};
  Arena.prototype.createBots=function(config,rng){var bots=[],total=config.botsA+config.botsB,radius=total>60?5:total>36?6:total>20?8:total>12?9:12,spawner=new EA.SpawnManager(this,config,rng),team,count,positions,i,bot,mode,fixed;for(team=0;team<2;team+=1){count=team?config.botsB:config.botsA;positions=spawner.positions(team?'B':'A',count,radius,bots);positions.sort(function(a,b){return team?a.x-b.x:b.x-a.x;});mode=team?config.archetypeModeB:config.archetypeModeA;fixed=team?config.archetypeB:config.archetypeA;for(i=0;i<count;i+=1){bot=new EA.Bot({id:(team?'B':'A')+(i+1),name:'Bot '+(team?'B':'A')+(i+1),team:team?'B':'A',strategy:team?config.strategyB:config.strategyA,x:positions[i].x,y:positions[i].y,radius:radius,hp:config.hp,color:team?'#ff3d9a':'#32e6ff'});EA.assignArchetype(bot,mode,fixed,i,rng);bots.push(bot);}}return bots;};
  EA.Arena=Arena;
}(window.EA));
