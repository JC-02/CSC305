"use strict";

var gl;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Initialize our data for a single square
    //

    // First, initialize four points.

	var vertices = [
		vec2( -0.5, -0.5 ),
		vec2(  -0.5,  0.5 ),
		vec2(  0.5, 0.5 ),
		vec2( 0.5, -0.5)
	];


	//  Configure WebGL

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

	//  Load shaders and initialize attribute buffers

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Create a buffer to store the data to load into the GPU

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

	// Associate our (vertex) shader variable (aPosition) with our new data buffer

	var aPosition = gl.getAttribLocation( program, "aPosition" );
	gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray(aPosition);

	render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}
