const md5 = require('md5');

class Model {

	static count = 0;
	static debug = true;

	constructor(data={}){
		if(data.id){
			this.id = data.id;
		}else{
			this.id = this.uniqueID();
		}

		this._setModel(data);
	}

	uniqueID(){
		if(Model.debug) return ++Model.count;

		function chr4(){
			return Math.random().toString(16).slice(-4);
		}

		return chr4() + chr4() +
		'-' + chr4() +
		'-' + chr4() +
		'-' + chr4() +
		'-' + chr4() + chr4() + chr4();
	}
	
	_setModel(data={}){
		let __model = this._model();
		let __types = this._types();
		let __references = this._refernces();

		//SET BASE MODEL
		for(let key in __model){
			let value = __model[key]
			this[key] = value;
		}

		//SET INPUT DATA
		for(let key in __model){
			let value = data[key];

			if(value !== undefined){
				this[key] = value;

				if(__types[key]){
					//Set Reference Source
					if(__references[key]){
						console.log('set-call', key)
						this[key]._ref = ()=>{
							console.log('call', key)
							return __references[key];
						}
					}

					//this[key] = new __types[key](value);
					this[key] = this._cast(value, __types[key]);

				}
			} 
		}
	}

	_refernces(){
		return {};
	}

	_uniqueKey(){
		return ['id'];
	}

	_resetModel(){
		this._setModel(this._model);
	}

	_model(){
		return {};
	}

	_readOnly(){
		return [];
	}

	_types(){
		return {};
	}

	_validation(object, Type){
		let isInstanceof = (object instanceof Type);
		if (!isInstanceof) throw new TypeError("Value of argument 'Type' violates.");
	}

	_cast(object, Type, reference = false){
		let isInstanceof = (object && object instanceof Type);

		if(isInstanceof && reference) return object;

		return new Type(object);
	}

	_data(){
		let __model = this._model();
		let __readOnly = this._readOnly();

		let toExport = {};
		toExport.id = this.id;

		for(let key in __model){
			toExport[key] = this[key];
		}

		for(let key in __readOnly){
			let field = __readOnly[key];
			toExport[field] = this[field];
		}

		return toExport;
	}

	_clone(){
		const clone = this._data();
		delete clone.id;
		return clone;
	}

	getById(_id){
		let search = this.getAll().filter((item, itemId)=>{
			return item.id === _id;
		})

		if(search.length === 1){
			return search[0];
		}

		return null;
	}

	getWithProps(){
		let returnData = {};

		for(let i in this){
			returnData[i] = this[i];
		}

		let descriptors = Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this));
		for(let i in descriptors){
			let descriptor = descriptors[i];

			if(descriptor.get){
				returnData[i] = this[i];
			}
		}
		
		return returnData;
	}

	get hash(){
		let keys = this._uniqueKey();
		let uniqueKey = '';

		keys.forEach((key)=>{
			uniqueKey += this[key];
		});

		if(!this.__hash || this.__uniqueKey !== uniqueKey){
			this.__uniqueKey = uniqueKey.toLowerCase();
			this.__hash = md5(uniqueKey.toLowerCase());
		}

		return this.__hash;
	}


	debug(){
		console.log('++++++++++++++++++++++++');
		console.log(...arguments);
		console.log('+++++++++++++++++++++++++');
	}
}

class ModelCollection extends Model{

	constructor(data){
		super(data);

		this.collection = {};

		if(data && data._ref){
			this._ref = data._ref;
		}

		if(data && data.collection){
			this.addAll(data.collection);
		}else if(data && Array.isArray(data)){
			this.addAll(data);
		}
	}

	_childType(){ return Model }

	_ref(){
		return null;
	}

	get length(){
		return Object.keys(this.collection).length;
	}

	getUniqueId(data){
		let dataInstance = this._cast(data, this._childType());

		let results = this.getAll().filter((element)=>{
			return !!dataInstance.hash && !!element.hash && dataInstance.hash === element.hash;
		});

		if(results.length > 0){
			return results[0].id;
		}

		return null;
	}

	add(dataInput){
		let data = dataInput;
		let dataInstance = null;

		let refCollection = this._ref();
		if(refCollection){
			let refInstance = refCollection.get(dataInput.id);

			if(refInstance){
				dataInstance = this._cast(refInstance, this._childType(), true);
			}
		}else{
			dataInstance = this._cast(data, this._childType());
		}

		let uniqueId = this.getUniqueId(dataInstance) || dataInstance.id;

		if(uniqueId) dataInstance.id = uniqueId;

		this.collection[uniqueId] = dataInstance;

		return dataInstance.id;
	}

	clean(){
		this.collection = {};
	}

	get(index){
		let result = this.collection[index];

		if(result) return result;

		return this.getAll()[index];
	}

	getByName(name){
		let searchResults = this.getAll().filter((element)=>{
			return element.name == name;
		})

		if(searchResults.length == 1) return searchResults[0];

		return null;
	}

	getAll(filter){
		if(!filter) return this._getAll(this.collection);

		return this._getAll(this.collection).filter(filter);
	}

	forEach(_callback){
		return this.getAll().forEach(_callback);
	}

	find(_callback){
		return this.getAll().find(_callback);
	}

	remove(data){
		if(data && this.collection[data.id]){
			delete this.collection[data.id];
			return true;
		}

		return false;
	}

	setAndClean(data){
		let dataInstance = this._cast(data, this._childType());

		this.collection = {
			[dataInstance.id]: dataInstance
		}
	}

	count(){
		return Object.keys(this.collection).length;
	}

	addAll(arrayData = []){
		for(let arrayId in arrayData){
			this.add(arrayData[arrayId]);
		}
	}

	_getAll(target){
		let returnList = [];

		for(let targetId in target){
			returnList.push(target[targetId]);
		}

		return returnList;
	}

	static instanceCollection(arrayData = []){
		let instance = new this();

		instance.addAll(arrayData);

		return instance;
	}
}

module.exports = { ModelCollection, Model };