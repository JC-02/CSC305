"use strict";

console.log("Howdy, this is a console log partner!\n");

var vec3Alpha = vec3(1, 2, 0);
var vec3Beta = vec3(1, 4, 0);
var vec4Alpha = vec4(1, 2, 3, 0);
var vec4Beta = vec4(7, 2, 3, 0);


// Length or norm of a vector (3D then 4D)
console.log(length(vec3Alpha));
console.log(length(vec4Alpha));

// Normalization of a vector (3D then 4D)
console.log(normalize(vec3Alpha));
console.log(normalize(vec4Alpha));

// Length of a normalized vector (3D then 4D) (floating point issues?)
console.log(length(normalize(vec3Alpha)));
console.log(length(normalize(vec4Alpha)));

// Addition between two vectors (3D then 4D)
console.log(add(vec3Alpha, vec3Beta));
console.log(add(vec4Alpha, vec4Beta));

// Subtraction between two vectors (3D then 4D)
console.log(subtract(vec3Alpha, vec3Beta));
console.log(subtract(vec4Alpha, vec4Beta));

// Negation of a vector (3D then 4D)
console.log(negate(vec3Alpha, vec3Beta));
console.log(negate(vec4Alpha, vec4Beta));

// Dot product between two vectors (3D then 4D)
console.log(dot(vec3Alpha, vec3Beta));
console.log(dot(vec4Alpha, vec4Beta));

// Cross product between two vectors (3D then 4D)
console.log(cross(vec3Alpha, vec3Beta));
console.log(cross(vec4Alpha, vec4Beta));



//MATRIX STUFF!

var matrix = mat4(); // Note how we didnt give values to this one

var matrixReloaded = mat4(
    vec4(1,2,3,4),
    vec4(5,6.12345,7,8),
    vec4(9,10,11,12),
    vec4(0,0,0,1)
);

var matrixRevolutions = mat4(
    2,2,4,2,
    1,3,2,3,
    1,-10.1,4,5,
    0,0,0,1
)

// Show some various matrix examples
// show the matrix
console.log(matrix); // Note how this is the identity matrix

// show the matrix reloaded
console.log(matrixReloaded);

// show the matrix revolutions
console.log(matrixRevolutions);

// Show multiplication of two matrices
console.log(mult(matrixRevolutions,matrixReloaded));

// Show the transpose of a matrix
console.log(transpose(matrixReloaded));

// A point is represented using th evec type! Note the 1 though in the fourth position to denote a point in homogeneous coordinates
var aPoint = vec4(1, 1, 0, 1);

// Translation Matrix
var translationMatrix = translate( 5, 2, 0 );
console.log(translationMatrix);

// Apply that translation to a point
console.log(mult(translationMatrix, aPoint));

// Note that sine and cosine in Javascript use radians HOWEVER, MV.js has a helper conversion internally and allows you to input degrees here
var rotationMatrix = rotate( 90, vec3(0, 0, 1) );

// Show the rotation matrix, (notice anything interesting?, this is a simple rotation by 90 degrees)
console.log(rotationMatrix);

// Apply that rotation to a point (note this is the original simple point vec4(1, 1, 0, 1) )
console.log(mult(rotationMatrix, aPoint));

// First: Apply that translation then that rotation to a point
console.log(mult(rotationMatrix,mult(translationMatrix, aPoint)));

// Second: Apply that rotation then that translation to a point
console.log(mult(translationMatrix,mult(rotationMatrix, aPoint)));
// Note the difference, in the second one we rotated aPoint = vec4(1, 1, 0, 1); by 90 around the z axis, so it becomes aPoint = vec4(1, -1, 0, 1); then we translate ( 5, 2, 0 ), so it becomes ( 6, 1, 0 )
// Note the difference, in the first one we translated aPoint = vec4(1, 1, 0, 1) by ( 5, 2, 0 ), so it becomes ( 6, 3, 0, 1 ); then we rotated by 90 around the z axis, so it becomes (3, -6, 0, 1);  

// Let's compute a single transformation matrix first and show it. This is a single matrix that captures a rotation and a translation, BUT which is first?
var transformationMatrix = mult(rotationMatrix,translationMatrix);
console.log(transformationMatrix);

// Now let's apply it to a point and show it
console.log(mult(transformationMatrix, aPoint));
// Did it rotate or translate first? Check against the above...ORDER MATTERS!


