

/*Suppose your linear function is 

f(x) = ax + b. 
Then f(0.1) = 0.25, 
and f(1) = 0.75. 
a * 0.1 + b = 0.25, 
a * 1 + b = 0.75, 
so b = 0.75 - a. 
a * 0.1 + (0.75 - a) = 0.25, so a = 5 / 9, (-.9a = -.5)

and so b = 7 / 36. Checking, (5 / 9) * 0.1 + 7 / 36 = 0.25, and (5 / 9) + 7 / 36 = 0.75.

a = .1 b = 1
c = .25 d = .75

But anyway, you can conclude by yourself that n = (c - d) / (a - b), and m = c - a * n, so you know how to find both n and m.

n = .555556 -- scale
m = .19444 -- offset

*/

var dp = 2;

var num = [];

for(var i = 0; i <= 12; i++){
	num[i] = i;
}

var initialScale = .01;

var scale = 0;
var offset = 0;

var ostart = num[0], ofinish = num[num.length-1];

for(var s = 1; s <= 4; s++){
	var out = "";

	//we don't want to offset the original scaling 
	start = (ofinish / 2) - (ofinish / Math.pow(2, s)); 
	finish = (ofinish / 2) + (ofinish / Math.pow(2, s)); 
console.log(start + " : " + finish + " : " + ostart + " : " + ofinish);	
	scale = ( start - finish) / ( ostart - ofinish );
	offset = start - ( ostart * scale );

	for(var i = 0; i < num.length; i++){
		out += " " +i + ": " + ( (num[i] * scale + offset).toFixed(dp) );
	}

	out += " -- scale " + (scale.toFixed(dp));
	out += " -- offset " +(offset.toFixed(dp));
  console.log(out);
} 
