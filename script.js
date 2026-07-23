// script.js (updated)
// Data
const data = {
  bonusTiles: ["Bonus A","Bonus B","Bonus C","Bonus D","Bonus E","Bonus F","Bonus G","Bonus H"],
  advTech: ["Base I", "Elevation I", "Conduit I", "Powerhouse I", "Wildcard I", "Private Building 1"],
  externalWorks: [
    { label: "External Work 1", filename: "externalworks1" },
    { label: "External Work 2", filename: "externalworks2" },
    { label: "External Work 3", filename: "externalworks3" },
    { label: "External Work 4", filename: "externalworks4" },
    { label: "External Work 5", filename: "externalworks5" }
  ],
  privateBuildings: [
    { label: "Cofferdam", filename: "cofferdam" },
    { label: "Control Station", filename: "controlstation" },
    { label: "Customer Office", filename: "costumeroffice" },
    { label: "Development Office", filename: "developmentoffice" },
    { label: "Energy Relay Field", filename: "energyrelayfield" },
    { label: "Financial Division", filename: "financialdivision" },
    { label: "Loan Agency", filename: "loanagency" },
    { label: "Research Lab", filename: "researchlab" },
    { label: "Robot Factory", filename: "robotfactory" },
    { label: "Wind Farm", filename: "windfarm" }
  ],
  objectives: ["Objective 1","Objective 2","Objective 3","Objective 4","Objective 5","Objective 6"],
  startingDamsM: ["m1", "m2", "m3", "m4"],
  startingDamsH: ["h1", "h2", "h3"],
  startingDamsP: ["p1", "p2", "p3"],
  headstreams: ["Headstream A","Headstream B","Headstream C","Headstream D","Headstream E","Headstream F","Headstream G","Headstream H"],
  nationalContracts: ["Contract 1","Contract 2","Contract 3","Contract 4","Contract 5","Contract 6"],
  nations: ["Germany","France","Italy","USA"],
  additionalNations: ["Netherlands"],
  startContracts: ["Start 1","Start 2","Start 3","Start 4"],
  officers: ["Wilhelm Adler","Graziano Del Monte","Victor Fiesler","Jill McDowell","Solomon P Jordan","Anton Krylov","Mahiri Sekibo"],
  additionalOfficers: ["Simone Luciani", "Tommaso Battista"],
  leeghwaterOfficers: ["Simone Luciani", "Tommaso Battista", "Leslie Spencer", "Margot Fouche"]
};

const ruleImagePaths = {
  objectiveTiles: 'assets/images/rules/objectivetiles.png',
  privateBuildings: 'assets/images/rules/Private Buildings.png',
  officersCoreGame: 'assets/images/rules/XOs Core Game.png',
  officersExpansion: 'assets/images/rules/XOs Expansion.png'
};

const officersCoreGame = new Set([
  'Anton Krylov',
  'Graziano Del Monte',
  'Jill McDowell',
  'Mahiri Sekibo',
  'Solomon P Jordan',
  'Victor Fiesler',
  'Wilhelm Adler'
]);

const officersExpansion = new Set([
  'Leslie Spencer',
  'Margot Fouche',
  'Simone Luciani',
  'Tommaso Battista'
]);

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
function syncToggleText(){
  const leeghwaterChecked = $('#leeghwaterToggle').checked;
  const additionalChecked = $('#additionalNationsToggle').checked;
  const options = $('#leeghwaterOptions');
  const text = $('#leeghwaterOptionsText');

  if(leeghwaterChecked){
    text.textContent = 'Adds Netherlands, the expanded officer pool, two bonus tiles, the private building tech tile, external works and private buildings.';
    options.classList.remove('hidden');
    return;
  }

  if(additionalChecked){
    text.textContent = 'Adds Netherlands, Simone Luciani and Tommaso Battista.';
    options.classList.remove('hidden');
    return;
  }

  options.classList.add('hidden');
}

$('#leeghwaterToggle').addEventListener('change', e=>{
  syncToggleText();
});

$('#additionalNationsToggle').addEventListener('change', ()=>{
  syncToggleText();
});

$('#randomBtn').addEventListener('click', generateAll);
$('#exportBtn').addEventListener('click', saveSetupAsJpg);

function generateAll(){
  const expansionEnabled = $('#leeghwaterToggle').checked;
  const includeAdditionalNations = expansionEnabled || $('#additionalNationsToggle').checked;

  // Bonus Tiles: pick 5 of 6, order I-V
  const bonusPool = expansionEnabled ? data.bonusTiles : data.bonusTiles.slice(0, 6);
  const bonus = pickN(bonusPool,5);

  // Advanced Tech: pick 3 of 5, or 3 of 6 with Leeghwater
  const advPool = expansionEnabled ? data.advTech : data.advTech.slice(0, 5);
  const adv = pickN(advPool,3);

  // Objective: pick 1 of 6
  const obj = pickN(data.objectives,1)[0];

  // Starting Dams: exactly 3 tiles total (M top, H middle, P bottom)
  const startingDams = buildStartingDams();

  // Headstream: pick 4 of 8, order Basin I-IV
  const head = pickN(data.headstreams,4);

  // National Contracts: players - 1 out of 6
  const nContracts = pickN(data.nationalContracts, Math.max(0, players-1));

  // Player Packs: ALWAYS create 4 packs (nation + startContract + officer)
  // Nations: default 4 of 4, or 4 of 5 when additional nations are enabled
  const nationPool = includeAdditionalNations ? data.nations.concat(data.additionalNations) : data.nations;
  const nations = pickN(nationPool, 4);
  // Start contracts: pick 4 (there are 4 available)
  const starts = pickN(data.startContracts, Math.min(4, data.startContracts.length));
  // If there are fewer than 4 startContracts in data, allow repeats to fill to 4
  while(starts.length < 4){
    starts.push(...pickN(data.startContracts, 4 - starts.length));
  }
  // Officers: pick 4 distinct officers from base or expanded pool
  const officerPool = data.officers
    .concat($('#additionalNationsToggle').checked ? data.additionalOfficers : [])
    .concat(expansionEnabled ? data.leeghwaterOfficers.filter(officer=>!data.additionalOfficers.includes(officer)) : []);
  const officers = pickN(officerPool,4);

  const externalWorks = expansionEnabled ? pickN(data.externalWorks,3) : [];
  const privateBuildings = expansionEnabled ? pickN(data.privateBuildings,5) : [];

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
  renderStartingDamTiles('#startingDamsList', startingDams);
  renderHeadstreamTiles('#headstreamList', head);
  renderNationalContractTiles('#nationalContracts', nContracts);
  renderPacks(packs);
  renderExpansionTiles('#externalWorksList', externalWorks, 'assets/images/externalworks', 'assets/images/officers/placeholder_officer.png');
  renderExpansionTiles('#privateBuildingsList', privateBuildings, 'assets/images/privatbuildings', 'assets/images/officers/placeholder_officer.png', ruleImagePaths.privateBuildings, 'Private Buildings Rules');
  $('#leeghwaterExpansion').classList.toggle('hidden', !expansionEnabled);

  // store last generated for export
  window.lastSetup = {players, bonus, adv, obj, startingDams, head, nContracts, packs, expansionEnabled, externalWorks, privateBuildings};
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
  const objectiveTrigger = createRulesTrigger(img, ruleImagePaths.objectiveTiles, 'Objective Tiles Rules');

  el.appendChild(objectiveTrigger);
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

function renderStartingDamTiles(selector, items){
  const el = $(selector);
  el.innerHTML = '';

  const li = document.createElement('li');
  li.className = 'starting-dam-tile-item';

  const mImg = document.createElement('img');
  mImg.className = 'starting-dam-tile-image';
  mImg.alt = 'Starting Dam Top';
  setImageWithFallback(mImg, 'assets/images/startingdams', items.m, 'assets/images/officers/placeholder_officer.png');

  const hImg = document.createElement('img');
  hImg.className = 'starting-dam-tile-image';
  hImg.alt = 'Starting Dam Middle';
  setImageWithFallback(hImg, 'assets/images/startingdams', items.h, 'assets/images/officers/placeholder_officer.png');

  const pImg = document.createElement('img');
  pImg.className = 'starting-dam-tile-image';
  pImg.alt = 'Starting Dam Bottom';
  setImageWithFallback(pImg, 'assets/images/startingdams', items.p, 'assets/images/officers/placeholder_officer.png');

  li.appendChild(mImg);
  li.appendChild(hImg);
  li.appendChild(pImg);
  el.appendChild(li);
}

function buildStartingDams(){
  return {
    m: pickN(data.startingDamsM, 1)[0],
    h: pickN(data.startingDamsH, 1)[0],
    p: pickN(data.startingDamsP, 1)[0]
  };
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

function renderExpansionTiles(selector, items, directory, fallbackPath, rulesImagePath, rulesTitle){
  const el = $(selector);
  el.innerHTML = '';

  items.forEach(item=>{
    const li = document.createElement('li');
    li.className = 'expansion-tile-item';

    const img = document.createElement('img');
    img.className = 'expansion-tile-image';
    img.alt = item.label;
    setImageWithFallback(img, directory, item.filename, fallbackPath);

    if(rulesImagePath){
      const trigger = createRulesTrigger(img, rulesImagePath, rulesTitle || `${item.label} Rules`);
      li.appendChild(trigger);
    }else{
      li.appendChild(img);
    }

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

async function saveSetupAsJpg(){
  const target = document.querySelector('#results');

  if(!target || typeof window.html2canvas !== 'function'){
    alert('Image export is not available right now.');
    return;
  }

  const canvas = await window.html2canvas(target, {
    backgroundColor: '#f7f8fb',
    scale: 2,
    useCORS: true
  });

  canvas.toBlob(blob=>{
    if(!blob){
      alert('Could not create the JPG download.');
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'barrage-setup.jpg';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, 'image/jpeg', 0.95);
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
    'Bonus F': 'bonustile6',
    'Bonus G': 'bonustile7',
    'Bonus H': 'bonustile8'
  };
  return map[tileName] || `bonustile${tileName}`;
}

function getAdvTechTileFilename(tileName){
  const map = {
    'Base I': 'base1',
    'Elevation I': 'elevation1',
    'Conduit I': 'conduit1',
    'Powerhouse I': 'powerhouse1',
    'Wildcard I': 'wildcard1',
    'Private Building 1': 'privatebuilding1'
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
    'Leslie Spencer': 'leslie_spencer',
    'Margot Fouche': 'margot_fouche',
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
    const officerRulesImage = getOfficerRulesImage(p.officer);
    if(officerRulesImage){
      const officerTrigger = createRulesTrigger(officerImg, officerRulesImage, `${p.officer} Officer Rules`);
      miniImages.appendChild(officerTrigger);
    }else{
      miniImages.appendChild(officerImg);
    }

    const startContractImg = document.createElement('img');
    startContractImg.alt = p.startContract;
    setImageWithFallback(startContractImg, 'assets/images/officers/startcontract', getStartContractFilename(p.startContract), 'assets/images/officers/placeholder_officer.png');

    miniImages.appendChild(nationImg);
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

function getOfficerRulesImage(officerName){
  if(officersCoreGame.has(officerName)){
    return ruleImagePaths.officersCoreGame;
  }

  if(officersExpansion.has(officerName)){
    return ruleImagePaths.officersExpansion;
  }

  return null;
}

function createRulesTrigger(img, imagePath, title){
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'rules-trigger';
  trigger.setAttribute('aria-label', `Open rules: ${title}`);
  trigger.title = 'Click to view rules';
  trigger.appendChild(img);

  const badge = document.createElement('span');
  badge.className = 'rules-plus-badge';
  badge.setAttribute('aria-hidden', 'true');
  badge.textContent = '+';
  trigger.appendChild(badge);

  trigger.addEventListener('click', ()=>{
    openImageModal(imagePath, title);
  });

  return trigger;
}
