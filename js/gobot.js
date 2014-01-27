// Creating the canvas
// -----------------------------------------------------------------------------
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 360;
var canvasElement = $("<canvas width='" + CANVAS_WIDTH +
                      "' height='" + CANVAS_HEIGHT + "'></canvas>");
var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('#board');

// LOOP
// -----------------------------------------------------------------------------
var FPS = 30;

//var update = new Event("Update");
//var draw =  new Event("Draw");

setInterval(function() {
    canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //document.dispatchEvent(update);
    //document.dispatchEvent(draw);
    $.event.trigger({type: "update"});
    $.event.trigger({type: "draw"});
}, 1000 / FPS);

function bind(scope, fn) {
    return function() {
        return fn.apply(scope, arguments);
    }
};

function round(n) {
    return Math.round(n * 1000) * .0001;
};

function normal_random(mean, variance) {
    if (mean == undefined)
        mean = 0.0;
    if (variance == undefined)
        variance = 1.0;
    var V1, V2, S;
    do {
        var U1 = Math.random();
        var U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
    } while (S > 1);
    
    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    //  Y = Math.sqrt(-2 * Math.log(S) / S) * V2;
    X = mean + Math.sqrt(variance) * X;
    //  Y = mean + Math.sqrt(variance) * Y ;
    return X;
}
Math.nrand = function(range) {
    return Math.floor(Math.random()* (range + 1));
};

function drawLine(begin, end, color, lineWidth) {
    canvas.save();
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = lineWidth || 3;
    canvas.strokeStyle = color || 'rgb(255, 45, 251)';
    canvas.stroke();
    canvas.closePath();
    canvas.restore();
}

function drawLine2(begin, angle, length, color, lineWidth) {
    angle = ((270 + angle) % 360);
    var end = {
        'x': (begin.x + length * Math.cos(angle * Math.PI / 180)),
        'y': (begin.y + length * Math.sin(angle * Math.PI / 180))
    };
    canvas.save();
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = lineWidth || 3;
    canvas.strokeStyle = color || 'rgb(255, 45, 251)';
    canvas.stroke();
    canvas.closePath();
    canvas.restore();
}

function drawCircle(center, color, r) {
    canvas.save();
    canvas.beginPath();
    canvas.lineWidth = 0;
    canvas.fillStyle = color || 'rgba(255, 55, 55, 1)';
    canvas.arc(center.x, center.y, (r || 4), 0, 2 * Math.PI, false);
    canvas.fill();
    canvas.closePath();
    canvas.restore();
}

function drawChart(data1, data2) {
    // Create and draw the visualization.
    var ac = new google.visualization.LineChart(document.getElementById('visualization1'));
    ac.draw(google.visualization.arrayToDataTable(data1), {
        title : '',
        //isStacked: true,
        legend: { position: 'bottom' },
        width: 525,
        height: 300,
        vAxis: {title: "Distance"},
        hAxis: {title: "Iteration"}
    });
    var ac = new google.visualization.LineChart(document.getElementById('visualization2'));
    ac.draw(google.visualization.arrayToDataTable(data2), {
        title : '',
        //isStacked: true,
        legend: { position: 'bottom' },
        width: 525,
        height: 300,
        vAxis: {title: "Weight"},
        hAxis: {title: "Iteration"}
    });
}
// INTERSECTIONS
// =============================================================================
function lineIntersect(p1, p2, p3, p4) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
    };
    denominator = ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y));
    if (denominator == 0) {
        return false;
    }
    a = p1.y - p3.y;
    b = p1.x - p3.x;
    numerator1 = ((p4.x - p3.x) * a) - ((p4.y - p3.y) * b);
    numerator2 = ((p2.x - p1.x) * a) - ((p2.y - p1.y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;
    
    result.x = p1.x + (a * (p2.x - p1.x));
    result.y = p1.y + (a * (p2.y - p1.y));
    
    if ((a > 0 && a < 1) && (b > 0 && b < 1)) 
        return new Point(result.x, result.y);
    else 
        return false;
    
};
isOnLine = function(p1, p2, p3, tolerate){
    tolerate = tolerate || 7;
    var slope = (p3.y - p2.y) / (p3.x - p2.x);
    var y = slope * p1.x + p2.y;
    if((y <= p1.y+tolerate && y >= p1.y-tolerate) && (p1.x >= p2.x && p1.x <= p3.x)) {
        return true;
    }
    return false;
};

// BOX MULLER
// =============================================================================
var BoxMuller = {
    random: function(mu, sigma){
        return mu + round(Math.sqrt(-2.0*Math.log(Math.random()))*
                          Math.cos(2*Math.PI*Math.random())*sigma);
    }
};
// GAUSSIAN
// =============================================================================
var Gaussian = {
    weight: //function(mean, std, x){
    function(mu, sigma, x){
        
        return (1 / (sigma * Math.sqrt(2.0 * Math.PI))) * Math.exp(-0.5 * Math.pow(((x - mu) / sigma), 2));
        
        //var constant = 1;//1/(std*Math.sqrt(2*Math.PI));
        //var exponent = (-1*(x - mean)*(x - mean))/(2*std*std);
        //return Math.floor(constant*Math.exp(exponent)*1000)*.0001;
        //return round(constant*Math.exp(exponent));
    }
};
// POINT
// =============================================================================
var Point = new Class({
    x: 0,
    y: 0,
    init: function(x, y) {
        this.x = x;
        this.y = y;
    },
    toString: function() {
        return '[' + this.x + ',' + this.y + ']';
    }
});
// MAP
// =============================================================================
var Map = new Class({
    coordinates: [],
    init: function(map) {
        this.coordinates = [];
        switch (map) {
            case '1':
                this.coordinates.push(new Point(10, 10));
                this.coordinates.push(new Point(630, 10));
                this.coordinates.push(new Point(630, 350));
                this.coordinates.push(new Point(10, 350));
                this.coordinates.push(new Point(10, 10));
                break;
            case '2':
                this.coordinates.push(new Point(10, 10));
                this.coordinates.push(new Point(130, 10));
                this.coordinates.push(new Point(130, 160));
                this.coordinates.push(new Point(430, 160));
                this.coordinates.push(new Point(430, 10));
                this.coordinates.push(new Point(630, 10));
                this.coordinates.push(new Point(630, 350));
                this.coordinates.push(new Point(10, 350));
                this.coordinates.push(new Point(10, 10));
                break;
            case '3':
                this.coordinates.push(new Point(10, 10));
                this.coordinates.push(new Point(415, 10));
                this.coordinates.push(new Point(415, 230));
                this.coordinates.push(new Point(425, 230));
                this.coordinates.push(new Point(425, 10));
                this.coordinates.push(new Point(630, 10));
                this.coordinates.push(new Point(630, 350));
                this.coordinates.push(new Point(225, 350));
                this.coordinates.push(new Point(225, 120));
                this.coordinates.push(new Point(215, 120));
                this.coordinates.push(new Point(215, 350));
                this.coordinates.push(new Point(10, 350));
                this.coordinates.push(new Point(10, 10));
                break;
        }
        log('CREATED MAP',map, this.coordinates.length);
        $(document).on('update', bind(this, this.update));
        $(document).on('draw', bind(this, this.draw));
    },
    update: function() {},
    draw: function() {
        for(var i in this.coordinates) {
            if(i>0)
                drawLine(this.coordinates[i-1], this.coordinates[i], '#111', 3);
        };
    }
});

// SENSOR
// =============================================================================
var Sensor = Class({
    ID: 0,
    size: 0,
    angle: 0,
    range: 0,
    noise: 0,
    distance: 0,
    marker: 0,
    intersection: 0,
    init: function(ID, size, angle, range, noise) {
        this.ID = ID;
        this.size = size;
        this.angle = (360 + angle) % 360;
        this.range = range;
        this.noise = noise;
        this.distance = 0;
        this.intersection = new Point(0, 0);
    },
    measure: function() {
        //return distance = range - (noise(noiseVal += noiseScale) * 2);
        //this.distance = this.range;
        this.distance = 0;
        //console.log('ROBOT', robot.x, robot.y, robot.angle);
        totalAngle = (360 + (this.angle + robot.angle)) % 360;
        
        //console.log('total angle', (totalAngle));
        this.marker = new Point(
            (robot.x + this.range * Math.sin(totalAngle * Math.PI / 180)),
            (robot.y - this.range * Math.cos(totalAngle * Math.PI / 180))
        );
        
        // laser
        //drawLine(robot, this.marker, 'rgb(0,255,0)');
        drawLine(robot, this.marker, 'rgba(246, 66, 36, .5)', 3);
        
        //console.log('laser', robot.x, robot.y, this.marker.x, this.marker.y);
        //var marker = this.marker;
        var distance = this.range;
        for (var i in map.coordinates) {
            var prev = map.coordinates[i - 1];
            var point = map.coordinates[i];
            if (!prev || !point)
                continue;
            
            var int = lineIntersect(robot, this.marker, prev, point);
            if (!int)
                continue;
            
            var d = Math.abs(Math.sqrt(Math.pow(robot.x - int.x, 2)
                                       + Math.pow(robot.y - int.y, 2)));
            if (d > distance)
                continue;
            
            drawLine(prev, point);
            
            this.intersection = int;
            this.distance = distance = round(d);
            log('distance: ' + this.distance);
            
        }
        //console.log('angle', totalAngle);
        //console.log('distance', this.distance);
        
        // UPDATE PARTICLES
        particles.sense(this.ID, this.angle, this.distance);
        particles.sense(this.ID, this.angle, this.distance);
        return this.distance == this.range ? 0 : BoxMuller.random(this.distance, this.noise);// = range;
    },
    draw: function(x, y, measuring) {
        canvas.save();
        canvas.beginPath();
        canvas.fillStyle = 'rgb(246, 66, 36)';
        
        canvas.translate(x, y);
        //canvas.translate(100, 100);
        //canvas.rotate(this.angle * Math.PI / 180);
        canvas.rotate((this.angle + robot.angle) * Math.PI / 180);
        canvas.moveTo(-this.size * .5, -this.size * .5);
        canvas.lineTo(-this.size * .5, -this.size * .5);
        canvas.lineTo(this.size * .5, -this.size * .5);
        canvas.lineTo(this.size * .5, this.size * .5);
        canvas.lineTo(-this.size * .5, this.size * .5);
        canvas.fill();
        canvas.closePath();
        canvas.restore();
        
        //canvas.translate(this.x + x, this.y + y);
        //canvas.rotate((this.angle + robot.angle) * Math.PI / 180);
        //canvas.fillRect(115, 115, 10, 10)
        //quad(-5, -5, 5, -5, 5, 5, -5, 5);
        
        if (measuring) {
            //console.log('angle', robot.angle, this.angle);
            this.measure();
            canvas.save();
            canvas.beginPath();
            canvas.fillStyle = 'rgba(46, 166, 36, .9)';
            canvas.translate(x, y);
            canvas.rotate((this.angle + robot.angle) * Math.PI / 180);
            canvas.moveTo(-1, 0);
            canvas.lineTo(-1, 0);
            canvas.lineTo(1, 0);
            canvas.lineTo(1, -this.distance);
            canvas.lineTo(-1, -this.distance);
            canvas.fill();
            canvas.closePath();
            canvas.restore();
            //console.log('measuring', distance);
            //console.log('intersection', intersection.x, intersection.y);
        }
        
        if (this.marker) {
            canvas.save();
            canvas.beginPath();
            canvas.lineWidth = 0;
            canvas.fillStyle = 'rgba(246, 66, 36, .5)';
            canvas.arc(this.marker.x, this.marker.y, 4, 0, 2 * Math.PI, false);
            canvas.fill();
            canvas.closePath();
            canvas.restore();
        }
        if (this.intersection) {
            canvas.save();
            canvas.beginPath();
            canvas.lineWidth = 0;
            canvas.fillStyle = 'rgba(46, 166, 36, .5)';
            canvas.arc(this.intersection.x, this.intersection.y, 4, 0, 2 * Math.PI, false);
            canvas.fill();
            canvas.closePath();
            canvas.restore();
        }
        //console.log('sensor');
    }
});


// ROBOT
// =============================================================================
var Robot = new Class({
    sensors: [],
    size: 0,
    x: 0,
    y: 0,
    angle: 0,
    speed: 0,
    noise: 0,
    sensorMeasuring: 0,
    p_cache: .5,
    init: function(size, x, y, angle, speed, noise) {
        this.size = size;
        this.x = x;
        this.y = y;
        this.angle = angle || 0;
        this.speed = speed || 5;
        this.noise = noise || 0;
        
        
        $(document).on('update', bind(this, this.update));
        $(document).on('draw', bind(this, this.draw));
        //document.addEventListener("Update", bind(this, this.update), false);
        //document.addEventListener("Draw", bind(this, this.draw), false);
    },
    addSensor: function(sensor) {
        this.sensors.push(sensor);
    },
    removeAllSensors: function() {
        this.sensors = [];
    },
    readSensors: function() {
        this.sensorMeasuring = 1;
    },
    stopSensors: function() {
        this.sensorMeasuring = 0;
    },
    checkTheWall: function(target){
        for (var i in map.coordinates) {
            var prev = map.coordinates[i - 1];
            var point = map.coordinates[i];
            if (!prev || !point)
                continue;
            var int = lineIntersect(robot, target, prev, point);
            if(int)
                return true;            
        }
    },
    go: function(step) {
        var target = new Point( 
            this.x + BoxMuller.random(step, robot.noise) * Math.sin(this.angle * Math.PI / 180),
            this.y + BoxMuller.random(step, robot.noise) * -Math.cos(this.angle * Math.PI / 180)
        );
        if(!this.checkTheWall(target)){
            this.x = target.x;
            this.y = target.y;
        }
    },
    turn: function(angle) {
        //log('* angle: ' + this.angle);
        this.angle += BoxMuller.random(angle, robot.noise);
        this.angle = (360 + (this.angle)) % 360;
        
    },
    move: function(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        //display();
    },
    update: function() {
        if (key.space === 'down')
            this.readSensors();
        else if(key.space === 'up')
            this.stopSensors();
        
        if (key.up === 'down') 
            this.go(this.speed);
        
        if (key.down === 'down')
            this.go(-this.speed);
        
        if (key.left === 'down')
            this.turn(-this.speed);
        
        if (key.right === 'down')
            this.turn(this.speed);
    },
    draw: function() {
        canvas.save();
        canvas.beginPath();
        canvas.fillStyle = "rgb(17, 136, 221)";
        canvas.translate(this.x, this.y);
        canvas.rotate(this.angle * Math.PI / 180);
        canvas.moveTo(0, -this.size * .5);
        canvas.lineTo(0, -this.size * .5);
        canvas.lineTo(-this.size * .5, this.size * .5);
        canvas.lineTo(this.size * .5, this.size * .5);
        canvas.fill();
        //canvas.fillRect(0, 0, 10, 10);
        canvas.closePath();
        canvas.restore();
        // display sensors
        var x = this.x, y = this.y, sensorMeasuring = this.sensorMeasuring;
        this.sensors.forEach(function(sensor) {
            sensor.draw(x, y, sensorMeasuring);
        });
    },
    toString: function(){
        return '[' + this.x + ',' + this.y + ']';
    }
});

// PARTICLE
// =============================================================================
var Particle = new Class({
    x: 0,
    y: 0,
    angle: 0,
    weight: 1,
    probability: 1,
    size: 5, 
    sensors: [],
    init: function(x, y, angle, weight, probability) {
        this.x = x; 
        this.y = y; 
        this.angle = angle; 
        this.weight = weight; 
        this.probability = probability; 
        
        $(document).on('update', bind(this, this.update));
        $(document).on('draw', bind(this, this.draw));
        
    },
    calculate: function(){
        this.computeWeights();
    },
    addSensor: function(i, angle, range, noise) {
        this.sensors[i] = {'angle': angle, 'range': range, 'noise':noise, 'distance':0};
        //console.log('SENSORS', i, angle, range);
    },
    getDistance: function(sensor) {
        
        sensor.distance = 0;
        //console.log('ROBOT', robot.x, robot.y, robot.angle);
        totalAngle = (360 + (this.angle + sensor.angle)) % 360;
        
        //console.log('total angle', (totalAngle));
        sensor.marker = new Point(
            (this.x + sensor.range * Math.sin(totalAngle * Math.PI / 180)),
            (this.y - sensor.range * Math.cos(totalAngle * Math.PI / 180))
        );
        
        var marker = sensor.marker;
        var distance = sensor.range;
        for (var i in map.coordinates) {
            var prev = map.coordinates[i - 1];
            var point = map.coordinates[i];
            if (!prev || !point)
                continue;
            
            var int = lineIntersect(this, marker, prev, point);
            if (!int)
                continue;
            
            var d = Math.abs(Math.sqrt(Math.pow(this.x - int.x, 2)
                                       + Math.pow(this.y - int.y, 2)));
            if (d > distance)
                continue;
            
            sensor.intersection = int;
            sensor.distance = distance = round(d);
            //log('sensor distance: ' + sensor.distance);
            
        }
        return sensor.distance == sensor.range ? 0 : sensor.distance;
    },
    computeWeights: function(){
        for(var i in this.sensors){
            this.sensors[i].distance = this.getDistance(this.sensors[i]);
            this.weight *= Gaussian.weight(robot.sensors[i].distance, 1, this.sensors[i].distance);
            //log('DISTANCE '+ this.sensors[i].distance);
        }
    },
    checkTheWall: function(target){
        for (var i in map.coordinates) {
            var prev = map.coordinates[i - 1];
            var point = map.coordinates[i];
            if (!prev || !point)
                continue;
            var int = lineIntersect(this, target, prev, point);
            if(int)
                return true;            
        }
    },
    go: function(step) {
        var target = new Point( 
            this.x + BoxMuller.random(step, robot.noise) * Math.sin(this.angle * Math.PI / 180),
            this.y + BoxMuller.random(step, robot.noise) * -Math.cos(this.angle * Math.PI / 180)
        );
        if(!this.checkTheWall(target)){
            this.x = target.x;
            this.y = target.y;
        }
    },
    turn: function(angle) {
        this.angle += BoxMuller.random(angle, robot.noise);
        this.angle = (360 + (this.angle)) % 360;
    },
    update: function() {
        if (key.up === 'down') 
            this.go(robot.speed);
        
        if (key.down === 'down') 
            this.go(-robot.speed);
        
        if (key.left === 'down') 
            this.turn(-robot.speed);
        
        if (key.right === 'down') 
            this.turn(robot.speed);
    },
    draw: function() {
        drawLine2(this, this.angle, this.size+1, 'rgba(0,155,155,.8)', 1);
        //drawCircle(this, 'rgba(255,155,155,'+this.weight+')', this.size)
        drawCircle(this, 'rgba(255,155,155,.5)', this.size)
    },
    toString: function(){
        return '[' + this.x + ',' + this.y + ']';
    }
});

var Particles = new Class({
    width: 0,
    height: 0,
    list: [],
    percent: 10,
    init: function(width, height, count, percent) {
        this.width = width;
        this.height = height;
        this.percent = percent;
        for(var i=0; i < count; i++){
            this.list[i] = new Particle(
                //120 + i*15,//Math.nrand(width),
                //90 + i*5,//Math.nrand(height),
                //0,//Math.nrand(360),
                Math.nrand(width),
                Math.nrand(height),
                Math.nrand(360),
                1,
                1 / count
            );
            for(var j in robot.sensors)
                if(robot.sensors[j] instanceof Sensor)
                    this.list[i].addSensor(j, robot.sensors[j].angle, robot.sensors[j].range, robot.sensors[j].distance, robot.sensors[j].noise);
        }
        
        $(document).on('update', bind(this, this.update));
    },
    sense: function(ID, angle, distance) {},
    normalizeWeights: function(){
        var totalWeight = 0;
        for(var i in this.list)
            if(this.list[i] instanceof Particle)
                totalWeight += this.list[i].weight;
        totalWeight == round(totalWeight);
        log('TOTAL WEIGHT: ' + totalWeight);
        log('PARTICLE COUNT: ' + this.list.length);
        var highWeightParticle = {'weight':0};
        for(var i in this.list)
            if(this.list[i] instanceof Particle){
                this.list[i].weight = this.list[i].weight / totalWeight;
                if(highWeightParticle.weight < this.list[i].weight)
                    highWeightParticle = this.list[i];
                //log('PARTICLE Normalize Weight: ' +  this.list[i].weight);
            }
        
        // sort particles
        this.list.sort(function(a, b) {return b.weight - a.weight});
        
        // resample from top "q" in particles 
        var q = this.list.length * this.percent * .01 >> 0;
        
        // move particles
        for(var i = q; i < this.list.length; i++)
            if(this.list[i] instanceof Particle){
                this.list[i].x = BoxMuller.random(this.list[i-q].x, 20);
                this.list[i].y = BoxMuller.random(this.list[i-q].y, 20);
                this.list[i].angle = BoxMuller.random(this.list[i-q].angle, 20);
            }
        
        // visualitaion
        // sort particles
        this.list.sort(function(a, b) {return b.weight - a.weight});
        // calculate with top 1 particle
        var d = Math.abs(Math.sqrt(Math.pow(robot.x - this.list[0].x, 2)
                                   + Math.pow(robot.y - this.list[0].y, 2)));
        drawLine(robot, this.list[0], '#0f0', 1);
        //log('distance: ' + d);
        
        // visualiton data
        data1.push([++iteration, d]);
        data2.push([iteration, this.list[0].weight]);
        drawChart(data1, data2);
        
        
    },
    update: function() {
        if (key.space === 'up') {
            //this.readSensors();
            log('space up','calculate');
            key.space = 0;
            for(var i in this.list)
                if(this.list[i] instanceof Particle){
                    this.list[i].calculate();
                }
            this.normalizeWeights();
        }
    }
});





// =============================================================================
// =============================================================================
// /MONTE CARLO
// =============================================================================
// =============================================================================
/*
function MCL(cell, u, z) {
    
    if (u)
        cell.p = move(cell.p, u);
    if (z)
        sense(cell, z);
    //return Xt;
}

function move(p, move) {
    return p;
    var moved = robot.p_cache * 1;
    var nomoved = p * (1 - 1);
    return robot.p_cache = (moved + nomoved);
}

function sense(cell, distance) {
    var marker = new Point(
        (cell.point.x + distance * Math.sin(robot.angle * Math.PI / 180)),
        (cell.point.y - distance * Math.cos(robot.angle * Math.PI / 180))
    );
    for (var i in map.coordinates) {
        var prev = map.coordinates[i - 1];
        var point = map.coordinates[i];
        if (!prev || !point)
            continue;
        
        var int = lineIntersect(cell.point, marker, prev, point);
        if (int) {
            //drawCircle(cell.point, 'rgb(200,0,200)', 5);
            var d = Math.floor(Math.abs(Math.sqrt(Math.pow(cell.point.x - int.x, 2)
                                                  + Math.pow(cell.point.y - int.y, 2))));
            //console.log(cell.point.x, cell.point.y, d, distance);
            //log(cell.size);
            if (d >= (distance - cell.size * .5) && d <= (distance + cell.size * .5)) {
                drawCircle(cell.point, 'rgb(0,0,200)', 10);
                cell.p += cell.p * .9;
                //log(cell.point.x + 'x' + cell.point.y + ' : ' + cell.p);
                return;
            }
        }
        cell.p -= cell.p * .1;
    }
}

*/
function log(l) {
    var args = Array.prototype.slice.call(arguments, 1);
    $('#log').val(l + ' ' + args.join(' ') + "\n" + $('#log').val());
}

var robot, map, particles, iteration, data1, data2;

function generate(e) {
    log('GENERATE');
    
    iteration = 0;
    data1 = [['Iteration','Distance']];
    data2 = [['Iteration','Weight']];
    $(document).off('update');
    $(document).off('draw');
    map = new Map($('input[name="map"]:checked').val());
    robot = new Robot(
        20,
        $('input[name="robot[x]"]').val() * 1,
        $('input[name="robot[y]"]').val() * 1,
        $('input[name="robot[angle]"]').val() * 1,
        $('input[name="robot[speed]"]').val() * 1,
        $('input[name="robot[noise]"]').val() * 1
    );
    robot.removeAllSensors();
    if ($('input[name="sensor[1][add]"]:checked').val())
        robot.addSensor(
            new Sensor(robot.sensors.length, 5,
                       $('input[name="sensor[1][angle]"]').val() * 1,
                       $('input[name="sensor[1][range]"]').val() * 1,
                       $('input[name="sensor[2][noise]"]').val() * 1
                      ));
    if ($('input[name="sensor[2][add]"]:checked').val())
        robot.addSensor(
            new Sensor(robot.sensors.length, 5,
                       $('input[name="sensor[2][angle]"]').val() * 1,
                       $('input[name="sensor[2][range]"]').val() * 1,
                       $('input[name="sensor[2][noise]"]').val() * 1
                      ));
    if ($('input[name="sensor[3][add]"]:checked').val())
        robot.addSensor(
            new Sensor(robot.sensors.length, 5,
                       $('input[name="sensor[3][angle]"]').val() * 1,
                       $('input[name="sensor[3][range]"]').val() * 1,
                       $('input[name="sensor[3][noise]"]').val() * 1
                      ));
    
    //Particle =  clone(robot);
    //console.log(Particle);
    
    particles = new Particles(CANVAS_WIDTH, CANVAS_HEIGHT, 
                              $('input[name="particles[count]"]').val() * 1,
                              $('input[name="particles[percent]"]').val() * 1
                             );
    //grid = new Grid(CANVAS_WIDTH, CANVAS_HEIGHT, $('input[name="grid[size]"]').val() * 1);
    
}
$('#generate').on('click', generate);
generate();

function kidnap(e) {
    robot.move(
        $('input[name="kidnap[x]"]').val() * 1,
        $('input[name="kidnap[y]"]').val() * 1,
        $('input[name="kidnap[angle]"]').val() * 1
    );
}
$('#kidnap').on('click', kidnap);