//Lisa Durand
//ldurand
//October 15, 2017
//prog1.js

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



//global variables
var xy_points = new Float32Array(200); // coordinate point array with size 200, vertices array
var n = 0; //number of elements in xy_points
var P_array = [];   //all 72 elements of rotated points on unit cylinder
var P_prime = [];   //rotated points after being translated to clicked points
var indexes = [];  // indeces array
var vertex = []; //indeces and their coordinates
var right_clicked = false; //signal if program should be finished
var index=0;
var gl;
var canvas;
var a_Position;
var indexBuffer;
var vertexBuffer;

//retrieve the <canvas> element, get the rendering context for WebGL,
// initialize shaders, set color for clearing <canvas>, clear <canvas>,
function main(){
    
    //Retreive <canvas> element
     canvas = document.getElementById('webgl');

    //Get the rendering context for WebGL
    gl = getWebGLContext(canvas);
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
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
        if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev){click(ev)};

    //check for mouse movement
    canvas.addEventListener('mousemove',function(ev){follow_mouse(ev)});


    // specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    //Clear >canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    setupIOSOR("fileName");
}


//actions that take place on mouse click- get coordinates, convert to
//canvas plane, store coordinates in arrays, print and keep track of
//coordinates pressed, check for mouse movement
function click(ev){
    if(right_clicked) return;
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
        
        xy_points[index]=x;
       index++;
       xy_points[index]=y;
       index++; 
       index-=2;
        
        console.log("You left-clicked at (" +x+ ", "+y+ ")");
    }
    
         
    //print out list of all coordinates from array
    if(ev.button==2 && right_clicked == false){
        //transformed_cylinder_vertices_part1(index);   //call function to rotate coordinates around clicked point
        console.log("You right-clicked at (" + ev.clientX + ", " + ev.clientY + ")."); 
        console.log("List of all Coordinates: " + "\n");
        for(var i=0; i< index; i+=2){
            console.log("("+xy_points[i]+"," + xy_points[i+1] + ")" + "\n");
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

   redraw_canvas();
}


//to draw line when mouse moves until clicked
function follow_mouse(ev){
    
    if(right_clicked) return;
    var x = ev.clientX; //x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
    //remove previous points from array

    
    // Convert coordinates to canvas plane
    x = ((x-rect.left)-canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2-(y-rect.top))/(canvas.height/2);
    
    //store coordinates in xy_points array
       xy_points[index]=x;
       index++;
       xy_points[index]=y;
       index++; 
       index-=2;
       redraw_canvas();
}
    
    
function redraw_canvas(){
    
    // clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    draw_clicked_points();
    if(right_clicked == true){
        draw_cylinders();
    }
}

function draw_clicked_points(){
      //set the positions of vertices
    var success = do_draw_clicked_points();
    if (!success) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
}

function draw_cylinders(){
    var success = do_draw_cylinders();
    if (!success) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
}


//rotate 12 points around origin and push coordinates into array
function transformed_cylinder_vertices_part1(n){
    var P1 = [];    //rotated points on unit cylinder
    var r = .1; //radius
    //coordinates for unit cylinder:
    var x = 0;     
    var y = 0;
    var z = 0;
    
    //get x, y, z coordinates and store in P1
    for(var theta = 0; theta < 360; theta+=30){
        z = r * Math.sin(theta);
        y = r * Math.cos(theta);
        P1.push(x);
        P1.push(y);
        P1.push(z);
    }
    console.log("P1.length: " + P1.length);
    console.log("P1 array(12 rotated coordinates around point): " + P1);
    transformed_cylinder_vertices_part2(P1, n);
}


//copy coordinates for x = 1 and y and z the same as P1
function transformed_cylinder_vertices_part2(P1, n){
    //console.log("P1.length: " + P1.length);
    var P2 = [];    // second set of rotated points on unit cylinder
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
//    console.log("length of P2: " + P2.length);
    console.log("length of P_array: " + P_array.length);
    console.log("P_array (both P1 and P2): " + P_array);
    transformed_cylinder_vertices_part3(P_array, n);
    //initIndexArray();
}

//translate P_array coordinates to coordinates depending on left mouse click locations
function transformed_cylinder_vertices_part3(P_array, n){
    //console.log("n: " +n);
    //coordinates for point A and B
    var Bx = xy_points[n-2];    
    var By = xy_points[n-1];
    var Ax = xy_points[n-4];
    var Ay = xy_points[n-3];
    var m = (By - Ay) / (Bx - Ax); //slope
    var theta = Math.atan(m); //get theta
    var square_root = Math.pow((Bx - Ax), 2) + Math.pow((By-Ay), 2);
    var length = Math.sqrt(square_root); 
    //translate to x, y coordinates
      for(var i = 0; i < P_array.length/ 2; i+=3){
        P_prime[i] = (P_array[i] * length * Math.cos(theta)) - (P_array[i+1] * Math.sin(theta)) + Ax;
        P_prime[i+1] = (P_array[i] * length * Math.sin(theta)) + (P_array[i+1] * Math.cos(theta)) + Ay;
        P_prime[i+2] = P_array[i+2];
    }

    for(var i = 0; i < P_array.length / 2; i += 3){
        var offset = P_array.length / 2;
        P_prime[i + offset] = (P_array[i] * length * Math.cos(theta)) - (P_array[i+1] * Math.sin(theta)) + Bx;
        P_prime[i+1 + offset] = (P_array[i] * length * Math.sin(theta)) + (P_array[i+1] * Math.cos(theta)) + By;
        P_prime[i+2 + offset] = P_array[i+2];
    }

    console.log("P_prime (rotated coordinates from clicked points): " + P_prime);
    //console.log("P_prime.length: " + P_prime.length);
}


//index array with x, y, z coordinates stored as 24 indeces
function initIndexArray(){
    indexes = [];
    for(var i = 0; i < 12; i++){
        indexes.push([((i) % 12)]);
        indexes.push([((i+1) % 12)]);
        indexes.push([(((1+i) % 12) + 12)]);
        indexes.push([(((i) % 12) + 12)]);
    }
    console.log("indexes: " + indexes);
    console.log("indexes.length: " + indexes.length);
    //generateSurfaces(P_array, indexes, gl, ev, canvas, a_Position, n);
}

//create and bind buffers with xy_points
function do_draw_clicked_points(){
    
    
    var n = index/2; //Number of coordinate pairs
    

    //Create buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        console.log('Failed to create the buffer object');
        return false;
    }
    
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xy_points, gl.STATIC_DRAW);
    
    //initialize a_Position for shader
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.LINE_STRIP, 0, index/2 + 1);//Draw lines
    return true;    
}

//create and bind buffers with P_prime
function do_draw_cylinders(){
    
    
    for(var i = 4; i <= index; i += 2){

    initIndexArray();
    transformed_cylinder_vertices_part1(i); 
    
    var indices_array = new Uint16Array(indexes);
    var vertices_array = new Float32Array(P_prime);
    
    //Create buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        console.log('Failed to create the buffer object');
        return false;
    }
    
    var indexBuffer = gl.createBuffer();
    
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, vertices_array, gl.STATIC_DRAW);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices_array, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    for(var side = 0; side < 12; side++){
        gl.drawElements(gl.LINE_STRIP, 4, gl.UNSIGNED_SHORT, side * 4);
    }
     }
    return true;    
}

//Saving and reading functions
function saveSOR(){
    var name = prompt("Please enter your file name");
    saveFile(new SOR(name, xy_points, indexes));
}

function readSOR(){
    var SORObj = readFile();
    vertices = SORObj.vertices;
    console.log("vertices: " +vertices);
    indexes = SORObj.indexes;
    console.log("indexes: " + indexes);
            
    var vertexBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);
    
    gl.drawElements(gl.LINE_STRIP, indexes.length-1, gl.UNSIGNED_SHORT, 0);
}




/*
 * VERSION 1.2 - ALWAYS CHECK FOR LATEST VERSION
 *
 * Library used to read and write 3D Obj Data into Obj File
 * Assumes the objects are SOR made up of quad faces.
 *
 * Written by:   Aakash Thakkar
 * Date:         October 2, 2016
 *
 * BUG FIXES:
 * 1) Looping Bug 
 *    Identified and Sovled by:   Mackenzie Glynn
 *    Date:         October 4, 2016
 *    Rectified in Version 1.1 
 *
 * 2) parseFloat, Setup Function, Object Format
 *    Identified by:   Cole Faust
 *    Date:         October 7, 2016
 *    Rectified in Version 1.2
 *
 * File Format:
 * o STANDS FOR OBJECT NAME, V STANDS FOR VERTEX, F STANDS FOR FACE
 *
 * o [OBJECT_NAME]
 * v [x], [y], [z],
 * .
 * .
 * v [xn], [yn], [zn],
 * f [x], [y], [z],
 * .
 * .
 * f [xn], [yn], [zn],
 *
 * FUNCTIONS:
 * 1) setupIOSOR("ID OF FILE INPUT ELEMENT")
 *    Desc: Setup Change Event Handler, pass attribute input id. For Example: setupIOSOR("fileinput") in Main Function.
 * 2) saveFile(new SOR("", [VERTICES_ARRAY], [INDEXES_ARRAY]); --> Save 3d Object
 *    Desc: This function translates the SOR Object into a downloadable blob
 * 2) readFile()
 *    Return: SOR OBJECT
 *    USAGE: Once File Selected in Browser, USE: var sorObject = readFile();
 *    You can do this on an onclick event by a button.
 *    Desc: This function responds to an onchange event from the HTML FileInput and grabs the content of the file selected
 *          It then extracts SOR object from File Data
 *
 * NOTE: INSTRUCTION: STEPS:
 * 1) Add following code in the HTML DRIVER file( Inside body tag): <input type="file" id="fileinput" />
 * 2) Add the script before your own JS Code: <script src="../lib/ioSOR.js"></script>
 * 3) Add another button such as: <button onclick="updateScreen()" type="button">Extract SOR</button>
 * 4) Create function: updateScreen() in your code and make a call to readFile() that returns SOR object, use object to update the screen
 *
 * Flow of Events: User clicks on file input element, selects file and then presses Extract Object button to update the screen.
 *
 *
 */

var extractedSOR;
var setupComplete = false;

function SOR(objName, vertices, indexes)
{
    this.objName = objName;
    this.vertices = vertices;
    this.indexes = indexes;
}

function setupIOSOR(elementName)
{
    document.getElementById(elementName).addEventListener('change', readEvent);
    setupComplete = true;
}

function saveFile(SOR) {

    console.log("Save");
    console.log(SOR);
    var text = "";
    // Anchor Element
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.download = SOR.objName + ".obj";

    text = "o " + SOR.objName + "\n";
    // Convert Vertices to Text
    for (var i = 0; i < SOR.vertices.length; i = i + 3) {
        text = text + "v " + SOR.vertices[i] + " " + SOR.vertices[i + 1] + " " + SOR.vertices[i + 2] + "\n";
    }
    // Convert Indexes to Text
    for (var i = 0; i < SOR.indexes.length; i = i + 3) {
        text = text + "f " + SOR.indexes[i] + " " + SOR.indexes[i + 1] + " " + SOR.indexes[i + 2] + "\n";
    }

    // Create Blob out of plain text
    var myBlob = new Blob([text], {
        type: "text/plain"
    });
    var url = window.URL.createObjectURL(myBlob);

    // Simulate Download
    a.href = url;
    a.click();
}

function readFile()
{
    if(extractedSOR != null && setupComplete == true)
    {
        alert(extractedSOR.objName);
        return extractedSOR;
    }
    else
    {
        if(!setupComplete)
        {
            alert("Please ensure you call setupIOSOR('ID OF FILE INPUT')");
        }
        else
        {
            alert("Error File Not Selected");
        }
    }
}

function readEvent(evt) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0];

    var sorObject = new SOR("", [], []);

    if (f) {
        var r = new FileReader();
        r.onload = function(e) {
            var contents = e.target.result;
            var line = "";
            while (1) {
                line = contents.substr(0, contents.indexOf("\n"));
                if (line.length <= 0)
                    break;
                if (line.charAt(0) == "o") {
                    sorObject.objName = line.substr(line.indexOf(" ") + 1);
                }
                if (line.charAt(0) == "v") {
                    line = line.substr(2);
                    sorObject.vertices.push(parseFloat(line.substr(0, line.indexOf(" "))));
                    line = line.substr(line.indexOf(" ") + 1);
                    sorObject.vertices.push(parseFloat(line.substr(0, line.indexOf(" "))));
                    line = line.substr(line.indexOf(" ") + 1);
                    sorObject.vertices.push(parseFloat(line));
                }
                if (line.charAt(0) == "f") {
                    line = line.substr(2);
                    sorObject.indexes.push(parseFloat(line.substr(0, line.indexOf(" "))));
                    line = line.substr(line.indexOf(" ") + 1);
                    sorObject.indexes.push(parseFloat(line.substr(0, line.indexOf(" "))));
                    line = line.substr(line.indexOf(" ") + 1);
                    sorObject.indexes.push(parseFloat(line));
                }
                contents = contents.substr(contents.indexOf("\n") + 1);
            }
            console.log("Extracted");
            console.log(sorObject);
            extractedSOR = sorObject;
        }
        r.readAsText(f);
    } else {
        alert("Failed to load file");
    }
}




  
  
  
