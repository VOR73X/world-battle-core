const { Archetype, ArchetypeCollection } = require('./archetype');
const { MilitaryUnits } = require('./militaryUnit');
const Core = require('./core');

class Battles extends ArchetypeCollection{
	_childType(){ return Battle }
}

class Battle extends Archetype{

	_model(){
		return {
			attackerCountyId: null,
			defenderCountyId: null,
			startTime: null,
			updateTime: null,
			attackerArmy: new MilitaryUnits(),
			defenderArmy: new MilitaryUnits()
		}
	}

	_types(){
		return {
			attackerArmy: MilitaryUnits,
			defenderArmy: MilitaryUnits,
		}
	}

	get timestamp(){
		return new Date().getTime();
	}

	get startTimestamp(){
		return this.startTime.getTime();
	}

	get delta(){
		return Math.floor((this.timestamp - this.startTimestamp)/1000);
	}

	get unitisBattle(){
		return this.attackerArmy.infatry + this.defenderArmy.infatry;
	}
	
	close(){

	}

	execute(){
		//console.log('atkTotal', this.attackerArmy.atkTotal)
		//console.log('atkPercents', this.attackerArmy.atkPercents)
		//console.log('defPercents', this.attackerArmy.defPercents)

		const atkTotal = this.attackerArmy.unitsTotal;
		const defTotal = this.defenderArmy.unitsTotal;

		const propotion = defTotal / atkTotal;

		const rateoAtk = this.attackerArmy.atkTotal / this.defenderArmy.defTotal;
		const rateoDef = this.defenderArmy.atkTotal / this.attackerArmy.defTotal;

		const deltaAtk = this.delta * rateoAtk * 100;
		const deltaDef = this.delta * rateoDef * 100;

		const atkHit = this.attackerArmy.atkPercents().rateoCalculation(deltaDef);
		const defHit = this.defenderArmy.defPercents().rateoCalculation(deltaAtk);

		//console.log('atk %s/%s', atkHit.get(0).remainingUnits, atkHit.get(0).units)
		//console.log('def %s/%s', defHit.get(0).remainingUnits, defHit.get(0).units)
		//console.table([{propotion, atkTotal, defTotal, rateoAtk, rateoDef, deltaAtk, deltaDef}])
		
		this.attackerArmy.hitApply(atkHit)
		this.defenderArmy.hitApply(defHit)
	}
}

module.exports = { Battles, Battle };