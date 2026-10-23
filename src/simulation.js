const fs = require('fs');
const path = require('path');
const config = require('./config');

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function initFreshState(graph) {
  const N = graph.totalTerritories;
  const territoryOwner = Array.from({ length: N }, (_, i) => i);
  const factions = graph.territories.map((t, i) => ({
    id: i,
    name: t.name,
    province: t.province,
    color: t.color,
    territoryCount: 1,
    eliminated: false,
    eliminatedInRound: null,
    eliminatedBy: null
  }));

  return {
    round: 0,
    year: config.START_YEAR,
    month: config.START_MONTH,
    activeFactionsCount: N,
    territoryOwner,
    factions,
    lastBattle: null,
    gameOver: false,
    winner: null,
    history: []
  };
}

function loadState(graph) {
  if (fs.existsSync(config.PATHS.STATE)) {
    try {
      return JSON.parse(fs.readFileSync(config.PATHS.STATE, 'utf8'));
    } catch {
      console.warn('Corrupt state.json detected. Re-initializing fresh state.');
    }
  }
  const fresh = initFreshState(graph);
  saveState(fresh);
  return fresh;
}

function saveState(state) {
  fs.mkdirSync(path.dirname(config.PATHS.STATE), { recursive: true });
  fs.writeFileSync(config.PATHS.STATE, JSON.stringify(state, null, 2));
}

function resetState(graph) {
  const fresh = initFreshState(graph);
  saveState(fresh);
  return fresh;
}

function runBattleTurn(graph, state) {
  if (state.gameOver) {
    return {
      gameOver: true,
      winner: state.winner,
      message: `Perang telah berakhir! ${state.winner.name} telah menaklukkan seluruh Indonesia!`
    };
  }

  // Advance time
  state.round++;
  state.month++;
  if (state.month > 12) {
    state.month = 1;
    state.year++;
  }
  const dateStr = `${MONTH_NAMES[state.month - 1]} ${state.year}`;

  const activeFactions = state.factions.filter(f => !f.eliminated);
  if (activeFactions.length <= 1) {
    state.gameOver = true;
    state.winner = activeFactions[0] || state.factions[0];
    saveState(state);
    return {
      gameOver: true,
      winner: state.winner,
      date: dateStr,
      round: state.round
    };
  }

  // Pick an active faction weighted slightly by territory count
  // (gives expansive empires active fronts while keeping underdog chances)
  let atkFaction = null;
  let borders = [];
  let attempts = 0;

  while (borders.length === 0 && attempts < 100) {
    attempts++;
    atkFaction = activeFactions[Math.floor(Math.random() * activeFactions.length)];

    borders = [];
    for (let tId = 0; tId < graph.totalTerritories; tId++) {
      if (state.territoryOwner[tId] === atkFaction.id) {
        for (const neighborId of graph.adjacency[tId]) {
          const neighborOwner = state.territoryOwner[neighborId];
          if (neighborOwner !== atkFaction.id) {
            borders.push({
              from: tId,
              to: neighborId,
              targetOwner: neighborOwner
            });
          }
        }
      }
    }
  }

  if (borders.length === 0) {
    throw new Error('No viable border found across active factions.');
  }

  // Select target border
  const battleTarget = borders[Math.floor(Math.random() * borders.length)];
  const defFaction = state.factions[battleTarget.targetOwner];
  const atkTerritory = graph.territories[battleTarget.from];
  const defTerritory = graph.territories[battleTarget.to];

  // Combat calculation
  const atkCount = atkFaction.territoryCount;
  const defCount = defFaction.territoryCount;
  const winChance = Math.max(
    0.35,
    Math.min(0.85, config.ATTACKER_BASE_WIN_RATE + (atkCount - defCount) * config.SIZE_BONUS_FACTOR)
  );
  const success = Math.random() < winChance;

  let eliminated = null;
  if (success) {
    state.territoryOwner[battleTarget.to] = atkFaction.id;
    atkFaction.territoryCount++;
    defFaction.territoryCount--;

    if (defFaction.territoryCount === 0) {
      defFaction.eliminated = true;
      defFaction.eliminatedInRound = state.round;
      defFaction.eliminatedBy = atkFaction.id;
      state.activeFactionsCount--;
      eliminated = {
        id: defFaction.id,
        name: defFaction.name,
        province: defFaction.province
      };
    }
  }

  // Check victory condition
  if (state.activeFactionsCount === 1) {
    state.gameOver = true;
    state.winner = atkFaction;
  }

  const battleEvent = {
    round: state.round,
    date: dateStr,
    monthNumber: state.month,
    yearNumber: state.year,
    atkFaction: {
      id: atkFaction.id,
      name: atkFaction.name,
      province: atkFaction.province,
      color: atkFaction.color,
      count: atkFaction.territoryCount
    },
    defFaction: {
      id: defFaction.id,
      name: defFaction.name,
      province: defFaction.province,
      color: defFaction.color,
      count: defFaction.territoryCount
    },
    atkTerritory: {
      id: atkTerritory.id,
      name: atkTerritory.name,
      province: atkTerritory.province,
      cScreen: atkTerritory.cScreen
    },
    defTerritory: {
      id: defTerritory.id,
      name: defTerritory.name,
      province: defTerritory.province,
      cScreen: defTerritory.cScreen
    },
    success,
    eliminated,
    activeFactionsCount: state.activeFactionsCount,
    gameOver: state.gameOver,
    winner: state.winner ? { id: state.winner.id, name: state.winner.name } : null
  };

  state.lastBattle = battleEvent;
  state.history.unshift({
    round: state.round,
    date: dateStr,
    atk: atkFaction.name,
    def: defTerritory.name,
    success,
    elim: eliminated ? eliminated.name : null
  });
  if (state.history.length > 50) state.history.pop();

  saveState(state);
  return battleEvent;
}

function getTopFactions(state, limit = 10) {
  return [...state.factions]
    .filter(f => !f.eliminated && f.territoryCount > 0)
    .sort((a, b) => b.territoryCount - a.territoryCount)
    .slice(0, limit);
}

module.exports = {
  loadState,
  saveState,
  resetState,
  runBattleTurn,
  getTopFactions,
  MONTH_NAMES
};
