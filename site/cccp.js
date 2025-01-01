/*
	Andres Basile
	GNU/GPL v3
*/
function init() {
	plan_ui();
	plan_ui_load();
	plan_new();
	db_load("db.json");
}

// GLOBALS
var UI = {};
var DB = {};
var PLAN = {};
var CACHE = {};
const STAGES_PRE = ["germination", "seedling", "vegetative"];
const STAGES_POST = ["transition", "flowering"];
const STAGES = STAGES_PRE.concat(STAGES_POST);

// HELPERS
function e_new(name, attrs={}, content=null, parent=null, pre=false) {
    const el = document.createElement(name);
    for (const [key, val] of Object.entries(attrs)) {
        el.setAttribute(key, val);
    }
    if (content) el.innerText = content;
    var target;
    if (typeof parent === 'string') target = document.getElementById(parent);
    else if (parent == null) target = document.body;
    else target = parent;
    if (pre) target.prepend(el);
    else target.append(el);
    return el;
}

function log(level, msg) {
	console.log(level.toUpperCase(), msg);
}

function d2s(date) {
	if (!date) return '';
	return date.toISOString().substring(0,10);
}

function d2ss(date) {
	if (!date) return '';
	return date.toISOString().substring(5,10);
}

function d2ms(days) {
	return days * 86400000;
}

function ms2d(ms) {
	return Math.floor(ms / 86400000);
}

function id_next(keys) {
	var id = (keys.length + 1) + '';
	while (keys.indexOf(id) > -1) {
		id = (parseInt(id) + 1) + '';
	}
	return id;
}

function solstice_next() {
	return new Date((new Date().getFullYear()), 11, 21);
}

function i_name(table, id) {
	return DB['idx_' + table][id] || id;
}

// DB
function db_load(url) {
	fetch(url).then(response => response.json()
	).then(data => {
		DB = data;
		for (const table of Object.keys(DB)) {
			DB["idx_" + table] = {};
			for (const [k, v] of Object.entries(DB[table])) {
				DB["idx_" + table][k] = v.name;
			}
		}
	}).catch(err => {
		log('error', `Database loading '${url}': ${err}`);
	});
}

// PLAN
function plan_ui() {
	const menu = e_new('div', {class: 'bg_dark noprint'});
	e_new('div', {class: 'inline row logo center'}, 'CCCP', menu);
	const menu_but = e_new('div', {class: 'inline row'}, null, menu);
	UI.new = e_new('button', {class: '', onclick: 'plan_new();'}, 'New', menu_but);
	UI.load = e_new('select', {class: 'margin_l', onchange: 'plan_load(this);'}, null, menu_but);
	const plan = e_new('div', {class: 'border_t bg_light noprint'});
	e_new('div', {class: 'inline row label right'}, 'plan', plan);
	const plan_but = e_new('div', {class: 'inline row'}, null, plan);
	UI.name = e_new('input', {class: 'margin_l', size: 8, oninput: 'plan_id(this);'}, null, plan_but);
	UI.save = e_new('button', {class: 'margin_l', onclick: 'plan_save();'}, 'Save', plan_but);
	UI.del = e_new('button', {class: 'margin_l', onclick: 'plan_delete();'}, 'Del', plan_but);
	const solstice = e_new('div', {class: ''}, null, plan);
	e_new('div', {class: 'inline row label right'}, 'solstice', solstice);
	const t = e_new('div', {class: 'inline row value center'}, null, solstice);
	UI.solstice = e_new('input', {type: 'date', onchange: 'plan_solstice(this);'}, null, t);
	const header = e_new('div', {class: 'bg_light noprint'});
	const label = e_new('div', {class: 'inline border_r'}, null, header);
	const add = e_new('div', {class: 'row label right pad_r'}, null, label);
	e_new('button', {onclick: 'pot_new();'}, 'Add', add);
	e_new('div', {class: 'row label right pad_r'}, 'pot', label);
	e_new('div', {class: 'row label right pad_r'}, 'seed', label);
	for (const key of STAGES) {
		e_new('div', {class: 'row label right pad_r'}, key, label);
	}
	e_new('div', {class: 'row label right pad_r'}, 'profile', label);
	e_new('div', {class: 'row label right pad_r'}, 'start', label);
	e_new('div', {class: 'row label right pad_r'}, 'finish', label);
	UI.pots = e_new('div', {class: 'inline bg_lighter'}, null, header);
	UI.pot = {};
	const action = e_new('div', {class: 'border_b bg_light noprint'});
	const action_but = e_new('div', {class: 'row logo center'}, null, action);
	UI.apply = e_new('button', {class: '', onclick: 'plan_apply();'}, 'Apply', action_but);
	UI.print = e_new('button', {class: 'margin_l', onclick: 'window.print();'}, 'Print', action_but);
	UI.plan = e_new('table', {});
}

function plan_new() {
	PLAN = {
		id: id_next(UI.plans),
		solstice: solstice_next(),
		pot: {}
	};
	UI.pot = {};
	UI.pots.innerHTML = '';
	UI.plan.innerHTML = '';
	UI.name.value = PLAN.id;
	UI.solstice.value = d2s(PLAN.solstice);
}

function plan_ui_load() {
	UI.load.innerHTML = "";
	UI.plans = [];
	e_new('option', {disabled: '', selected: ''}, 'Load', UI.load);
	for (const key in localStorage) {
		if(key.match("CCCP_plan__")) {
			const name = key.split("__")[1];
			UI.plans.push(name);
			e_new('option', {value: name}, name, UI.load);
		}
	}
}

function plan_save() {
	const id = UI.name.value;
	if (!id) {
		log('error', `Plan name is missing.`);
		return;
	}
	PLAN.id = id;
	localStorage.setItem("CCCP_plan__" + id, JSON.stringify(PLAN));
	plan_ui_load();
}

function plan_load() {
	const plan = JSON.parse(localStorage.getItem("CCCP_plan__" + UI.load.value));
	if (!plan) {
		log('error', `Plan '${UI.load.value}' not found.`);
		return;
	}
	plan_new();
	PLAN = plan;
	PLAN.solstice = new Date(PLAN.solstice);
	UI.solstice.value = d2s(PLAN.solstice);
	UI.name.value = PLAN.id;
	UI.load[0].selected = true;
	for (const id of Object.keys(PLAN.pot)) {
		PLAN.pot[id].start = new Date(PLAN.pot[id].start);
		PLAN.pot[id].finish = new Date(PLAN.pot[id].finish);
		pot_ui(id);
	}
}

function plan_delete() {
	if(!PLAN.id) {
		log('error', `Plan name is empty.`);
	}
	if(window.confirm(`Are you sure to remove plan "${PLAN.id}"?`)) {
		localStorage.removeItem("CCCP_plan__" + PLAN.id);
		plan_ui_load();
		plan_new();
	}
}

function plan_apply() {
	CACHE = {start: new Date(), finish: new Date(), total: 0, day: [], pot: {}};
	var count = {};
	for (const id of Object.keys(PLAN.pot)) {
		count[id] = 0;
		pot_finish_calc(id);
		pot_profile_calc(id);
		if (CACHE.start > PLAN.pot[id].start) {
			CACHE.start = PLAN.pot[id].start;
		}
		if (CACHE.finish < PLAN.pot[id].finish) {
			CACHE.finish = PLAN.pot[id].finish;
		}
	}
	CACHE.total = ms2d(CACHE.finish.getTime() - CACHE.start.getTime()) + 1;
	var today = new Date(CACHE.start);
	UI.plan.innerHTML = '';
	const th = e_new('thead', {class: 'bg_dark'}, null, UI.plan);
	const ph = e_new('tr', {}, null, th);
	e_new('th', {class: 'date center border_t border_l border_b border_r'}, null, ph);
	for (const id of Object.keys(PLAN.pot)) {
		e_new('th', {class: 'value center border_t border_b border_r'}, id, ph);
	}
	const pt = e_new('tbody', {}, null, UI.plan);
	for (var i=0; i<CACHE.total; i++) {
		var hide = true;
		var day = {date: d2s(today), pot: {}};
		const pd = e_new('tr', {class: ''}, null, pt);
		e_new('td', {class: 'date center bg_light border_l border_b border_r'}, d2ss(today), pd);
		for (const id of Object.keys(PLAN.pot)) {
			const pc = e_new('td', {class: 'value  border_b border_r'}, null, pd);
			if ((PLAN.pot[id].start <= today) && (PLAN.pot[id].finish >= today)) {
				const actions = CACHE.pot[id].day[count[id]];
				if (actions && actions.length > 0) {
					day.pot[id] = actions;
					hide = false;
					for (const action of actions) {
						const e = e_new('div', {class: 'icon'}, i_name('action', action), pc);
						if (STAGES.includes(action)) {
							e.classList.add(action);
						}
						else {
							e.classList.add('check');
						}
					}
				}
				count[id]++;
			}
			else {
				pc.classList.add('bg_lighter');
			}
		}
		CACHE.day.push(day);
		if(hide) {
			pd.classList.add('hide');
		}
		today.setDate(today.getUTCDate() + 1);
	}
//	const tf = e_new('tfoot', {class: 'bg_dark border_t'}, null, UI.plan);
	/*
	const pf = e_new('tr', {}, null, tf);
	e_new('td', {class: 'date'}, null, pf);
	for (const id of Object.keys(PLAN.pot)) {
		const pc = e_new('td', {class: 'value'}, DB["idx_seed"][PLAN.pot[id].seed], pf);
	}
	*/
}

function plan_id(e) {
	const id = e.value;
	if (!id) {
		e.classList.add('warn');
		log('warn', `Plan name is empty.`);
		return;
	}
	if (UI.plans.includes(id) && id != PLAN.id) {
		e.classList.add('warn');
		log('warn', `Plan name '${id}' already exists.`);
		return;
	}
	e.classList.remove('warn');
}

function plan_solstice(e) {
	PLAN.solstice = new Date(e.value);
	for (const id of Object.keys(PLAN.pot)) {
		pot_start_calc(id);
		UI.pot[id].start.value = d2s(PLAN.pot[id].start);
		pot_finish_calc(id);
		UI.pot[id].finish.value = d2s(PLAN.pot[id].finish);
	}
	UI.plan.innerHTML = '';
}

// POT
function pot_ui(id) {
	if (!DB.seed[PLAN.pot[id].seed]) {
		log('error', `Seed '${PLAN.pot[id].seed}' not found. Using DB 'default' values.`);
		PLAN.pot[id].seed = 'default'; // Must exists on DB.
	}
	const sdb = DB.seed[PLAN.pot[id].seed];
	UI.pot[id] = {};
	const pot = e_new('div', {class: 'inline border_r', 'data-name': id}, null, UI.pots);
	const del = e_new('div', {class: 'row value right'}, null, pot);
	e_new('button', {onclick: 'pot_delete(this)'}, 'Del', del);
	const name = e_new('div', {class: 'row value center'}, null, pot);
	UI.pot[id].name = e_new('input', {value: id, oninput: 'pot_id(this);', size: 8}, null, name);
	const seed = e_new('div', {class: 'row value center'}, null, pot);
	UI.pot[id].seed = e_new('select', {onchange: 'pot_seed(this);'}, null, seed);
	pot_ui_seed(id);
	for (const key of STAGES) {
		const div = e_new('div', {class: 'row value center'}, null, pot);
		if (!sdb[key]) {
			log('error', `Stage '${key}' missing on seed '${opt.seed}'.`);
			continue;
		}
		UI.pot[id][key] = e_new('input', {type: 'number',
			name: key,
			size: 3,
			value: PLAN.pot[id][key],
			min: sdb[key].min,
			max: sdb[key].max,
			onchange: "pot_update(this);"
		}, null, div);
	}
	const profile = e_new('div', {class: 'row value center'}, null, pot);
	UI.pot[id].profile = e_new('select', {onchange: 'pot_profile(this);'}, null, profile);
	pot_ui_profile(id);
	const start = e_new('div', {class: 'row value center'}, null, pot);
	UI.pot[id].start = e_new('input', {disabled: true, onchange: 'pot_start(this);', type: 'date', value: d2s(PLAN.pot[id].start)}, null, start);
	if(pot_is_auto(id)) {
		UI.pot[id].start.disabled = false;
	}
	const finish = e_new('div', {class: 'row value center'}, null, pot);
	UI.pot[id].finish = e_new('input', {disabled: true, type: 'date', value: d2s(PLAN.pot[id].finish )}, null, finish);
}

function pot_id_get(e) {
	return e.parentNode.parentNode.dataset.name; 
}

function pot_id_set(e, id) {
	e.parentNode.parentNode.dataset.name = id;
}

function pot_id_delete(e) {
	e.parentNode.parentNode.remove();
}



function pot_ui_seed(id) {
	UI.pot[id].seed.innerHTML = "";
	for (const [k, v] of Object.entries(DB["idx_seed"])) {
		const e = e_new('option', {value: k}, v, UI.pot[id].seed);
		if (k == PLAN.pot[id].seed) e.selected = true;
	}
}

function pot_ui_profile(id) {
	UI.pot[id].profile.innerHTML = "";
	for (const k of DB.seed[PLAN.pot[id].seed].profiles) {
		const e = e_new('option', {value: k}, DB["idx_profile"][k], UI.pot[id].profile);
		if (k == PLAN.pot[id].profile) e.selected = true;
	}
}

function pot_new() {
	const id = id_next(Object.keys(PLAN.pot));
	const seed = DB.seed["default"];
	PLAN.pot[id] = {
		id: id,
		seed: "default",
		profile: seed.profiles[0]
	};
	for (const stage of STAGES) {
		PLAN.pot[id][stage] = seed[stage].best
	}
	pot_start_calc(id);
	pot_finish_calc(id);
	pot_ui(id);
}

function pot_delete(e) {
	const id = pot_id_get(e);
	delete(PLAN.pot[id]);
	pot_id_delete(e);
}

function pot_id(e) {
	const id = e.value;
	if (!id) {
		e.classList.add('warn');
		log('warn', `Pot name is empty.`);
		return;
	}
	const old = pot_id_get(e);
	if (PLAN.pot[id] && id != old) {
		e.classList.add('warn');
		log('warn', `Pot name '${id}' already exists.`);
		return;
	}
	e.classList.remove('warn');
	if (id == old) {
		return;
	}
	PLAN.pot[id] = PLAN.pot[old];
	delete(PLAN.pot[old]);
	PLAN.pot[id].name = id;
	pot_id_set(e, id);
}

function pot_seed(e) {
	const id = pot_id_get(e);
	const seed = DB.seed[e.value];
	PLAN.pot[id].seed = e.value;
	PLAN.pot[id].profile = seed.profiles[0];
	pot_ui_profile(id);
	for (const stage of STAGES) {
		PLAN.pot[id][stage] = seed[stage].best;
		UI.pot[id][stage].value = seed[stage].best;
	}
	pot_start_calc(id);
	UI.pot[id].start.value = d2s(PLAN.pot[id].start);
	pot_finish_calc(id);
	UI.pot[id].finish.value = d2s(PLAN.pot[id].finish);
	if(pot_is_auto(id)) {
		UI.pot[id].start.disabled = false;
	}
	else {
		UI.pot[id].start.disabled = true;
	}
}

function pot_is_auto(id) {
	return (PLAN.pot[id][STAGES_PRE.at(-1)] == 0);
}

function pot_update(e) {
	const id = pot_id_get(e);
	PLAN.pot[id][e.name] = parseInt(e.value);
	if (pot_is_auto(id) || STAGES_POST.includes(e.name)) {
		pot_finish_calc(id);
		UI.pot[id].finish.value = d2s(PLAN.pot[id].finish);
	}
	else {
		pot_start_calc(id);
		UI.pot[id].start.value = d2s(PLAN.pot[id].start);
	}
}

function pot_profile(e) {
	const id = pot_id_get(e);
	PLAN.pot[id].profile = e.value;
}

function pot_start(e) {
	const id = pot_id_get(e);
	PLAN.pot[id].start = new Date(e.value);
	pot_finish_calc(id);
	UI.pot[id].finish.value = d2s(PLAN.pot[id].finish);
}

function pot_start_calc(id) {
	if (pot_is_auto(id)) {
		return;
	}
	var off = 0;
	for (const stage of STAGES_PRE) {
		off += PLAN.pot[id][stage];
	}
	PLAN.pot[id].start = new Date(PLAN.solstice.getTime() - d2ms(off));
}

function pot_finish_calc(id) {
	var off = 0;
	var stages = STAGES_POST;
	var start = PLAN.solstice.getTime();
	if (pot_is_auto(id)) { // AUTO
		stages = STAGES;
		start = PLAN.pot[id].start.getTime();
	}
	for (const stage of stages) {
		off += PLAN.pot[id][stage];
	}
	PLAN.pot[id].finish = new Date(start + d2ms(off));
}

function pot_profile_calc(id) {
	const profile = DB.profile[PLAN.pot[id].profile];
	CACHE.pot[id] = {
		total: ms2d(PLAN.pot[id].finish.getTime() - PLAN.pot[id].start.getTime()),
		stage: {},
		day: []
	};
	for (var i=0; i<CACHE.pot[id].total; i++) {
		CACHE.pot[id].day[i] = [];
	}
	CACHE.pot[id].day[(CACHE.pot[id].total - 1)].push('harvest');
	var last = 0;
	for (const stage of STAGES) {
		CACHE.pot[id].stage[stage] = last;
		CACHE.pot[id].day[last].push(stage);
		last += PLAN.pot[id][stage];
		if(!profile[stage]) continue;
		for(var i=0; i<profile[stage].length; i++) {
			const actions = pot_profile_action_calc(PLAN.pot[id][stage], profile[stage][i]);
			for (const action of actions) {
				const day = CACHE.pot[id].stage[stage] + action;
				CACHE.pot[id].day[day].push(profile[stage][i].name)
			}
		}
	}
}

function pot_profile_action_calc(total, action) {
	var actions = [];
	var start = action.start;
	var rev = total * -1;
	for(var i=0; i<total; i++) {
		if ((i == start) || (rev == start)) {
			actions.push(i);
			if (action.repeat) {
				start += action.repeat;
			}
		}
		if ((i == action.end) || (rev == action.end)) {
			break;
		}
		rev++;
	}
	return actions;
}