//Lisa Durand
//ldurand
//October 8, 2017
//lab1.js

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
   'void main() {\n' +
  '  gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);\n' +
  '}\n';


//retrieve the <canvas> element, get the rendering context for WebGL,
// initialize shaders, set color for clearing <canvas>, clear <canvas>,
function main(){
    
    //Retreive <canvas> element
    var canvas = document.getElementById('webgl');

    //Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if(!gl){
        console.log('Failed to get redering context for gl');
        return;
    }
    
    //initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev){click(ev, gl, canvas, a_Position)};

 
    //check for mouse movement
    canvas.addEventListener('mousemove',function(ev){follow_mouse(ev,gl,canvas, a_Position)});


    // specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    //Clear >canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}


//global variables
var xy_points = new Float32Array(200); // coordinate point array with size 200, vertices array
var P1 = [];    //rotated points on unit cylinder
var P2 = [];    // second set of rotated points on unit cylinder
var P_array = [];   //all 72 rotated points on unit cylinder
var P_prime = [];   //rotated points after being translated to clicked points
var g_points = []; //point array
var indexes = [];  // indeces array
var vertex = []; //indeces and their coordinates
var right_clicked = false; //signal if program should be finished
var index=0;

//actions that take place on mouse click- get coordinates, convert to
//canvas plane, store coordinates in arrays, print and keep track of
//coordinates pressed, check for mouse movement
function click(ev,gl,canvas,a_Position){
    var x = ev.clientX; //x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
    if(ev.button==0 && right_clicked == false){        
        //convert coordinates to canvas plane
      x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
      y = (canvas.height/2 - (y - rect.top))/(canvas.height/2); 

    //store coordinates in xy_points array
    xy_points[index]=x;
    index++;
    xy_points[index]=y;
    index++;
    //store coordinates in g_points array
    g_points.push([x]);
    g_points.push([y]);
        
    console.log("You left-clicked at (" +x+ ", "+y+ ")");
    }
    
       var n = initVertexBuffers(ev, gl, canvas, a_Position, n);
        if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

        
    //print out list of all coordinates from array
    if(ev.button==2 && right_clicked == false){
        rotate_coordinates(g_points, gl);   //call function to rotate coordinates around clicked point
        console.log("You right-clicked at (" + ev.clientX + ", " + ev.clientY + ")."); 
        console.log("List of all Coordinates: " + "\n");
        for(var i=0; i<g_points.length; i+=2){
            console.log("("+g_points[i]+"," + g_points[i+1] + ")" + "\n");
        }
        right_clicked = true;
    }

    //code from piazza to get rid of box on right click
    canvas.addEventListener('contextmenu',function(ev){
        if(ev.button == 2){
            ev.preventDefault();
            return false;
        }
    }, false);

       
      gl.clear(gl.COLOR_BUFFER_BIT);
    
     // gl.drawArrays(gl.POINTS, 0, ((index)/2)); //Draw points
      gl.drawArrays(gl.LINE_STRIP, 0, index/2);//Draw lines 
   
}


//to draw line when mouse moves until clicked
function follow_mouse(ev,gl,canvas,a_Position){
    
    if(index<2) return;
    var x = ev.clientX; //x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
    //remove previous points from array
    if(index > 2) {
        index-=2;
    }

    
    // Convert coordinates to canvas plane
    x = ((x-rect.left)-canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2-(y-rect.top))/(canvas.height/2);
    
    //store coordinates in xy_points array
       xy_points[index]=x;
       index++;
       xy_points[index]=y;
       index++;   
    
    // clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    for(var i=0; i<xy_points.length; i+=2){
        var xy = xy_points[i];
        //pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy_points[i], xy_points[i+1],0.0);
    }
    
    //set the positions of vertices
    var n = initVertexBuffers(ev, gl, canvas, a_Position, n);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

   // gl.drawArrays(gl.POINTS, 0, ((index)/2)); //Draw points 
    gl.drawArrays(gl.LINE_STRIP, 0, index/2);//Draw lines 
}


//rotate 12 points around origin and push coordinates into array
function rotate_coordinates(g_points, gl){
    r = 25; //radius
    //coordinates for unit cylinder:
    var x = 0;     
    var y = 0;
    var z = 0;
    
    //get x, y, z coordinates and store in P1
    for(var theta = 0; theta < 360; theta+=30){
        z = r * Math.sin(theta);
        y = r * Math.cos(theta);
        P1.push([x]);
        P1.push([y]);
        P1.push([z]);
    }
    console.log("P1.length: " + P1.length);
    console.log("P1: " + P1);
    pArray(P1, g_points, gl);
}

//copy coordinates for x = 1 and y and z the same as P1
function pArray(P1, g_points, gl){
    console.log("P1.length: " + P1.length);
    for(var i = 0; i < P1.length; i +=3){
        P2[i] = 1;
        P2[i+1] = P1[i+1];
        P2[i+2] = P1[i+2];
    }
    
    //push P1 and P2 to same array to have 72 coordinates
    for(var s = 0; s < P1.length; s ++){
        P_array.push(P1[s]);
    }
    for(var t = 0; t < P2.length; t++){
        P_array.push(P2[t]);
    }
    console.log("length of P2: " + P2.length);
    console.log("length of P_array: " + P_array.length);
    console.log("P_array: " + P_array);
    translated_array(P_array, g_points);
    initIndexArray(P_array, gl);
}

//translate P_array coordinates to coordinates depending on left mouse click locations
function translated_array(P_array, g_points){
    var n = g_points.length;
    console.log("n: " +n);
    //coordinates for point A and B
    Bx = xy_points[n-1];    
    By = xy_points[n];
    Ax = xy_points[n-4];
    Ay = xy_points[n-3];
    var m = (By - Ay) / (Bx - Ax); //slope
    var theta = Math.atan(m); //get theta
    var square_root = Math.pow((Bx - Ax), 2) + Math.pow((By-Ay), 2);
    var length = Math.sqrt(square_root); 
    //translate to x, y coordinates
    for(var i = 0; i < P_array.length; i+=3){
        P_prime[i] = (P_array[i] * length * Math.cos(theta)) - (P_array[i+1] * Math.sin(theta)) + Ax;
        P_prime[i+1] = (P_array[i] * length * Math.sin(theta)) + (P_array[i+1] * Math.cos(theta)) + Ay;
        P_prime[i+2] = P_array[i+2];
    }
    console.log("P_prime: " + P_prime);
    
}


//index array with x, y, z coordinates stored as 24 indeces
function initIndexArray(P_array, gl){
    for(var i = 1; i < 12; i++){
        indexes.push([i]);
        indexes.push([i+1]);
        indexes.push([15-i]);
        indexes.push([14-i]);
    }
    console.log("indexes: " + indexes);
    console.log("indexes.length: " + indexes.length);
    generateSurfaces(P_array, indexes, gl);
}

function generateSurfaces(P_array, indexes, gl){
    for(var i = 0; i < indexes.length; i++) {
      vertex.push([indexes[i]]);
      var n = vertex[i];
      console.log("n: " + n);
      for( var j = n-1; j < P_array.length; j = (n-1) * 3) {
          console.log("n 2nd time: " + n);
          console.log("j: " + j);
        vertex[i].push([P_array[j], P_array[j+1], P_array[j+2]]);
      } 
    } 
    console.log("vertex: " + vertex);
    console.log("vertex.length: " + vertex.length);
}


//create and bind buffers
function initVertexBuffers(ev,gl,canvas,a_Position,n){    
    var n = xy_points.length/2; //Number of coordinate pairs
    var indices = new Uint16Array(indexes);
    
    if(right_clicked == true){
        n= g_points.length/2;
    }
    
    //Create buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    
     var indexBuffer = gl.createBuffer();
    
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, xy_points, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    //Initialize a_Position for shader
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
  //  gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);
    return n;    
}



  
  
  
