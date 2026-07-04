// script.js (updated)
// Data
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

// player buttons
$all('.player-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $all('.player-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    players = parseInt(btn.dataset.players,10);
  });
});

// leeghwater toggle
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

  // Player Packs: ALWAYS create 4 packs (nation + startContract + officer)
  // Nations: use all 4 nations (fixed order randomized)
  const nations = shuffle(data.nations); // shuffle to randomize nation order
  // Start contracts: pick 4 (there are 4 available)
  const starts = pickN(data.startContracts, Math.min(4, data.startContracts.length));
  // If there are fewer than 4 startContracts in data, allow repeats to fill to 4
  while(starts.length < 4){
    starts.push(...pickN(data.startContracts, 4 - starts.length));
  }
  // Officers: pick 4 distinct officers from 7
  const officers = pickN(data.officers,4);

  // Build exactly 4 packs
  const packs = [];
  for(let i=0;i<4;i++){
    packs.push({
      slot: i+1,                 // slot number 1..4 (available combinations)
      nation: nations[i],
      startContract: starts[i],
      officer: officers[i],
      assignedToPlayer: (i < players) ? (i+1) : null // if players<4, only first N slots are assigned
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
    const header = document.createElement('div');
    header.innerHTML = `<strong>Slot ${p.slot}</strong> ${p.assignedToPlayer
