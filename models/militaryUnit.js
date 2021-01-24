const { Archetype, ArchetypeCollection } = require('./archetype');
const Core = require('./core');

class MilitaryUnits extends ArchetypeCollection{

	static get roman(){
		return new MilitaryUnits(require('./../data/romans').armyTypes);
	}

	static get teuton(){
		return new MilitaryUnits(require('./../data/teutons').armyTypes);
	}

	static transferUnits(from, target){
		const removeData = from.data();
		const removedData = from.removeUnits(removeData);
		
		target.addUnits(removedData);
	}

	get atkTotal(){
		return this.getAll().reduce((total, value)=>(total + value.atkTotal), 0);
	}

	get defTotal(){
		return this.getAll().reduce((total, value)=>(total + value.defTotal), 0);
	}

	get unitsTotal(){
		return this.getAll().reduce((total, value)=>(total + value.units), 0);
	}

	_childType(){ return MilitaryUnit }

	atkPercents(){
		return this.getAll().map(e=>({
			...e._data(),
			percent: e.atkTotal / this.atkTotal
		})).reduce((compose, data)=>{
			compose.add(data);
			return compose;
		}, new MilitaryUnits());
	}

	defPercents(){
		return this.getAll().map(e=>({
			...e._data(),
			percent: e.defTotal / this.defTotal
		})).reduce((compose, data)=>{
			compose.add(data);
			return compose;
		}, new MilitaryUnits());
	}

	rateoCalculation(damage){
		return this.getAll().map(e=>({
			...e._data(),
			damage
		})).reduce((compose, data)=>{
			compose.add(data);
			return compose;
		}, new MilitaryUnits());
	}

	deadUnits(){
		return this.getAll().map(e=>({
			name: e.name,
			units: e.deadUnits
		})).filter(e=>(e.units > 0))
	}

	hitApply(hit){
		const toRemove = hit.deadUnits();
		this.removeUnits(toRemove)
	}

	getByName(name){
		return this.getAll().find(e=>e.name === name);
	}

	addUnits(data){
		data.forEach(unit=>{
			const unitTarget = this.find(e=>e.name === unit.name);
			unitTarget.units += unit.units;
		});
	}

	removeUnits(data){
		const removeData = [];

		data.forEach(unit=>{
			const unitTarget = this.find(e=>e.name === unit.name);
			if(unitTarget.units >= unit.units){
				unitTarget.units -= unit.units;
				removeData.push(unit);
			}
		});

		return (removeData.length === data.length) ? removeData : null;
	}

	cleanUnits(){
		this.forEach(e=>{
			e.units = 0;
		});
	}
}

class MilitaryUnit extends Archetype{
	
	_model(){
		return {
			name: '',
			atk: '',
			def: '',
			units: 0,
			percent: 0,
			damage: 0
		}
	}

	get atkTotal(){
		return this.atk * this.units;
	}

	get defTotal(){
		return this.def * this.units;
	}

	get hit(){
		return this.defTotal - (this.damage * this.percent);
	}

	get remainingUnits(){
		const result = Math.floor(this.hit / this.def);
		if(result < 0)return 0;
		return result;
	}

	get deadUnits(){
		return this.units - this.remainingUnits;
	}
}

module.exports = { MilitaryUnits, MilitaryUnit };