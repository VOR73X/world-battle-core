const { Model, ModelCollection } = require('./model');

class ArchetypeCollection extends ModelCollection{
	
	_childType(){ return Archetype }

	execute(){
		this.getAll().forEach(e=>e.execute());
	}

	json(){
		return JSON.stringify(this.getAll());
	}

	data(){
		return JSON.parse(this.json());
	}
}

class Archetype extends Model{

	execute(){
		
	}

	json(){
		return JSON.stringify(this);
	}

	data(){
		return JSON.parse(this.json());
	}
}

module.exports = { ArchetypeCollection, Archetype };