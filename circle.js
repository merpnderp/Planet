//z -> y
//y -> x
//x -> z
//phi -> xz plane
//theta -> xy plane

function vector(){
	this.x;
	this.y;
	this.z;
}

function toViewSpace(phi, theta){ 
	var p = new vector();
	p.x = Math.sin(phi) * Math.sin(theta);
	p.z = Math.cos(phi) * Math.sin(theta);
	p.y = Math.cos(theta);
	return p;
}

function toWorldSpace(v, phi, theta){
	var p = new vector();
	p.x = Math.cos(theta) * v.x - Math.sin(theta) * v.z;
	p.z = v.z;
	p.y = -Math.sin(theta) * v.x + Math.cos(theta) * v.z;
	return p;
}

function toAngles(v, theta){
	var p = Math.atan(v.z/v.x);
	var t = Math.acos(v.y) - theta;
	return [p,t];
}

//var phi = -Math.PI;
var phi = Math.PI/2;
var theta = Math.PI/2;

console.log("\nStarting with: " + phi + " : " + theta + "\n");
var p = toViewSpace(phi, theta);
console.log(p);
var w = toWorldSpace(p, theta, phi);
console.log(w);
var a = toAngles(p, theta);
console.log(a);
console.log("\n");

console.log(Math.pow(9,.5));





