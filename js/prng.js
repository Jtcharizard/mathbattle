(function (g) {
  'use strict';
  function hashSeed(value) { var s = String(value), h = 2166136261 >>> 0, i; for (i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0 || 1; }
  function PRNG(seed) { this.seed = String(seed); this.state = hashSeed(this.seed); }
  PRNG.prototype.next = function () { var t = this.state += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  PRNG.prototype.range = function (min, max) { return min + this.next() * (max - min); };
  PRNG.prototype.int = function (min, max) { return Math.floor(this.range(min, max + 1)); };
  PRNG.prototype.pick = function (items) { return items[this.int(0, items.length - 1)]; };
  PRNG.prototype.gaussian = function () { var u = Math.max(this.next(), 1e-9), v = this.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  g.EA = g.EA || {}; g.EA.PRNG = PRNG; g.EA.hashSeed = hashSeed;
}(window));
