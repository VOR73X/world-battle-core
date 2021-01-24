const { Archetype, ArchetypeCollection } = require('./archetype');
const { MilitaryUnits } = require('./militaryUnit');
const { Expeditions } = require('./expedition');

const Core = require('./core');

class Kingdoms extends ArchetypeCollection{
	_childType(){ return Kingdom }
}

class Kingdom extends Archetype{

	constructor(data){
		super(data);

		this.army = MilitaryUnits[this.type];
	}

	_model(){
		return {
			name: '',
			type: '',
			army: null,
			expeditions: new Expeditions(),
		}
	}

	_types(){
		return {
			army: MilitaryUnits,
			expeditions: Expeditions
		}
	}

	get armyType(){
		return MilitaryUnits[this.type];
	}

	getCounties(){
		return Core().counties.getAll().filter(e=>e.kingdomId === this.id);
	}

	getArmy(data){
		const toSend = new MilitaryUnits();
		
		data.filter(e=>(e.units > 0)).forEach(unit=>{
			const army = this.army.getAll().find(e=>e.name === unit.name);

			if(army){
				const armyData = army._data();
				armyData.units = unit.units;
				toSend.add(armyData);
			}
		});
		return toSend;
	}

	// startExpedition(data){
	// 	console.log('startExpedition');

	// 	const departurePosition = data.departure;
	// 	const destinationPosition = data.destination;

	// 	const departureCounty= Core().counties.getCounty(departurePosition.x, departurePosition.y);
	// 	const destiationCounty = Core().counties.getCounty(destinationPosition.x, destinationPosition.y);

	// 	const armyToSend = this.getArmy(data.army)
	// 	if(departureCounty.kingdomId === destiationCounty.kingdomId && departureCounty.kingdomId === this.id){
	// 		const expeditionData = {
	// 			departureId: departureCounty.grid.id,
	// 			destinationId: destiationCounty.grid.id,
	// 			army: armyToSend,
	// 			startTime: new Date(),
	// 			onArrived: data.onArrived
	// 		};

	// 		console.table([expeditionData])
	// 		const expeditionId = this.expeditions.add(expeditionData);

	// 		return this.expeditions.get(expeditionId);
	// 	}else{
	// 		throw new Error('kingdom enemy or empty')
	// 	}
	// }

	execute(){
		this.expeditions.execute();
	}
}

module.exports = { Kingdoms, Kingdom };