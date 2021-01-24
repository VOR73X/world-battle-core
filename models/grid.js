const { Archetype, ArchetypeCollection } = require('./archetype');
const Core = require('./core');

class Grids extends ArchetypeCollection{
	
	_childType(){ return Grid }

	genereateGrid(width, heigth){
		const listGrid = [];

		for(let x = 0; x <= width; x++){
			for(let y = 0; y <= heigth; y++){	
				const gridElement = new Grid({
					x, y
				});

				this.add(gridElement);
			}
		}
	}

	getGrid(x, y){
		return this.getAll().find(e=>(e.x === x && e.y === y));
	}

}

class Grid extends Archetype{

	_model(){
		return {
			x: -1,
			y: -1,
			kingdomId: -1
		}
	}

	get kingdom(){
		return Core().kingdoms.get(this.kingdomId);
	}

	isBordering(grid){
		return !!this.possibleBorders().list.find(e=>(e.x === grid.x && e.y === grid.y));
	}

	possibleBorders(){
		const topLeft = {x: this.x - 1, y: this.y - 1};
		const topRight = {x: this.x + 1, y: this.y - 1};
		
		const bottomLeft = {x: this.x - 1, y: this.y + 1};
		const bottomRight = {x: this.x + 1, y: this.y + 1};

		const top = {x: this.x, y: this.y - 1};
		const bottom = {x: this.x, y: this.y + 1};
		const left = {x: this.x - 1, y: this.y};
		const right = {x: this.x + 1, y: this.y};
		
		return {
			topLeft,
			topRight,
			bottomLeft,
			bottomRight,
			top,
			bottom,
			left,
			right,
			list: [topLeft, topRight, bottomLeft, bottomRight, top, bottom, left, right]
		};

	}

	playableBorders(){
		return this.possibleBorders().list.map((position)=>{
			const gridFound = Core().mapGrid.getGrid(position.x, position.y);
			if(!gridFound) return;
			if(gridFound.kingdomId === -1) return;
			return gridFound;
		}).filter(e=>(!!e));
	}

	alliedBorders(){
		return this.playableBorders().filter(e=>(e.kingdomId === this.kingdomId));
	}

	enemyBorders(){
		return this.playableBorders().filter(e=>(e.kingdomId !== this.kingdomId));
	}
}

module.exports = { Grids, Grid };