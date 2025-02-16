"use strict";

var gl;

// ADD COLOURS!
var colours;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Initialize our data for a single triangle
    //
    
    // First, initialize the  three points.

    var points = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];
	
	// ADD COLOURS! Note how we have one colour for each vertex
    colours = [
        vec3(1.0, 0.0 , 0.0), 
        vec3(0.0, 1.0 , 0.0), 
        vec3(0.0, 0.0 , 1.0)
    ];

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var positionBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aPosition );
	
	// Same for colours, we now need to pass along additional colour data with the vertex!
	// ADD COLOURS!
	var colourBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colourBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colours), gl.STATIC_DRAW );
	
	var aColour = gl.getAttribLocation( program, "aColour" );
    gl.vertexAttribPointer( aColour, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aColour );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
}
