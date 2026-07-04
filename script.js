// script.js
const data = {
  bonusTiles: ["Bonus A","Bonus B","Bonus C","Bonus D","Bonus E","Bonus F"],
  advTech: ["Base I","Elevation I","Conduit I","Powerhouse I","Wildcard I"],
  objectives: ["Objective 1","Objective 2","Objective 3","Objective 4","Objective 5","Objective 6"],
  headstreams: ["Headstream A","Headstream B","Headstream C","Headstream D","Headstream E","Headstream F","Headstream G","Headstream H"],
  nationalContracts: ["Contract 1","Contract 2","Contract 3","Contract 4","Contract 5","Contract 6"],
  nations: ["Germany","France","Italy","USA"],
  startContracts: ["Start 1","Start 2","Start 3","Start 4"],
  officers: ["Wilhelm Adler","Graziano Del Monte","Viktor Fiesler","Jill McDowell","Solomon P. Jordan","Anton Krylov","Mahiri Sekibo"]
};

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function pickN(arr,n){
  return shuffle(arr).slice(0,n);
}

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

let players = 4;

$all('.player-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $all('.player-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    players = parseInt(btn.dataset.players,10);
  });
});

$('#leeghwaterToggle').addEventListener('change', e=>{
  $('#leeghwaterOptions').classList.toggle('hidden', !e.target.checked);
});

$('#randomBtn').addEventListener('click', generateAll);
$('#exportBtn').addEventListener('click', copySetup);

function generateAll(){
  // Bonus Tiles: pick 5 of 6, order I-V
  const bonus = pickN(data.bonusTiles,5);

  // Advanced Tech: pick 3 of 5
  const adv = pickN(data.advTech,3);

  // Objective: pick 1 of 6
  const obj = pickN(data.objectives,1)[0];

  // Headstream: pick 4 of 8, order Basin I-IV
  const head = pickN(data.headstreams,4);

  // National Contracts: players - 1 out of 6
  const nContracts = pickN(data.nationalContracts, Math.max(0, players-1));

  // Player Packs: create shuffled packs
  // Nations: choose players nations without duplicates (max 4)
  const nations = pickN(data.nations, players);
  // Start contracts: pick players start contracts (allow duplicates? We'll pick without duplicates up to 4)
  const starts = pickN(data.startContracts, players);
  // Officers: pick players officers (no duplicates)
  const officers = pickN(data.officers, players);

  const packs = [];
  for(let i=0;i<players;i++){
    packs.push({
      player: i+1,
      nation: nations[i],
      startContract: starts[i],
      officer: officers[i]
    });
  }

  // Render
  renderList('#bonusList', bonus.map((b,i)=>`${roman(i+1)}. ${b}`));
  renderList('#advTechList', adv);
  $('#objective').textContent = obj;
  renderList('#headstreamList', head.map((h,i)=>`Basin ${i+1}: ${h}`));
  renderList('#nationalContracts', nContracts);
  renderPacks(packs);

  // store last generated for export
  window.lastSetup = {players, bonus, adv, obj, head, nContracts, packs};
}

function renderList(selector, items){
  const el = $(selector);
  el.innerHTML = '';
  items.forEach(it=>{
    const li = document.createElement('li');
    li.textContent = it;
    el.appendChild(li);
  });
}

function renderPacks(packs){
  const container = $('#playerPacks');
  container.innerHTML = '';
  packs.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'pack';
    // image placeholders: assets/nations/{nation}.png and assets/officers/{officer}.png
    const nationImg = document.createElement('img');
    nationImg.src = `assets/images/nations/${slug(p.nation)}.png`;
    nationImg.alt = p.nation;
    nationImg.onerror = ()=>{ nationImg.src = 'assets/images/placeholder_nation.png'; };

    const officerImg = document.createElement('img');
    officerImg.src = `assets/images/officers/${slug(p.officer)}.png`;
    officerImg.alt = p.officer;
    officerImg.onerror = ()=>{ officerImg.src = 'assets/images/placeholder_officer.png'; };

    const info = document.createElement('div');
    info.innerHTML = `<strong>Player ${p.player}</strong><div>${p.nation} — ${p.startContract}</div><div>Officer: ${p.officer}</div>`;

    div.appendChild(nationImg);
    div.appendChild(officerImg);
    div.appendChild(info);
    container.appendChild(div);
  });
}

function copySetup(){
  if(!window.lastSetup){ alert('Please generate a setup first.'); return; }
  const s = window.lastSetup;
  let text = `Barrage Random Setup — ${s.players} players\n\nBonus Tiles (I-V):\n`;
  s.bonus.forEach((b,i)=> text += `${roman(i+1)}. ${b}\n`);
  text += `\nAdvanced Tech Tiles:\n${s.adv.join(', ')}\n\nObjective:\n${s.obj}\n\nHeadstream Tiles:\n`;
  s.head.forEach((h,i)=> text += `Basin ${i+1}: ${h}\n`);
  text += `\nNational Contracts:\n${s.nContracts.join(', ')}\n\nPlayer Packs:\n`;
  s.packs.forEach(p=> text += `Player ${p.player}: ${p.nation} / ${p.startContract} / ${p.officer}\n`);
  navigator.clipboard.writeText(text).then(()=> alert('Setup copied to clipboard.'));
}

// helpers
function slug(name){ return name.toLowerCase().replace(/\s+/g,'_').replace(/[^\w\-]/g,''); }
function roman(n){
  const romans = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  return romans[n-1] || n;
}

// initial generate
generateAll();
