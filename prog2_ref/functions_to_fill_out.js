
// [1, 2, 3] 					// Vector of size 3
// [1, 2, 3, 2, 3, 4] 			// CONCATENATED vectors (concat)
// [ [1, 2, 3], [1, 2, 3] ] 	// LIST of vectors (list)
// Float32Buffer 				// BUFFER

// Take the magnitude of an any-dimensional vector (e.g. [x1, y1])
function magnitude(vector) {
	var 			sum = 0;

	for (var i = 0; i < vector.length; i++) {
		sum += Math.pow(vector[i], 2);
	}

	return Math.sqrt(sum);
}

// Normalize an any-dimensional vector (e.g. [x1, y1])
function normalize(vector) {
}

// Take the dot product of two any-dimensional vectors (e.g. [x1, y1] and [x2, y2])
function dotProduct(vector1, vector2) {
}

// Take the cross product of two three-dimensional vectors (e.g. [x1, y1, z1] and [x2, y2, z2])
function crossProduct(vector1, vector2) {
}

// Add two any-dimensional vectors (e.g. [x, y, z]) together
function addVector(vector1, vector2) {
}

// Multiply an any-dimensional vector (e.g. [x, y, z]) by a scalar
function multiplyVectorByScalar(vector, scalar) {
}

// Given a list of any-dimensional vectors (e.g. [[x1, y1, z1], [x2, y2, z2]]), calculate the average of those vectors
function averageVectors(vectorsList) {
}

// Given one two-dimensional point as a vector (e.g. [x, y]), rotate that point counterclockwise by theta radians
function rotatePoint(pointVector, theta) {
}

// Given one three-dimensional point as a vector (e.g. [x, y, z]), rotate that point counterclockwise around the z-axis by theta radians (z should not change, because we are rotating around the z-axis)
function rotate3DPointAroundZAxis(pointVector, theta) {
}



// function doSomethingToLotsOfVectors(aFunctionToDoToVectors, lotsOfVectors) {
// 	var 		resultVectors = [];

// 	for (each vector in lotsOfVectors) {
// 		newVector = aFunctionToDoToVectors(vector)
// 		resultVectors.add(newVector)
// 	}

// 	return resultVectors
// }



// lotsOfVectors = doSomethingToLotsOfVectors(normalizeOneVector, lotsOfVectors)




// normalized_light_direction = normalizeOneVector(light_direction)