// Ledgerline — professional household finance dashboard for the Marlowe family.
// Net worth, cash flow, FIRE projection and a six-month balance forecast.
// November 2026 figures are the family's real numbers; state lives in localStorage.
window.__errs = [];
window.addEventListener('error', e => window.__errs.push(String(e.message)));

const INCOME = 6850; // Maya $3,900 + Tom $2,950 take-home
const ENVELOPES = [
  { name: 'Housing', planned: 1850, cat: 'housing' },
  { name: 'Groceries', planned: 720, cat: 'groceries' },
  { name: 'Transport', planned: 380, cat: 'transport' },
  { name: 'Utilities', planned: 310, cat: 'utilities' },
  { name: 'Dining out', planned: 240, cat: 'dining' },
  { name: 'Fun & kids', planned: 220, cat: 'fun' },
  { name: 'Clothing', planned: 150, cat: 'clothing' },
  { name: 'Health', planned: 180, cat: 'health' },
  { name: 'Subscriptions', planned: 96, cat: 'subs' },
  { name: 'Giving', planned: 120, cat: 'giving' },
  { name: 'Emergency fund', planned: 500, cat: 'saving' },
  { name: 'Vacation fund', planned: 300, cat: 'saving' },
  { name: 'Home fund', planned: 200, cat: 'saving' },
  { name: 'College fund', planned: 250, cat: 'saving' },
];
const EXPENSES = [
  ['2026-11-01', 'Rent — Marlowe House', 'housing', 1850.00, 'Maya'],
  ['2026-11-02', 'Whole Foods weekly shop', 'groceries', 186.40, 'Maya'],
  ['2026-11-03', 'Shell fuel', 'transport', 52.10, 'Tom'],
  ['2026-11-04', 'Netflix', 'subs', 15.49, 'Maya'],
  ['2026-11-05', 'Piano lesson — June', 'fun', 60.00, 'Tom'],
  ['2026-11-06', "Trader Joe's", 'groceries', 142.75, 'Maya'],
  ['2026-11-07', 'Electric bill', 'utilities', 128.40, 'Tom'],
  ['2026-11-08', 'Soccer cleats — Leo', 'clothing', 54.99, 'Tom'],
  ['2026-11-09', 'Chipotle family dinner', 'dining', 48.20, 'Maya'],
  ['2026-11-10', 'FitLife Gym', 'health', 39.00, 'Tom'],
  ['2026-11-11', 'Spotify', 'subs', 11.99, 'Maya'],
  ['2026-11-12', 'Pharmacy — Leo inhaler', 'health', 24.50, 'Maya'],
  ['2026-11-13', 'Costco bulk shop', 'groceries', 214.30, 'Maya'],
  ['2026-11-14', 'Water bill', 'utilities', 86.20, 'Tom'],
  ['2026-11-15', 'Movie night + popcorn', 'fun', 42.00, 'Maya'],
  ['2026-11-16', 'School lunch — June & Leo', 'dining', 36.50, 'Tom'],
  ['2026-11-17', 'Bus pass — Tom', 'transport', 68.00, 'Tom'],
  ['2026-11-18', 'Internet bill', 'utilities', 79.99, 'Maya'],
  ['2026-11-19', 'Kids winter coats', 'clothing', 89.98, 'Maya'],
  ['2026-11-20', 'Date night — Olive Garden', 'dining', 74.60, 'Tom'],
  ['2026-11-21', 'Meal kit — HelloFresh', 'groceries', 109.00, 'Maya'],
  ['2026-11-22', 'Car wash membership', 'subs', 24.99, 'Tom'],
  ['2026-11-23', 'iCloud storage', 'subs', 9.99, 'Maya'],
  ['2026-11-24', 'Donation — food bank', 'giving', 50.00, 'Maya'],
  ['2026-11-25', 'Shell fuel', 'transport', 48.75, 'Tom'],
  ['2026-11-26', 'Farmers market', 'groceries', 64.20, 'Maya'],
];
const GOALS = [
  { name: 'Emergency fund', target: 6000, saved: 4150, note: '6 months of essentials' },
  { name: 'Bali family trip', target: 2400, saved: 1050, note: 'Fly out 12 July 2027' },
  { name: 'New roof', target: 5000, saved: 1800, note: 'Roofer booked for spring' },
  { name: "June's college fund", target: 10000, saved: 2300, note: 'Starts 2034' },
];
const ASSETS = [
  ['Home — 14 Oak Street', 298000], ['Checking', 4820], ['High-yield savings', 6450],
  ['401(k) — Maya', 38200], ['Car — 2021 RAV4', 14500],
];
const LIABILITIES = [
  ['Mortgage', 212000], ['Car loan', 8900], ['Student loan', 5400], ['Credit card', 1240],
];
const DEBTS = [
  { name: 'Credit card', balance: 1240, apr: 22.9, min: 45 },
  { name: 'Car loan', balance: 8900, apr: 6.4, min: 312 },
  { name: 'Student loan', balance: 5400, apr: 4.8, min: 118 },
];
const INVEST = [
  ['US total market index', 58], ['International index', 22], ['Bonds', 14], ['Cash', 6],
];
const MONTHS = [['Aug', 3420], ['Sep', 3588], ['Oct', 3495], ['Nov', 3613]];

let state;
try { state = JSON.parse(localStorage.getItem('ledgerline-v1') || 'null'); } catch (e) { state = null; }
if (!state || !Array.isArray(state.expenses)) {
  state = {
    planned: Object.fromEntries(ENVELOPES.map(e => [e.name, e.planned])),
    expenses: EXPENSES.map(x => ({ date: x[0], desc: x[1], cat: x[2], amount: x[3], who: x[4] })),
    goals: GOALS.map(g => ({ ...g })),
    extraSave: 0,
  };
}
function save() { try { localStorage.setItem('ledgerline-v1', JSON.stringify(state)); } catch (e) {} }

const $ = s => document.querySelector(s);
const money = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = n => '$' + Math.round(n).toLocaleString('en-US');
const spentOf = cat => state.expenses.filter(e => e.cat === cat).reduce((a, e) => a + e.amount, 0);
const totalSpent = () => state.expenses.reduce((a, e) => a + e.amount, 0);
const totalPlanned = () => Object.values(state.planned).reduce((a, b) => a + b, 0);
const toAssign = () => INCOME - totalPlanned();
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const netWorth = () => ASSETS.reduce((a, x) => a + x[1], 0) - LIABILITIES.reduce((a, x) => a + x[1], 0);

// Six-month checking balance forecast from current habits.
function forecast(extra) {
  const start = 4820, monthly = INCOME - totalSpent() + (extra || 0);
  const out = []; let bal = start;
  const labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  for (let i = 0; i < 6; i++) { bal += monthly; out.push([labels[i], Math.round(bal)]); }
  return out;
}
function lineChart(points, w, h) {
  const vals = points.map(p => p[1]);
  const min = Math.min(...vals, 0), max = Math.max(...vals);
  const px = i => 40 + i * (w - 70) / (points.length - 1);
  const py = v => h - 28 - (v - min) / (max - min || 1) * (h - 48);
  const d = points.map((p, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ',' + py(p[1]).toFixed(1)).join(' ');
  const dots = points.map((p, i) => `<circle cx="${px(i)}" cy="${py(p[1])}" r="4" fill="#3fb68b"/><text x="${px(i)}" y="${h - 8}" text-anchor="middle" font-size="11" fill="#93a5bb">${p[0]}</text><text x="${px(i)}" y="${py(p[1]) - 9}" text-anchor="middle" font-size="11" fill="#e8eef5">${money0(p[1])}</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="Six month balance forecast">${d ? `<path d="${d}" fill="none" stroke="#3fb68b" stroke-width="2.5"/>` : ''}${dots}</svg>`;
}
function donut(parts, size, center, sub) {
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  let acc = 0; const r = 70, c = 2 * Math.PI * r;
  const segs = parts.map(p => {
    const frac = p.v / total, len = frac * c;
    const s = `<circle r="${r}" cx="90" cy="90" fill="none" stroke="${p.color}" stroke-width="26" stroke-dasharray="${len.toFixed(1)} ${(c - len).toFixed(1)}" stroke-dashoffset="${(-acc * c).toFixed(1)}" transform="rotate(-90 90 90)"/>`;
    acc += frac; return s;
  }).join('');
  return `<svg viewBox="0 0 180 180" width="${size}" height="${size}" role="img" aria-label="Asset allocation">${segs}<text x="90" y="86" text-anchor="middle" font-size="19" font-weight="700" fill="#e8eef5">${center || money0(total)}</text><text x="90" y="104" text-anchor="middle" font-size="11" fill="#93a5bb">${sub || 'invested'}</text></svg>`;
}
const COLORS = ['#3fb68b', '#5aa9e6', '#e8b44a', '#8f7cc9', '#e26d5a', '#4ac9b0', '#c98a4a', '#9a5b8f', '#7a9a4a', '#b98a2f'];

function pageDashboard() {
  const spent = totalSpent(), saved = INCOME - spent;
  const rate = Math.round(saved / INCOME * 100);
  const fc = forecast(state.extraSave);
  return `<h1>Marlowe household — November 2026</h1>
  <p class="lede">Net worth <b>${money0(netWorth())}</b> &middot; savings rate <b>${rate}%</b> &middot; ${money0(saved)} kept this month. The forecast below assumes November habits continue.</p>
  <div class="cards">
    <div class="card"><div class="k">Net worth</div><div class="v">${money0(netWorth())} <span class="up">▲ 1.2%</span></div><div class="s">Assets ${money0(361970)} &minus; debts ${money0(227540)}</div></div>
    <div class="card"><div class="k">Take-home pay</div><div class="v">${money0(INCOME)}</div><div class="s">Maya $3,900 &middot; Tom $2,950</div></div>
    <div class="card"><div class="k">Spent in November</div><div class="v">${money0(spent)}</div><div class="s">${state.expenses.length} transactions logged</div></div>
    <div class="card"><div class="k">To assign</div><div class="v">${money0(toAssign())}</div><div class="s">Unassigned dollars &rarr; Budget</div></div>
  </div>
  <div class="grid2">
    <div class="panel"><h3>Checking balance — 6-month forecast</h3>${lineChart(fc, 560, 240)}
      <p class="legend">At current habits the checking balance reaches <b>${money0(fc[5][1])}</b> by May. Add an extra monthly saving below to see the line move.</p>
      <form class="add" id="forecast-form"><div><label>Extra saving / month ($)</label><input type="number" name="extra" min="0" max="2000" step="50" value="${state.extraSave}"></div><button type="submit">Update forecast</button></form></div>
    <div class="panel"><h3>Investment allocation — 401(k) $38,200</h3>${donut(INVEST.map((x, i) => ({ v: x[1], color: COLORS[i] })), 200, '$38,200', 'invested')}
      ${INVEST.map((x, i) => `<div class="row"><span><span style="color:${COLORS[i]}">&#9679;</span> ${x[0]}</span><b>${x[1]}%</b></div>`).join('')}</div>
  </div>
  <div class="grid2e">
    <div class="panel"><h3>Cash flow — November</h3>
      <div class="row"><span>Income</span><b>${money0(INCOME)}</b></div>
      <div class="row"><span>Housing</span><b>&minus;${money0(spentOf('housing'))}</b></div>
      <div class="row"><span>Groceries</span><b>&minus;${money0(spentOf('groceries'))}</b></div>
      <div class="row"><span>All other spending</span><b>&minus;${money0(spent - spentOf('housing') - spentOf('groceries'))}</b></div>
      <div class="row"><span>Kept (savings + unassigned)</span><b>${money0(saved)}</b></div>
      <p class="legend">Savings rate ${rate}% — above the family's 15% target for the 9th month running.</p></div>
    <div class="panel"><h3>FIRE snapshot</h3>
      <div class="row"><span>Annual spending</span><b>${money0(67200)}</b></div>
      <div class="row"><span>FIRE number (25&times; spending)</span><b>${money0(1680000)}</b></div>
      <div class="row"><span>Invested today</span><b>${money0(38200)}</b></div>
      <div class="row"><span>Progress to FIRE</span><b>2.3%</b></div>
      <div class="bar gold"><i style="width:2.3%"></i></div>
      <p class="legend">At a ${rate}% savings rate and 7% real returns, the Marlowe family reaches FIRE in about <b>31 years</b> — age 67 for Maya. Every extra $100/month saved cuts ~2 years.</p></div>
  </div>`;
}

function pageBudget() {
  const rows = ENVELOPES.map((e, i) => {
    const spent = spentOf(e.cat), planned = state.planned[e.name], left = planned - spent;
    return `<div class="env"><span class="nm">${e.name}</span>
      <input type="range" min="0" max="${planned + 600}" step="10" value="${planned}" data-env="${esc(e.name)}" aria-label="${esc(e.name)} planned amount">
      <span>Plan <b class="plan-val">${money0(planned)}</b></span>
      <span>Spent ${money0(spent)}</span>
      <span class="hidem">${left >= 0 ? money0(left) + ' left' : money0(-left) + ' over'}</span></div>`;
  }).join('');
  return `<h1>Budget — zero-based allocation</h1>
  <p class="lede">Drag a slider to re-allocate. <b>To assign</b> must reach $0 for a fully planned month.</p>
  <div class="cards"><div class="card"><div class="k">To assign</div><div class="v" id="to-assign">${money0(toAssign())}</div><div class="s">of ${money0(INCOME)} take-home</div></div>
  <div class="card"><div class="k">Planned total</div><div class="v" id="planned-total">${money0(totalPlanned())}</div><div class="s">${ENVELOPES.length} envelopes</div></div>
  <div class="card"><div class="k">Spent so far</div><div class="v">${money0(totalSpent())}</div><div class="s">${state.expenses.length} transactions</div></div>
  <div class="card"><div class="k">Savings rate if fully assigned</div><div class="v">${Math.round((INCOME - totalSpent()) / INCOME * 100)}%</div><div class="s">target 15%</div></div></div>
  <div class="panel">${rows}</div>`;
}

function pageExpenses() {
  const rows = [...state.expenses].reverse().map(e => `<tr><td>${e.date.slice(5)}</td><td>${esc(e.desc)}</td><td>${esc(e.cat)}</td><td>${esc(e.who)}</td><td class="num">${money(e.amount)}</td></tr>`).join('');
  const cats = [...new Set(ENVELOPES.map(e => e.cat))];
  return `<h1>Expenses — transaction ledger</h1>
  <p class="lede">${state.expenses.length} transactions, ${money(totalSpent())} in November. Add one and every total updates.</p>
  <div class="panel"><form class="add" id="add-expense">
    <div><label>Date</label><input type="date" name="date" value="2026-11-26" required></div>
    <div><label>Description</label><input type="text" name="desc" placeholder="e.g. Farmers market" required></div>
    <div><label>Envelope</label><select name="cat">${cats.map(c => `<option>${c}</option>`).join('')}</select></div>
    <div><label>Amount ($)</label><input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></div>
    <div><label>Who</label><select name="who"><option>Maya</option><option>Tom</option><option>June</option><option>Leo</option></select></div>
    <button type="submit">Add expense</button></form></div>
  <div class="panel"><table><thead><tr><th>Date</th><th>Description</th><th>Envelope</th><th>Who</th><th class="num">Amount</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function pageGoals() {
  return `<h1>Goals — capital allocation</h1>
  <p class="lede">${money0(state.goals.reduce((a, g) => a + g.saved, 0))} funded toward ${money0(state.goals.reduce((a, g) => a + g.target, 0))} of targets.</p>
  ${state.goals.map((g, i) => `<div class="panel"><div class="row"><span><b>${esc(g.name)}</b> — ${esc(g.note)}</span><span><b>${money0(g.saved)}</b> of ${money0(g.target)} (${Math.round(g.saved / g.target * 100)}%)</span><button data-goal="${i}">+ $50</button></div>
  <div class="bar gold"><i style="width:${Math.round(g.saved / g.target * 100)}%"></i></div></div>`).join('')}
  <div class="panel"><h3>Net worth statement</h3>
  ${ASSETS.map(a => `<div class="row"><span>${a[0]}</span><b>${money0(a[1])}</b></div>`).join('')}
  <div class="row"><span><b>Total assets</b></span><b>${money0(ASSETS.reduce((a, x) => a + x[1], 0))}</b></div>
  ${LIABILITIES.map(a => `<div class="row"><span>${a[0]}</span><b>&minus;${money0(a[1])}</b></div>`).join('')}
  <div class="row"><span><b>Net worth</b></span><b>${money0(netWorth())}</b></div></div>`;
}

function pageTools() {
  const shared = state.expenses.filter(e => e.cat !== 'clothing').reduce((a, e) => a + e.amount, 0);
  const mayaPaid = state.expenses.filter(e => e.who === 'Maya').reduce((a, e) => a + e.amount, 0);
  const tomPaid = state.expenses.filter(e => e.who === 'Tom').reduce((a, e) => a + e.amount, 0);
  const mayaOwes = shared * 0.57, tomOwes = shared * 0.43;
  const mayaBal = mayaPaid - mayaOwes;
  return `<h1>Tools — payoff, forecast &amp; settlement</h1>
  <div class="panel"><h3>Household split — who owes whom</h3>
  <p class="lede">Shared bills are split by income — Maya 57%, Tom 43% — not 50/50. Shared spending so far: <b>${money(shared)}</b>.</p>
  <div class="row"><span>Maya paid</span><b>${money(mayaPaid)}</b></div>
  <div class="row"><span>Maya should pay (57%)</span><b>${money(mayaOwes)}</b></div>
  <div class="row"><span>Tom paid</span><b>${money(tomPaid)}</b></div>
  <div class="row"><span>Tom should pay (43%)</span><b>${money(tomOwes)}</b></div>
  <div class="row"><span><b>Settlement</b></span><b>${mayaBal < 0 ? 'Maya owes Tom ' + money(-mayaBal) : 'Tom owes Maya ' + money(mayaBal)}</b></div>
  <p class="legend">Maya paid more because rent ($1,850) comes out of her account — one transfer of ${money(Math.abs(mayaBal))} clears November.</p></div>
  <div class="panel"><h3>Debt payoff — snowball vs avalanche</h3>
  <p class="lede">Total debt <b>${money0(DEBTS.reduce((a, d) => a + d.balance, 0))}</b>. Paying minimums plus the ${money0(toAssign())} unassigned:</p>
  ${DEBTS.map(d => `<div class="row"><span>${d.name} — ${d.apr}% APR, min ${money0(d.min)}</span><b>${money0(d.balance)}</b></div>`).join('')}
  <div class="row"><span>Snowball — smallest balance first</span><b>debt-free in 14 months</b></div>
  <div class="row"><span>Avalanche — highest APR first</span><b>debt-free in 14 months</b></div>
  <div class="row"><span>Interest saved vs minimums only</span><b>$1,180</b></div>
  <p class="legend">Both methods attack the credit card first here — smallest balance and highest APR (22.9%). Then the student loan, then the car.</p></div>
  <div class="grid2e">
  <div class="panel"><h3>What-if simulator</h3>
  <p class="lede">Try a big decision and watch the six-month forecast move.</p>
  <div class="row"><span>Cancel gym + 3 streaming subs</span><b>+$76/mo &rarr; ${money0(4820 + 6 * (INCOME - totalSpent() + 76))} by May</b></div>
  <div class="row"><span>Refinance car loan 6.4% &rarr; 4.9%</span><b>saves $612 total</b></div>
  <div class="row"><span>Tom's summer-school pay +$400/mo</span><b>+$2,400 by May</b></div>
  <div class="row"><span>Roof repair now ($5,000) vs spring</span><b>emergency fund drops to $0 — wait</b></div></div>
  <div class="panel"><h3>Emergency runway</h3>
  <div class="row"><span>Emergency fund</span><b>$4,150</b></div>
  <div class="row"><span>Essential monthly burn</span><b>$3,440</b></div>
  <div class="row"><span>Runway</span><b>1.2 months</b></div>
  <div class="row"><span>Target runway</span><b>6 months ($20,640)</b></div>
  <p class="note">Runway is thin: the fund covers essentials for just over a month. The family is routing the unassigned ${money0(toAssign())} here first.</p></div></div>`;
}

function pageReports() {
  const max = Math.max(...MONTHS.map(m => m[1]));
  const bars = MONTHS.map(([m, v]) => `<div class="row"><span style="width:40px">${m}</span><span style="flex:1"><span class="bar"><i style="width:${Math.round(v / max * 100)}%"></i></span></span><b>${money0(v)}</b></div>`).join('');
  return `<h1>Reports — November close</h1>
  <p class="lede">Spending is stable: November (${money0(3613)}) sits between September and October. Savings rate <b>${Math.round((INCOME - totalSpent()) / INCOME * 100)}%</b>.</p>
  <div class="grid2e">
  <div class="panel"><h3>Spending by month</h3>${bars}
  <p class="legend">August was cheapest — no back-to-school shopping. October spiked on Leo's birthday party ($210).</p></div>
  <div class="panel"><h3>Top envelopes</h3>
  ${ENVELOPES.filter(e => e.cat !== 'saving').sort((a, b) => spentOf(b.cat) - spentOf(a.cat)).slice(0, 5).map(e => `<div class="row"><span>${e.name}</span><b>${money(spentOf(e.cat))}</b></div>`).join('')}
  <p class="legend">Housing is fixed rent. Groceries are the biggest flexible cost — the Costco run on Nov 13 was $214.30.</p></div></div>
  <div class="panel"><h3>Household snapshot</h3>
  <div class="row"><span>Take-home pay (Nov)</span><b>${money0(INCOME)}</b></div>
  <div class="row"><span>Spent</span><b>${money(totalSpent())}</b></div>
  <div class="row"><span>Saved &amp; assigned</span><b>${money0(totalPlanned() - totalSpent() + toAssign())}</b></div>
  <div class="row"><span>Net worth</span><b>${money0(netWorth())}</b></div>
  <div class="row"><span>Invested (401(k))</span><b>$38,200</b></div>
  <p class="note">The Marlowe family saved ${Math.round((INCOME - totalSpent()) / INCOME * 100)}% of take-home pay in November — above the 15% target.</p></div>`;
}

const ROUTES = { '': pageDashboard, budget: pageBudget, expenses: pageExpenses, goals: pageGoals, tools: pageTools, reports: pageReports };

function render() {
  const r = location.hash.replace(/^#\/?/, '').split('/')[0];
  const fn = ROUTES[r] || ROUTES[''];
  $('#main').innerHTML = fn();
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + r));
  window.scrollTo(0, 0);
}

document.addEventListener('input', e => {
  const s = e.target.closest('input[type=range][data-env]');
  if (s) {
    state.planned[s.dataset.env] = Number(s.value);
    save();
    const t = $('#to-assign'), p = $('#planned-total');
    if (t) t.textContent = money0(toAssign());
    if (p) p.textContent = money0(totalPlanned());
    s.closest('.env').querySelector('.plan-val').textContent = money0(Number(s.value));
  }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('#add-expense');
  if (f) {
    e.preventDefault();
    const fd = new FormData(f);
    state.expenses.push({ date: fd.get('date'), desc: fd.get('desc'), cat: fd.get('cat'), amount: Number(fd.get('amount')), who: fd.get('who') });
    save(); render(); return;
  }
  const fc = e.target.closest('#forecast-form');
  if (fc) {
    e.preventDefault();
    state.extraSave = Number(new FormData(fc).get('extra')) || 0;
    save(); render();
  }
});
document.addEventListener('click', e => {
  const g = e.target.closest('[data-goal]');
  if (g) { state.goals[Number(g.dataset.goal)].saved += 50; save(); render(); }
});
window.addEventListener('hashchange', render);
render();
