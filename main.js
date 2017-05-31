/**
 * The main script for the generative mesh test inclusing automatical tweening.
 *
 * @requies  Complex, Graph, jQuery, Tween (https://github.com/tweenjs/tween.js)
 *
 * @author   Ikaros Kappler
 * @date     2017-05-31
 * @version  1.0.0
 **/

$( document ).ready( function() {

    
    //-------------------------------------------
    // Initialize global vars.
    //-------------------------------------------
    var $canvas       = $( 'canvas#my_canvas' );
    var ctx           = $canvas[0].getContext('2d');
    var $debug        = $( 'div#debug' );

    var canvas_width  = 640;
    var canvas_height = 640;

    var offset        = { x : canvas_width/2, y : canvas_height/2 };
    var scale         = { x : 1.0, y : 1.0 };


    
    //-------------------------------------------
    // Define some helper functions.
    //-------------------------------------------
    var irand         = function(n) {
	return Math.floor( Math.random()*n );
    };

    var randomSign = function() {
	return Math.random()<0.5 ? -1 : 1;
    };
    
    var randomPoint   = function(max_x, max_y) {
	return new Complex( irand(max_x), irand(max_y) );
    };

    var circlePoint   = function( r, alpha ) {
	return new Complex( Math.cos(alpha)*r, Math.sin(alpha)*r );
    };

    var getPolyCentroid = function( points ) {
	var centroid = new Complex(0,0);
	if( !points || !points.length )
	    return centroid;
	for( var i = 0; i < points.length; i++ ) 
	    centroid.add( points[i] );
	centroid.set( centroid.re()/points.length, centroid.im()/points.length );
	console.log( 'centroid=' + centroid );
	return centroid;
    };
    
    var createRandomizedPoint = function( sourcePoint ) {
	var type = getRadioInput('animation-type');
	console.log('animation-type: ' + type );
	if( type == 'deviation' ) {
	    var deviation = getIntegerInput('deviation');
	    console.log('deviation: ' + deviation );
	    return sourcePoint.clone().add( randomPoint(deviation*randomSign(), deviation*randomSign()) );
	} else if( type == 'polycentroid' ) { 
	    return getPolyCentroid(graph.points());
	} else { // type == 'random'
	    return randomPoint( canvas_width/2*randomSign(), canvas_height/2*randomSign() );
	}
    };
    
    var locateGraphPointAt = function(pos, tolerance) {
	for( index in graph.points() ) {
	    var p = graph.points()[index];
	    console.log( 'pos='+pos+', p='+p+', distance=' + distance(p,pos) );
	    if( distance(p,pos) <= tolerance ) {
		console.log( 'Point found! ('+index+')' );
		return index;
	    }
	}
	return -1;
    };

    var distance = function( a, b ) {
	return Math.sqrt( Math.pow(a.re()-b.re(),2) + Math.pow(a.im()-b.im(),2) )
    };



    //-------------------------------------------
    // Build the graph.
    //-------------------------------------------
    var n             = getIntegerInput('node_count'); 
    var graph         = null;

    var rebuild = function() {
	n             = getIntegerInput('node_count');
	graph = new Graph( [], { undirected : true } );
	for( var i = 0; i < n; i++ ) {
	    //graph.points().push( randomPoint() );
	    var p = circlePoint( canvas_width/3, Math.PI*2*(i/n) );
	    var jitter = randomPoint( (canvas_width-canvas_width/2)/3, (canvas_height-canvas_height/2)/3  );
	    p.add( jitter );
	    graph.points().push( p );
	    if( i > 0 ) graph.connect(i-1,i);
	    if( i+1 >= n ) graph.connect(i,0);
	}
	draw( ctx );
    }



    //-------------------------------------------
    // Draw the graph.
    //-------------------------------------------
    function draw(ctx) {
	// Cleaning canvas?
	ctx.fillStyle='white';
	ctx.fillRect(0,0,canvas_width,canvas_height);
	ctx.translate(0.5,0.5); // Fix for the half-pixel issue
	ctx.lineWidth   = 0.5;
	// Draw crosshair at origin?
	if( false ) {
	    ctx.beginPath();
	    ctx.moveTo( 0, offset.y );
	    ctx.lineTo( canvas_width, offset.y );
	    ctx.moveTo( offset.x, 0 );
	    ctx.lineTo( offset.x, canvas_height );
	    ctx.strokeStyle = '#a8ffd8';
	    ctx.stroke();
	}
	// Draw shape
	draw_shape( ctx );
	ctx.translate(-0.5,-0.5); // Fix for the half-pixel issue
    }

    // This draws the graph in its current configuration [O(n*(log n))].
    function draw_shape( ctx ) {
	ctx.beginPath();
	for( var a = 0; a < n; a++ ) {
	    for( var b = 0; b < a; b++ ) {
		if( graph.connected(b,a) ) {
		    ctx.moveTo( offset.x+graph.points()[a].re()*scale.x,
				offset.y+graph.points()[a].im()*scale.y );
		    ctx.lineTo( offset.x+graph.points()[b].re()*scale.x,
				offset.y+graph.points()[b].im()*scale.y );
		}
	    }
	}
	ctx.strokeStyle = 'black';
	ctx.stroke();
	
    }

    

    //-------------------------------------------
    // Initialize everything.
    //-------------------------------------------
    rebuild();


        
    //-------------------------------------------
    // Well, some simple animation using tweening.
    //-------------------------------------------
    var animate = function() {
	// Requires: Tween.js

	// Build two maps: start positions and target positions.
	var from       = {};
	var to         = {};
	for( index in graph.points() ) {
	    var p          = graph.points()[index];
	    var target     = createRandomizedPoint(p); 
	    from['p'+index+'x'] = p.re();
	    from['p'+index+'y'] = p.im();
	    to['p'+index+'x']   = target.re();
	    to['p'+index+'y']   = target.im();
	}
	console.log( 'target positions: ' + JSON.stringify(to) );
	// Now define the tweening from current positions to target positions.
	var easing = getEasingInput();
	if( !TWEEN.Easing[easing.name] )               easing.name  = 'Linear';
	if( !TWEEN.Easing[easing.name][easing.inout] ) easing.inout = 'In';
	console.log( 'Easing: ' + JSON.stringify(easing) ); //+ ', easing function: ' + TWEEN.Easing[easing.name][easing.inout]  );
	//console.log( 'Eases: ' + JSON.stringify(TWEEN.Easing.Linear.In) );
	var tween = new TWEEN.Tween( from );
	if( easing.name != 'Linear' )
	    tween.easing( TWEEN.Easing[easing.name][easing.inout] ) // || TWEEN.Easing.Linear.In )
	//.easing( TWEEN.Easing.Quadratic.In )
	tween.to( to, 1000 )
	    .onUpdate( function() {
		//console.log('updated');
		for( index in graph.points() ) {
		    var p = graph.points()[index];
		    p.set( this['p'+index+'x'], this['p'+index+'y'] );
		}
		draw_shape(ctx);
	    } );
	tween.start();

	
	// Start the animation ticker.
	var time = 0;
	var interval = 10;
	var intervalKey = window.setInterval( function() {
	    TWEEN.update();
	    time += interval;
	    if( time >= 1000 ) {
		clearInterval(intervalKey);
		intervalKey = null;
	    }
	}, interval );
    };
    


    //-------------------------------------------
    // Build the easing dropdown.
    // (with values from the library)
    //-------------------------------------------
    var $easing = $( 'select#easing' );
    for( name in TWEEN.Easing ) {
	console.log( name ); //+ ': ' + TWEEN.Easing[name]['In'] );
	$easing.append( $('<option/>').data('name',name).data('inout','In').html( name + '.In' ) );
	$easing.append( $('<option/>').data('name',name).data('inout','Out').html( name + '.Out' ) );
    }

    
    //-------------------------------------------
    // Event handling.
    //-------------------------------------------
    $( 'input#node_count' ).change( rebuild );
    $( 'button#reload' ).click( rebuild );
    $( 'button#animate' ).click( animate );

    var canvasPosition2Complex = function(event) {
	var rect = $canvas[0].getBoundingClientRect();
        var x = event.clientX - rect.left,
	    y = event.clientY - rect.top;

	//return { x : x, y : y };
	return new Complex( (x-offset.x)/scale.x, (y-offset.y)/scale.y );
    };

    var mouseDown                = false;
    var mouseDownPosition        = null;
    var draggedPointIndex        = -1;
    var draggedPoint             = null;
    var mouseDownPointDifference = null;
    $canvas.mousedown( function(event) {
	mouseDown = true;
	mouseDownPosition = canvasPosition2Complex(event);
	draggedPointIndex = locateGraphPointAt( mouseDownPosition, 10 );
	if( draggedPointIndex != -1 ) {
	    draggedPoint             = graph.points()[draggedPointIndex];
	    mouseDownPointDifference = draggedPoint.clone().sub( mouseDownPosition );
	    console.log( 'begin drag of point ' + draggedPointIndex + ' difference=' + mouseDownPointDifference );
	} else {
	    draggedPoint             = null;
	    mouseDownPointDifference = null;
	}
    } );
    $canvas.mouseup( function(event) {
	mouseDown         = false;
	mouseDownPosition = null;
	if( draggedPointIndex != -1 )
	    console.log( 'end drag of point ' + draggedPointIndex );
	draggedPointIndex = -1;
	draggedPoint      = null;
    } );
    $canvas.mousemove( function(event) {
	if( !mouseDown || !draggedPoint ) 
	    return;
	var z = canvasPosition2Complex(event);
	//$debug.empty().html( JSON.stringify(z) );

	var diff = mouseDownPosition.clone().sub( z );
	if( draggedPoint ) {
	    // console.log( 'move difference: ' + diff );
	    draggedPoint.sub( diff );
	}
	mouseDownPosition = z;

	console.log( 'draw_shape ... ' );
	draw_shape( ctx );
    } );
   
} );


var getFloatInput = function(id) {
    return parseFloat( document.getElementById(id).value );
}

var getIntegerInput = function(id) {
    return parseInt( document.getElementById(id).value );
}

var getRadioInput = function(name) {
    return $( 'input[type=radio][name="'+name+'"]:checked' ).val();
};

var getEasingInput = function() {
    var $option = $('select#easing').find('option:selected');
    return { name : $option.data('name'), inout : $option.data('inout') };
};
