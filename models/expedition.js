const { Archetype, ArchetypeCollection } = require('./archetype');
const { MilitaryUnits } = require('./militaryUnit');
const Core = require('./core');

class Expeditions extends ArchetypeCollection{
	_childType(){ return Expedition }

	send(data){
		data.startTime =new Date();

		return this.add(data);
	}
}

class Expedition extends Archetype{
	
	static STATUS = {
		ON_TRAVEL		: 'ON_TRAVEL',
		ARRIVED			: 'ARRIVED',
		ON_DELIVERY		: 'ON_DELIVERY',
	}

	_model(){
		return {
			speed: 100,
			status: Expedition.STATUS.ON_TRAVEL,
			unitRate: 300,
			army: new MilitaryUnits(),
			startTime: null,
			endTime: null,
			departureId: null,
			destinationId: null,
			battleId: null,
			onArrived: null
		}
	}

	_types(){
		return {
			army: MilitaryUnits,
		}
	}

	get timestamp(){
		return new Date().getTime();
	}

	get startTimestamp(){
		return this.startTime.getTime();
	}

	get endTimestamp(){
		return this.startTimestamp + (this.duration * 1000)
	}

	get delta(){
		return Math.floor((this.timestamp - this.startTimestamp)/1000);
	}

	get departure(){
		return Core().mapGrid.get(this.departureId);
	}

	get isDetinationBattle(){
		return this.battleId !== null;
	}

	get isDetinationCountry(){
		return this.destinationId !== null;
	}

	get destinationCountry(){
		return Core().mapGrid.get(this.destinationId);
	}

	get distance(){
		const a = this.departure.x - this.destinationCountry.x;
		const b = this.departure.y - this.destinationCountry.y;
		return Math.sqrt(a*a + b*b);
	}

	get unit(){
		return this.unitRate / this.speed;
	}

	get duration(){
		return this.distance * this.unit;
	}

	get isArrived(){
		return this.timestamp > this.endTimestamp;
	}

	get percent(){
		const currentPercent = (this.delta * 100) / this.duration;
		return (currentPercent <= 100) ? currentPercent : 100;
	}

	delivered(){
		this.status = Expedition.STATUS.ON_DELIVERY;
	}

	checkArrived(){
		if(this.status === Expedition.STATUS.ON_TRAVEL){
			if(this.isArrived){
				this.status = Expedition.STATUS.ARRIVED;
				if(this.onArrived) this.onArrived(this);
			}
		}
	}

	execute(){
		this.checkArrived();
		//console.log(this.percent, this.isArrived)
	}
}

module.exports = { Expeditions, Expedition };