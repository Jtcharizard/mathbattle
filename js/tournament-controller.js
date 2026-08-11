(function (EA) {
  'use strict';

  function emptySummary(total) {
    return {
      games: 0,
      totalGames: total,
      wins: { A: 0, B: 0, Empate: 0 },
      stats: { damageA: 0, damageB: 0, hitsA: 0, hitsB: 0, killsA: 0, killsB: 0 },
      lastGame: null,
      completed: false
    };
  }

  function TournamentController(options) {
    options = options || {};
    this.createGame = options.createGame || function (config) { return new EA.GameEngine(config); };
    this.schedule = options.schedule || function (callback) { return window.setTimeout(callback, 0); };
    this.cancelSchedule = options.cancelSchedule || function (id) { window.clearTimeout(id); };
    this.scheduleId = null;
    this.cancelled = false;
    this.summary = null;
  }

  TournamentController.prototype.cancel = function () {
    this.cancelled = true;
    if (this.scheduleId !== null) this.cancelSchedule(this.scheduleId);
    this.scheduleId = null;
  };

  TournamentController.prototype.configForMatch = function (base, index) {
    var config = Object.assign({}, base);
    config.seed = base.seed + '-T' + index;
    config.mode = 'exibicao';
    if (index % 2 === 1) {
      config.strategyA = base.strategyB;
      config.strategyB = base.strategyA;
    }
    return config;
  };

  TournamentController.prototype.record = function (match) {
    var stats = this.summary.stats;
    this.summary.games += 1;
    this.summary.wins[match.winner] += 1;
    stats.damageA += match.teamStats.A.damage;
    stats.damageB += match.teamStats.B.damage;
    stats.hitsA += match.teamStats.A.hits;
    stats.hitsB += match.teamStats.B.hits;
    stats.killsA += match.teamStats.A.kills;
    stats.killsB += match.teamStats.B.kills;
    this.summary.lastGame = match;
  };

  TournamentController.prototype.playMatch = function (base, index) {
    var match = this.createGame(this.configForMatch(base, index));
    if (!match || !match.arena) throw new Error('O motor não criou uma arena válida para o torneio.');
    match.runFast();
    if (!match.finished || ['A', 'B', 'Empate'].indexOf(match.winner) < 0) {
      throw new Error('A partida do torneio não produziu um resultado válido.');
    }
    this.record(match);
    return match;
  };

  TournamentController.prototype.prepare = function (config) {
    this.cancel();
    this.cancelled = false;
    this.baseConfig = EA.cleanConfig(config);
    this.summary = emptySummary(this.baseConfig.tournamentGames);
    return this.summary;
  };

  TournamentController.prototype.runAll = function (config) {
    var i;
    this.prepare(config);
    for (i = 0; i < this.summary.totalGames; i += 1) this.playMatch(this.baseConfig, i);
    this.summary.completed = true;
    return this.summary;
  };

  TournamentController.prototype.start = function (config, callbacks) {
    var self = this;
    callbacks = callbacks || {};
    this.prepare(config);
    function next() {
      if (self.cancelled) return;
      try {
        self.playMatch(self.baseConfig, self.summary.games);
        if (callbacks.progress) callbacks.progress(self.summary);
        if (self.summary.games >= self.summary.totalGames) {
          self.summary.completed = true;
          self.scheduleId = null;
          if (callbacks.complete) callbacks.complete(self.summary);
          return;
        }
        self.scheduleId = self.schedule(next);
      } catch (error) {
        self.scheduleId = null;
        if (callbacks.error) callbacks.error(error);
        else throw error;
      }
    }
    this.scheduleId = this.schedule(next);
    return this.summary;
  };

  TournamentController.formatSummary = function (summary) {
    var w = summary.wins, s = summary.stats;
    return 'Partidas: ' + summary.games + '/' + summary.totalGames +
      ' · Vitórias A: ' + w.A + ' · B: ' + w.B + ' · Empates: ' + w.Empate +
      ' | Dano A/B: ' + s.damageA + '/' + s.damageB +
      ' · Acertos: ' + s.hitsA + '/' + s.hitsB +
      ' · Eliminações: ' + s.killsA + '/' + s.killsB;
  };

  EA.TournamentController = TournamentController;
}(window.EA));
