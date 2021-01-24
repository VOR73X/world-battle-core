const { Archetype, ArchetypeCollection } = require('./archetype');
const { MilitaryUnits } = require('./militaryUnit');

const Core = require('./core');

class Counties extends ArchetypeCollection{
	_childType(){ return County }

	getCounty(x, y){
		return this.getAll().find(e=>(e.grid.x === x && e.grid.y === y));
	}
}

class County extends Archetype{
	
	constructor(data){
		super(data);
		this.army = this.unitSchema;
	}

	_model(){
		return {
			gridId: -1,
			kingdomId: -1,
			army: new MilitaryUnits()
		}
	}

	get unitSchema(){
		return MilitaryUnits[this.kingdom.type];
	}

	get kingdom(){
		return Core().kingdoms.get(this.kingdomId);
	}

	get grid(){
		return Core().mapGrid.get(this.gridId);
	}

	startExpedition(destinationId, army, provision){
		const destination = Core().counties.get(destinationId);
		const expeditionId = this.kingdom.expeditions.send({
			departureId: this.grid.id,
			destinationId: destination.grid.id,
			army,
			provision,
			onArrived: (delivery)=>{
				//console.log('onArrived', this.grid.x, this.grid.y)
				const destination = Core().counties.get(destinationId);

				destination.deliveryExpedition(delivery);

			}
		});

		return this.kingdom.expeditions.get(expeditionId);
	}

	startBattle(depatureId){
		const departure = Core().counties.get(depatureId);
		if(departure.grid.isBordering(this.grid)){
			console.log('start battle: %s VS %s', departure.kingdom.name, this.kingdom.name);

			const battleData = {
				attackerCountyId: departure.id,
				defenderCountyId: this.id,
				attackerArmy: departure.unitSchema,
				defenderArmy: this.unitSchema,
				startTime: new Date()
			}

			battleData.defenderArmy.addUnits([{name: "Guerriero", units: 1000}])

			//console.log(battleData);
			//departure.army.cleanUnits();
			const battleId = Core().battles.add(battleData);
			const battle = Core().battles.get(battleId);

			MilitaryUnits.transferUnits(departure.army, battle.attackerArmy);
			MilitaryUnits.transferUnits(this.army, battle.defenderArmy);
			
			//console.log('battle', battle);
		}
	}

	deliveryExpedition(expedition){
		MilitaryUnits.transferUnits(expedition.army, this.army);
		expedition.delivered();
	}
}

module.exports = { Counties, County };