const getCore = ()=>{
	const World = require('./world');
	return World.instance();
}

module.exports = getCore;