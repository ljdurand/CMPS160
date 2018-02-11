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
var xy_points = new Float32Array(200); // coordinate point array with size 200
var g_points = []; //static point array
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
    g_points.push([x, y]);
        
    console.log("You left-clicked at (" +x+ ", "+y+ ")");
    }
    
       var n = initVertexBuffers(ev, gl, canvas, a_Position, n);
        if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

        
    //print out list of all coordinates from array
    if(ev.button==2 && right_clicked == false){
        console.log("You right-clicked at (" + ev.clientX + ", " + ev.clientY + ")."); 
        console.log("List of all Coordinates: " + "\n");
        for(var i=0; i<g_points.length; i++){
            console.log("("+g_points[i]+")" + "\n");
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
    
      gl.drawArrays(gl.POINTS, 0, ((index)/2)); //Draw points
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

    gl.drawArrays(gl.POINTS, 0, ((index)/2)); //Draw points 
    gl.drawArrays(gl.LINE_STRIP, 0, index/2);//Draw lines 
}


//create and bind buffers
function initVertexBuffers(ev,gl,canvas,a_Position,n){    
    var n = xy_points.length/2; //Number of coordinate pairs
    
    if(right_clicked == true){
        n= g_points.length/2;
    }
    //Create buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }
    
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xy_points, gl.STATIC_DRAW);
    
    //Initialize a_Position for shader
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0){
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    return n;    
}
