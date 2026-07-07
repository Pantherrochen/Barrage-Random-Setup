// script.js (updated)
// Data
const data = {
  bonusTiles: ["Bonus A","Bonus B","Bonus C","Bonus D","Bonus E","Bonus F"],
  advTech: ["Base I","Elevation I","Conduit I","Powerhouse I","Wildcard I"],
  objectives: ["Objective 1","Objective 2","Objective 3","Objective 4","Objective 5","Objective 6"],
  headstreams: ["Headstream A","Headstream B","Headstream C","Headstream D","Headstream E","Headstream F","Headstream G","Headstream H"],
  nationalContracts: ["Contract 1","Contract 2","Contract 3","Contract 4","Contract 5","Contract 6"],
  nations: ["Germany","France","Italy","USA"],
  additionalNations: ["Netherlands"],
  startContracts: ["Start 1","Start 2","Start 3","Start 4"],
  officers: ["Wilhelm Adler","Graziano Del Monte","Victor Fiesler","Jill McDowell","Solomon P Jordan","Anton Krylov","Mahiri Sekibo"],
  additionalOfficers: ["Simone Luciani","Tommaso Battista"]
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
  // Nations: default 4 of 4, or 4 of 5 when additional nations are enabled
  const includeAdditionalNations = $('#additionalNationsToggle').checked;
  const nationPool = includeAdditionalNations ? data.nations.concat(data.additionalNations) : data.nations;
  const nations = pickN(nationPool, 4);
  // Start contracts: pick 4 (there are 4 available)
  const starts = pickN(data.startContracts, Math.min(4, data.startContracts.length));
  // If there are fewer than 4 startContracts in data, allow repeats to fill to 4
  while(starts.length < 4){
    starts.push(...pickN(data.startContracts, 4 - starts.length));
  }
  // Officers: pick 4 distinct officers from base or expanded pool
  const officerPool = includeAdditionalNations ? data.officers.concat(data.additionalOfficers) : data.officers;
  const officers = pickN(officerPool,4);

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
  renderBonusTiles('#bonusList', bonus.map(b=>({label:b})));
  renderAdvTechTiles('#advTechList', adv.map(item=>({label:item})));
  renderObjectiveTile('#objective', obj);
  renderHeadstreamTiles('#headstreamList', head);
  renderNationalContractTiles('#nationalContracts', nContracts);
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

function renderBonusTiles(selector, items){
  const el = $(selector);
  el.innerHTML = '';
  items.forEach((item, index)=>{
    const li = document.createElement('li');
    li.className = 'bonus-tile-item';

    const numeral = document.createElement('span');
    numeral.className = 'bonus-tile-number';
    numeral.textContent = roman(index + 1);

    const img = document.createElement('img');
    img.className = 'bonus-tile-image';
    img.alt = item.label;
    setImageWithFallback(img, 'assets/images/bonustiles', getBonusTileFilename(item.label), 'assets/images/officers/placeholder_officer.png');

    li.appendChild(numeral);
    li.appendChild(img);
    el.appendChild(li);
  });
}

function renderAdvTechTiles(selector, items){
  const el = $(selector);
  el.innerHTML = '';
  items.forEach(item=>{
    const li = document.createElement('li');
    li.className = 'adv-tech-tile-item';

    const img = document.createElement('img');
    img.className = 'adv-tech-tile-image';
    img.alt = item.label;
    setImageWithFallback(img, 'assets/images/advancedtechnologytiles', getAdvTechTileFilename(item.label), 'assets/images/officers/placeholder_officer.png');

    li.appendChild(img);
    el.appendChild(li);
  });
}

function renderObjectiveTile(selector, objective){
  const el = $(selector);
  el.innerHTML = '';

  const img = document.createElement('img');
  img.className = 'objective-tile-image';
  img.alt = objective;
  setImageWithFallback(img, 'assets/images/objectivetiles', getObjectiveTileFilename(objective), 'assets/images/officers/placeholder_officer.png');

  el.appendChild(img);
}

function renderHeadstreamTiles(selector, items){
  const el = $(selector);
  el.innerHTML = '';

  items.forEach((item, index)=>{
    const li = document.createElement('li');
    li.className = 'headstream-tile-item';

    const numeral = document.createElement('span');
    numeral.className = 'headstream-tile-number';
    numeral.textContent = roman(index + 1);

    const img = document.createElement('img');
    img.className = 'headstream-tile-image';
    img.alt = `Headstream ${index + 1}`;
    setImageWithFallback(img, 'assets/images/headstream', getHeadstreamTileFilename(item), 'assets/images/officers/placeholder_officer.png');

    li.appendChild(numeral);
    li.appendChild(img);
    el.appendChild(li);
  });
}

function renderNationalContractTiles(selector, items){
  const el = $(selector);
  el.innerHTML = '';

  items.forEach(item=>{
    const li = document.createElement('li');
    li.className = 'national-contract-item';

    const img = document.createElement('img');
    img.className = 'national-contract-image';
    img.alt = item;
    setImageWithFallback(img, 'assets/images/nationalcontracts', getNationalContractFilename(item), 'assets/images/officers/placeholder_officer.png');

    li.appendChild(img);
    el.appendChild(li);
  });
}

function roman(num){
  const values = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const symbols = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  let remaining = num;

  for(let i=0;i<values.length;i++){
    while(remaining >= values[i]){
      result += symbols[i];
      remaining -= values[i];
    }
  }

  return result;
}

function slug(str){
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function copySetup(){
  if(!window.lastSetup){
    return;
  }

  const lines = [
    `Players: ${window.lastSetup.players}`,
    `Bonus Tiles: ${window.lastSetup.bonus.map((b,i)=>`${roman(i+1)}. ${b}`).join(', ')}`,
    `Advanced Tech: ${window.lastSetup.adv.join(', ')}`,
    `Objective: ${window.lastSetup.obj}`,
    `Headstreams: ${window.lastSetup.head.map((h,i)=>`Basin ${i+1}: ${h}`).join(', ')}`,
    `National Contracts: ${window.lastSetup.nContracts.join(', ')}`,
    `Packs: ${window.lastSetup.packs.map(p=>`Slot ${p.slot} (${p.nation}, ${p.startContract}, ${p.officer})`).join(' | ')}`
  ];

  const text = lines.join('\n');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>alert('Setup copied to clipboard!'));
  } else {
    window.prompt('Copy setup', text);
  }
}

function setImageWithFallback(img, directory, baseName, fallbackPath){
  const candidates = [...new Set([
    `${baseName}.svg`,
    `${baseName}.jpg`,
    `${baseName}.png`,
    `${baseName.replace(/\s+/g, '_')}.svg`,
    `${baseName.replace(/\s+/g, '_')}.jpg`,
    `${baseName.replace(/\s+/g, '_')}.png`,
    `${slug(baseName)}.svg`,
    `${slug(baseName)}.jpg`,
    `${slug(baseName)}.png`,
    `${baseName.replace(/\s+/g, ' ')}.svg`,
    `${baseName.replace(/\s+/g, ' ')}.jpg`,
    `${baseName.replace(/\s+/g, ' ')}.png`
  ].filter(Boolean))];

  let index = 0;
  const tryNext = ()=>{
    if(index >= candidates.length){
      img.src = fallbackPath;
      img.onerror = null;
      return;
    }

    img.src = `${directory}/${encodeURIComponent(candidates[index++])}`;
  };

  img.onerror = tryNext;
  tryNext();
}

function getFlagFilename(nation){
  const flagMap = {
    'France': 'flagfrance',
    'Germany': 'flaggermany',
    'Italy': 'flagitaly',
    'Netherlands': 'flagnetherlands',
    'USA': 'flagusa'
  };
  return flagMap[nation] || nation;
}

function getBonusTileFilename(tileName){
  const map = {
    'Bonus A': 'bonustile1',
    'Bonus B': 'bonustile2',
    'Bonus C': 'bonustile3',
    'Bonus D': 'bonustile4',
    'Bonus E': 'bonustile5',
    'Bonus F': 'bonustile6'
  };
  return map[tileName] || `bonustile${tileName}`;
}

function getAdvTechTileFilename(tileName){
  const map = {
    'Base I': 'base1',
    'Elevation I': 'elevation1',
    'Conduit I': 'conduit1',
    'Powerhouse I': 'powerhouse1',
    'Wildcard I': 'wildcard1'
  };
  return map[tileName] || `tile${tileName}`;
}

function getHeadstreamTileFilename(tileName){
  const map = {
    'Headstream A': 'headstream1',
    'Headstream B': 'headstream2',
    'Headstream C': 'headstream3',
    'Headstream D': 'headstream4',
    'Headstream E': 'headstream5',
    'Headstream F': 'headstream6',
    'Headstream G': 'headstream7',
    'Headstream H': 'headstream8'
  };
  return map[tileName] || `headstream${tileName}`;
}

function getNationalContractFilename(tileName){
  const map = {
    'Contract 1': 'nationalcontract1',
    'Contract 2': 'nationalcontract2',
    'Contract 3': 'nationalcontract3',
    'Contract 4': 'nationalcontract4',
    'Contract 5': 'nationalcontract5',
    'Contract 6': 'nationalcontract6'
  };
  return map[tileName] || `nationalcontract${tileName}`;
}

function getObjectiveTileFilename(tileName){
  const map = {
    'Objective 1': 'objective1',
    'Objective 2': 'objective2',
    'Objective 3': 'objective3',
    'Objective 4': 'objective4',
    'Objective 5': 'objective5',
    'Objective 6': 'objective6'
  };
  return map[tileName] || `objective${tileName}`;
}

function getNationboardFilename(nation){
  const nationboardMap = {
    'France': 'france',
    'Germany': 'germany',
    'Italy': 'italy',
    'Netherlands': 'netherlands',
    'USA': 'usa'
  };
  return nationboardMap[nation] || nation;
}

function getOfficerFilename(officerName){
  const officerMap = {
    'Anton Krylov': 'Anton_Krylov',
    'Graziano Del Monte': 'Graziano_Del_Monte',
    'Jill McDowell': 'Jill_McDowell',
    'Mahiri Sekibo': 'Mahiri_Sekibo',
    'Simone Luciani': 'simone_luciani',
    'Solomon P Jordan': 'Solomon_P_Jordan',
    'Tommaso Battista': 'tommaso_battista',
    'Victor Fiesler': 'Victor_Fiesler',
    'Wilhelm Adler': 'Wilhelm_Adler'
  };
  return officerMap[officerName] || officerName;
}

function getStartContractFilename(contractName){
  const match = contractName.match(/\d+/);
  return match ? `startcontract${match[0]}` : contractName;
}

function ensureImageModal(){
  let modal = document.getElementById('imageModal');
  if(modal){
    return modal;
  }

  modal = document.createElement('div');
  modal.id = 'imageModal';
  modal.className = 'image-modal hidden';
  modal.innerHTML = `
    <div class="image-modal-backdrop"></div>
    <div class="image-modal-content">
      <button type="button" class="image-modal-close" aria-label="Close enlarged image">×</button>
      <img class="image-modal-image" alt="Enlarged nationboard" />
    </div>
  `;

  modal.querySelector('.image-modal-backdrop').addEventListener('click', closeImageModal);
  modal.querySelector('.image-modal-close').addEventListener('click', closeImageModal);
  document.addEventListener('keydown', event=>{
    if(event.key === 'Escape' && !modal.classList.contains('hidden')){
      closeImageModal();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openImageModal(src, alt){
  const modal = ensureImageModal();
  const image = modal.querySelector('.image-modal-image');
  image.src = src;
  image.alt = alt;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeImageModal(){
  const modal = document.getElementById('imageModal');
  if(!modal){
    return;
  }

  modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function renderPacks(packs){
  const container = $('#playerPacks');
  container.innerHTML = '';

  packs.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'pack';

    const visuals = document.createElement('div');
    visuals.className = 'pack-visuals';

    const miniImages = document.createElement('div');
    miniImages.className = 'pack-mini-images';

    const nationImg = document.createElement('img');
    nationImg.alt = p.nation;
    setImageWithFallback(nationImg, 'assets/images/officers/nations', getFlagFilename(p.nation), 'assets/images/officers/placeholder_nation.png');

    const officerImg = document.createElement('img');
    officerImg.alt = p.officer;
    setImageWithFallback(officerImg, 'assets/images/officers/officers', getOfficerFilename(p.officer), 'assets/images/officers/placeholder_officer.png');

    const startContractImg = document.createElement('img');
    startContractImg.alt = p.startContract;
    setImageWithFallback(startContractImg, 'assets/images/officers/startcontract', getStartContractFilename(p.startContract), 'assets/images/officers/placeholder_officer.png');

    miniImages.appendChild(nationImg);
    miniImages.appendChild(officerImg);
    miniImages.appendChild(startContractImg);

    const nationboardImg = document.createElement('img');
    nationboardImg.className = 'pack-nationboard';
    nationboardImg.alt = `${p.nation} nationboard`;
    nationboardImg.style.cursor = 'zoom-in';
    nationboardImg.addEventListener('click', ()=>openImageModal(nationboardImg.src, nationboardImg.alt));
    setImageWithFallback(nationboardImg, 'assets/images/officers/nationboards', getNationboardFilename(p.nation), 'assets/images/officers/placeholder_nation.png');

    const enlargeBtn = document.createElement('button');
    enlargeBtn.type = 'button';
    enlargeBtn.className = 'pack-enlarge-btn';
    enlargeBtn.textContent = 'Click to enlarge';
    enlargeBtn.addEventListener('click', event=>{
      event.stopPropagation();
      openImageModal(nationboardImg.src, nationboardImg.alt);
    });

    visuals.appendChild(miniImages);
    visuals.appendChild(nationboardImg);

    const info = document.createElement('div');
    info.className = 'pack-info';

    const nationboardWrap = document.createElement('div');
    nationboardWrap.className = 'pack-nationboard-wrap';
    nationboardWrap.appendChild(nationboardImg);

    const buttonWrap = document.createElement('div');
    buttonWrap.className = 'pack-button-wrap';
    buttonWrap.appendChild(enlargeBtn);

    const details = document.createElement('div');
    details.className = 'pack-details';
    details.innerHTML = `
      <div><strong>Nation:</strong> ${p.nation}</div>
      <div><strong>Officer:</strong> ${p.officer}</div>
    `;

    info.appendChild(nationboardWrap);
    info.appendChild(buttonWrap);
    info.appendChild(details);

    div.appendChild(visuals);
    div.appendChild(info);
    container.appendChild(div);
  });
}
