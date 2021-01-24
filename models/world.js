const { Archetype } = require('./archetype');
const { Counties } = require('./county');
const { Kingdoms } = require('./kingdom');
const { Grids } = require('./grid');
const { Battles } = require('./battle');

module.exports = class World extends Archetype{
	
	static instanceObject;
	static instance(){
		return (World.instanceObject) ? World.instanceObject : World.instanceObject = new World;	
	}

	_model(){
		return {
			mapGrid: new Grids(),
			counties: new Counties(),
			kingdoms: new Kingdoms(),
			battles: new Battles(),
			intervalInstance: null,
			intervalRate: 1000
		}
	}

	_types(){
		return {
			mapGrid: Grids,
			counties: Counties,
			kingdoms: Kingdoms,
			battles: Battles,
		}
	}

	start(){
		clearInterval(this.intervalInstance);
		setInterval(this.execute, this.intervalRate);
	}

	execute = ()=>{
		this.kingdoms.execute();
		this.counties.execute();
		this.battles.execute();
	}

	setup(){
		const romans  = require('./../data/romans');
		const teutons = require('./../data/teutons');

		const romanId = this.kingdoms.add(romans);
		const teutonId = this.kingdoms.add(teutons);

		const romankingdom = this.kingdoms.get(romanId);
		const teutonkingdom = this.kingdoms.get(teutonId);

		this.mapGrid.genereateGrid(4,4);

		const mapGrid = this.mapGrid.getAll();
		const romanGrids = [
			{x: 0, y:2},
			{x: 1, y:1},
			{x: 1, y:2},
			{x: 1, y:3},
			{x: 2, y:0},
			{x: 2, y:1}
		];

		const teutonGrids = [
			{x:4, y:2},
			{x:3, y:1},
			{x:3, y:2},
			{x:3, y:3},
			{x:2, y:3},
			{x:2, y:4}
		];

		const applykingdom = (kingdomId, grids)=>{
			grids.forEach(grid=>{
				const gridFound = mapGrid.find(e=>(e.x === grid.x && e.y === grid.y));
				gridFound.kingdomId = kingdomId;

				this.counties.add({
					gridId: gridFound.id,
					kingdomId,

				});
			});
		}

		applykingdom(romanId, romanGrids);
		applykingdom(teutonId, teutonGrids);
	}

}