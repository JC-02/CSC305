var canvas;
var gl;

var program;

var near = 1;
var far = 100;


var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0;
var RY = 0;
var RZ = 0;

var MS = []; // The modeling matrix stack
var TIME = 0.0; // Realtime
var dt = 0.0
var prevTime = 0.0;
var resetTimerFlag = true;
var animFlag = false;
var controller;

// These are used to store the current state of objects.
// In animation it is often useful to think of an object as having some DOF
// Then the animation is simply evolving those DOF over time. You could very easily make a higher level object that stores these as Position, Rotation (and also Scale!)
var sphereRotation = [0,0,0];
var spherePosition = [-2,0,0];

var cubeRotation = [0,0,0];
var cubePosition = [-0,0,0];

var cylinderRotation = [0,0,0];
var cylinderPosition = [1.1,0,0];

var coneRotation = [0,0,0];
var conePosition = [3,0,0];

// Setting the colour which is needed during illumination of a surface
function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0, 0, 0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse);
	
	// Initialize some shapes, note that the curved ones are procedural which allows you to parameterize how nice they look
	// Those number will correspond to how many sides are used to "estimate" a curved surface. More = smoother
    Cube.init(program);
    Cylinder.init(100,program);
    Cone.init(20,program);
    Sphere.init(36,program);

    // Matrix uniforms
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    // Lighting Uniforms
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );


    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true;
            resetTimerFlag = true;
            window.requestAnimFrame(render);
        }
        //console.log(animFlag);
    };

    render(0);
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix);
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV();   
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCube() {
    setMV();
    Cube.draw();
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawSphere() {
    setMV();
    Sphere.draw();
}

// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCylinder() {
    setMV();
    Cylinder.draw();
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
// Sets the attributes and calls draw arrays
function drawCone() {
    setMV();
    Cone.draw();
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result, x, y, and z are the translation amounts for each axis
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z]));
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result, theta is the rotation amount, x, y, z are the components of an axis vector (angle, axis rotations!)
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z]));
}

// Post multiples the modelview matrix with a scaling matrix
// and replaces the modeling matrix with the result, x, y, and z are the scale amounts for each axis
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz));
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop();
}

// pushes the current modelViewMatrix in the stack MS
function gPush() {
    MS.push(modelMatrix);
}

// stars

var stars = [];
var numStars = 60;
stars_min_size = 0.01
stars_max_size = 0.06

for (var i = 0; i < numStars; i++) {
    stars.push({
        x: Math.random() * (right - left) - right,
        y: Math.random() * (ytop - bottom) - ytop,
        size: Math.random() * (stars_max_size - stars_min_size) + stars_min_size
    });
}

var astronautPosition = [0, 0, 0];
var hit_left = 0;
var hit_bottom = 0;
var arm1Rotation = 45;
var arm2Rotation = -45;
var leg1Rotation = 30;
var leg2Rotation = -30;
var leg1upperRotation = 30;
var leg2upperRotation = -30;
var leg1lowerRotation = 20;
var leg2lowerRotation = -20;

var jellyfishPosition = [0, 0, -2];
var jellyfishRotation = 0;
var tentacleWaveSpeed = 10;
var jellyfishOrbitSpeed = 0.3;
var jellyfishOrbitRadius = 2.3;
var jellyfishAngle = 0;

function render(timestamp) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,10);
    MS = []; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4();
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    
    
    // set all the matrices
    setAllMatrices();
    
	if( animFlag )
    {
		// dt is the change in time or delta time from the last frame to this one
		// in animation typically we have some property or degree of freedom we want to evolve over time
		// For example imagine x is the position of a thing.
		// To get the new position of a thing we do something called integration
		// the simpelst form of this looks like:
		// x_new = x + v*dt
		// That is, the new position equals the current position + the rate of of change of that position (often a velocity or speed) times the change in time
		// We can do this with angles or positions, the whole x,y,z position, or just one dimension. It is up to us!
		dt = (timestamp - prevTime) / 1000.0;
		prevTime = timestamp;
	}
	
	
    
    if( animFlag )
        window.requestAnimFrame(render);

    drawStars();
    drawAstronaut();
    drawJellyfish();
    updateStars(dt);
    updateAstronaut(dt);
    updateJellyfish(dt);

    function drawStars() {
        min = 0.01
        max = 0.1
        for (var i = 0; i < numStars; i++) {
            gPush();
                gTranslate(stars[i].x, stars[i].y, -10);
                gScale(stars[i].size, stars[i].size, stars[i].size);
                setColor(vec4(1.0, 1.0, 1.0, 1.0));
                drawSphere();
            gPop();
        }
    }
    
    function updateStars(dt) {
        var starSpeed = 0.75;
        for (var i = 0; i < numStars; i++) {
            stars[i].x += dt * starSpeed;
            stars[i].y += dt * starSpeed;
            
            if (stars[i].x > 6) {
                stars[i].x = stars[i].x - 12;
            }
    
            else if (stars[i].y > 6) {
                stars[i].y = stars[i].y - 12;
            }
        }
        return dt
    }

    function drawAstronaut() {
        gPush();
    
            gTranslate(astronautPosition[0], astronautPosition[1], astronautPosition[2]);
    
            gRotate(10, 1, 0, 0);
            gRotate(-20, 0, 1, 0);
            
            // head
            gPush();
                setColor(vec4(1.0, 1.0, 1.0, 1.0));
                gTranslate(0, 1.2, 0);
                gScale(0.4, 0.4, 0.4);
                drawSphere();
    
                // visor
                setColor(vec4(0.65, 0.35, 0.0, 1.0));
                gTranslate(0, 0, 0.7);
                gScale(0.9, 0.7, 0.4);
                drawSphere();
            gPop();
            
            // body
            gPush();
                setColor(vec4(0.8, 0.8, 0.8, 1.0));
                gTranslate(0, -0.15, -0.04);
                gScale(0.6, 1.0, 0.4);
                drawCube();
                
                // arms
                gPush();
                    gPush();
                        setColor(vec4(0.8, 0.8, 0.8, 1.0));
                        gTranslate(1.5, 0.25, 0.5);
                        gRotate(arm1Rotation, 0, 0, 1);
                        gScale(0.2, 0.6, 0.5);
                        drawCube();
                    gPop();
                gPop(); 
                gPush();
                    setColor(vec4(0.8, 0.8, 0.8, 1.0));
                    gTranslate(-1.5, 0.25, -0.5);
                    gRotate(arm2Rotation, 0, 0, 1);
                    gScale(0.2, 0.6, 0.5);
                    drawCube();
                gPop();
    
                // legs
                gPush();
                    setColor(vec4(0.8, 0.8, 0.8, 1.0));
                    gTranslate(0.6, -1.3, -0.2);
                    gRotate(leg1upperRotation, 1, 0, 0);
                    gScale(0.2, 0.4, 0.35);
                    drawCube();
                    gPush();
                        gTranslate(0, -1.3, -0.3);
                        gRotate(leg1lowerRotation, 1, 0, 0);
                        gScale(1, 1, 0.75);
                        drawCube();
                        gPush();
                            gTranslate(0, -1, 0.5);
                            gScale(1.2, 0.25, 1.25);
                            drawCube();
                        gPop();
                    gPop();
                gPop();
                gPush();
                    setColor(vec4(0.8, 0.8, 0.8, 1.0));
                    gTranslate(-0.6, -1.3, -0.2);
                    gRotate(leg2upperRotation, 1, 0, 0);
                    gScale(0.2, 0.4, 0.35);
                    drawCube();
                    gPush();
                        gTranslate(0, -1.3, -0.3);
                        gRotate(leg2lowerRotation, 1, 0, 0);
                        gScale(1, 1, 0.75);
                        drawCube();
                        gPush();
                            gTranslate(0, -1, 0.5);
                            gScale(1.2, 0.25, 1.25);
                            drawCube();
                        gPop();
                    gPop();
                gPop();
    
                // patch
                setColor(vec4(0.2, 0.2, 0.7, 1.0));
                gTranslate(-0.5, 0.65, 1);
                gScale(0.3, 0.19, 0.05);
                drawSphere();
    
                // dark blue outlets
                setColor(vec4(0.2, 0.2, 0.7, 0.0));
                gTranslate(0.7, -3.25, 0);
                gScale(0.6, 0.6, 6);
                drawSphere();
                setColor(vec4(0.2, 0.2, 0.7, 0.0));
                gTranslate(3, 0, 0);
                drawSphere();
    
                // light blue outlets
                setColor(vec4(0.5, 0.5, 1, 1.0));
                gTranslate(-4, -3.25, 0);
                drawSphere();
                setColor(vec4(0.5, 0.5, 1, 1.0));
                gTranslate(5, 0, 0);
                drawSphere();
    
                // red outlets
                setColor(vec4(0.8, 0.2, 0.2, 0.0));
                gTranslate(-4, -3.25, 0);
                drawSphere();
                setColor(vec4(0.8, 0.2, 0.2, 0.0));
                gTranslate(3, 0, 0);
                drawSphere();
                           
            gPop();
        gPop();
    }

    function updateAstronaut(dt) {
    
        if(hit_left == 0 & astronautPosition[0] >= -2){
            astronautPosition[0] = astronautPosition[0] - 0.003;
        }else if(hit_left == 0 & astronautPosition[0] <= -2){
            astronautPosition[0] = astronautPosition[0] + 0.003;
            hit_left = 1;
        }else if(hit_left == 1 & astronautPosition[0] <= 2){
            astronautPosition[0] = astronautPosition[0] + 0.003;
        }else if(hit_left == 1 && astronautPosition[0] >= 2){
            astronautPosition[0] = astronautPosition[0] - 0.003;
            hit_left = 0;
        }
        
        if(hit_bottom == 0 & astronautPosition[1] >= -2){
            astronautPosition[1] = astronautPosition[1] - 0.003;
        }else if(hit_bottom == 0 & astronautPosition[1] <= -2){
            astronautPosition[1] = astronautPosition[1] + 0.003;
            hit_bottom = 1;
        }else if(hit_bottom == 1 & astronautPosition[1] <= 2){
            astronautPosition[1] = astronautPosition[1] + 0.003;
        }else if(hit_bottom == 1 && astronautPosition[1] >= 2){
            astronautPosition[1] = astronautPosition[1] - 0.003;
            hit_bottom = 0;
        }
    
        arm1Rotation = 45 + 8 * Math.sin(timestamp/800);
        arm2Rotation = -45 + 6 * Math.sin(timestamp/800);
        
        leg1upperRotation = 30 * Math.sin(timestamp/800);
        leg2upperRotation = -30 * Math.sin(timestamp/800);
        leg1lowerRotation = 20 * Math.sin(timestamp/800) + 20;
        leg2lowerRotation = -20 * Math.sin(timestamp/800) + 20;
        
    }

    function updateJellyfish(dt){

    jellyfishAngle -= dt * jellyfishOrbitSpeed;

    if(dt == 0){
        jellyfishPosition[0] = astronautPosition[0];
    }else{
        jellyfishPosition[0] = astronautPosition[0] + Math.cos(jellyfishAngle) * jellyfishOrbitRadius;
    }

    jellyfishPosition[1] = 0
    jellyfishPosition[2] = astronautPosition[2] + Math.sin(jellyfishAngle) * jellyfishOrbitRadius;
    
    jellyfishRotation = -(jellyfishAngle * (180 / Math.PI)) - 90;

    }

    function drawJellyfish(){
        gPush();
            
        // set jellyfish to initial position and orientation
            gTranslate(jellyfishPosition[0], jellyfishPosition[1], jellyfishPosition[2]);
            gRotate(jellyfishRotation, 0, 1, 0);

            // body
            gPush();
                setColor(vec4(1.0, 0.1, 0.6, 1.0));
                gScale(0.4, 0.8, 0.8);
                drawSphere();
                gPush();
                    gTranslate(0.9, 0, 0);
                    gScale(0.75, 0.65, 0.65);
                    drawSphere();
                    
                    // middle tentacle
                    gPush();
                        setColor(vec4(0.65, 0.35, 0.0, 1.0));
                        gTranslate(1.25, 0, 0);
                        gScale(0.75, 0.16, 0.16);
                        gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                        drawSphere();
                        gPush();
                            gTranslate(1.6, 0, 0);
                            gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                            drawSphere();
                            gPush();
                                gTranslate(1.6, 0, 0);
                                gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 1, 1);
                                drawSphere();
                                gPush();
                                    gTranslate(1.6, 0, 0);
                                    gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                                    drawSphere();
                                    gPush();
                                        gTranslate(1.6, 0, 0);
                                        gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                                        drawSphere();
                                    gPop();
                                gPop();
                            gPop();
                        gPop();
                    gPop();

                    // top tentacle
                    gPush();
                        gTranslate(1.25, 0.75, 0);
                        gScale(0.75, 0.16, 0.16);
                        gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                        drawSphere();
                        gPush();
                            gTranslate(1.6, 0, 0);
                            gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                            drawSphere();
                            gPush();
                                gTranslate(1.6, 0, 0);
                                gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 1, 1);
                                drawSphere();
                                gPush();
                                    gTranslate(1.6, 0, 0);
                                    gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                                    drawSphere();
                                    gPush();
                                        gTranslate(1.6, 0, 0);
                                        gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                                        drawSphere();
                                    gPop();
                                gPop();
                            gPop();
                        gPop();
                    gPop();

                    // bottom tentacle
                    gPush();
                        gTranslate(1.25, -0.75, 0);
                        gScale(0.75, 0.16, 0.16);
                        gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                        drawSphere();
                        gPush();
                            gTranslate(1.6, 0, 0);
                            gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                            drawSphere();
                            gPush();
                                gTranslate(1.6, 0, 0);
                                gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 1, 1);
                                drawSphere();
                                gPush();
                                    gTranslate(1.6, 0, 0);
                                    gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                                    drawSphere();
                                    gPush();
                                        gTranslate(1.6, 0, 0);
                                        gRotate(Math.sin(timestamp/600) * tentacleWaveSpeed, 0, 0, 1);
                                        drawSphere();
                                    gPop();
                                gPop();
                            gPop();
                        gPop();
                    gPop();
                gPop();
            gPop();
        gPop();
    }

}