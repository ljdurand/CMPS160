//Lisa Durand
//ldurand
//October 15, 2017
//prog1.js

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  v_Color = vec4(a_Color.rgb, 1.0);\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
   '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';



//global variables
var xy_points = new Float32Array(200); // coordinate point array with size 200, vertices array
var n = 0; //number of elements in xy_points
var P1 = [];   //all 72 elements of rotated points on unit cylinder
var vertices = [];   //rotated points after being translated to clicked points
var indexes = [];  // indeces array
var norm = [];
var right_clicked = false; //signal if program should be finished
var index=0;
var gl;
var canvas;
var a_Position;
var a_Color;
var light_direction = [1.0, 1.0, 1.0];
var shouldDrawNormals = false;
var normalVertices = [];
var normalVerticesColors = [];
var centers = [];
var surface_to_light = [];
var normalized_light = [];
var shaded_colors = [];
var normal_color = [1, 0, 0];
var color = [0, 1, 0];
var expanded_vertices = [];
var expanded_vertex_colors = [];

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
    
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0){
        console.log('Failed to get the storage location of a_Color');
        return; 
    }
    
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev){click(ev)};
    

    //check for mouse movement
    canvas.addEventListener('mousemove',function(ev){follow_mouse(ev)});
     
        
    // specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
     gl.enable(gl.DEPTH_TEST);
    
    //Clear >canvas>
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    draw_clicked_points();
    if(right_clicked == true){
        draw_cylinders();
        if(shouldDrawNormals == true){
            draw_surface_normals();
        }
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

function on_surface_normal_checkbox_clicked(element) {
    shouldDrawNormals = element.checked;
    
    console.log('shouldDrawNormals: ' + shouldDrawNormals);
    
    redraw_canvas();
}

function draw_surface_normals(){
   // gl.clear(gl.COLOR_BUFFER_BIT);
    var success = do_draw_surface_normals(vertices);
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
    for(var theta = 0; theta < 2* (Math.PI); theta+= 2 *(Math.PI * (1.0/12.0))){
        z = r * Math.sin(theta);
        y = r * Math.cos(theta);
        P1.push(x);
        P1.push(y);
        P1.push(z);
    }
    console.log("P1.length: " + P1.length);
    console.log("P1 array(12 rotated coordinates around point): " + P1);
    transformed_cylinder_vertices_part3(P1, n);
}

//translate P1 coordinates to coordinates depending on left mouse click locations
function transformed_cylinder_vertices_part3(P1, n){
    //console.log("n: " +n);
    //coordinates for point A and B
    //bx<ax
    var Bx = xy_points[n-2];    
    var By = xy_points[n-1];
    var Ax = xy_points[n-4];
    var Ay = xy_points[n-3];
    var m = (By - Ay) / (Bx - Ax); //slope
    var theta = Math.atan(m); //get theta
   // var square_root = Math.pow((Bx - Ax), 2) + Math.pow((By-Ay), 2);
    var length = Math.sqrt(Math.pow((Bx - Ax), 2) + Math.pow((By-Ay), 2));
    console.log("n: " + (n));
    console.log("Bx: " + (Bx));
    console.log("By: " + (By));
    console.log("Ax: " + (Ax));
    console.log("Ay: " + (Ay));
    console.log("theta: " + (theta));
    console.log("m: " + (m));
    console.log("length: " + (length));
    //translate to x, y coordinates
    var rotated = [];
    for(var j = 0; j < P1.length; j+=3){
        rotated.push((P1[j] * length * Math.cos(theta)) - (P1[j+1] * Math.sin(theta)));
        rotated.push((P1[j] * length * Math.sin(theta)) + (P1[j+1] * Math.cos(theta)));
        rotated.push(P1[j+2]);
    }
    
    if(Bx -Ax < 0){
        for(var j = 0; j < rotated.length; j+=3){
            rotated[j] = -rotated[j];
            rotated[j+1] = -rotated[j+1];
        }
    }
    
      for(var i = 0; i < P1.length ; i += 3){
        var offset = P1.length;
        vertices[i + offset] = rotated[i] + Bx;
        vertices[i+1 + offset] = rotated[i+1] + By;
        vertices[i+2 + offset] = rotated[i+2];
      }
      for(var i = 0; i < P1.length; i+=3){
        vertices[i] = rotated[i] + Ax;
        vertices[i+1] = rotated[i+1] + Ay;
        vertices[i+2] = rotated[i+2];
      }
    

    console.log("vertices (rotated coordinates from clicked points): " + vertices);
    //console.log("P_prime.length: " + P_prime.length);
}


function calc_surface_normals_phase1(P1){
    var P = [];
    var Q = [];
    var R = [];
    var PQ = [];
    var QR = [];
    //get coordinates for indices and store them in arrays
    for(var i = 0; i < indexes.length; i +=3){
        var Pindex = indexes[i];
        console.log("Pindex: " + Pindex);
        var Qindex = indexes[i+1];
        console.log("Qindex: " + Qindex);
        var Rindex = indexes[i+2];
        console.log("Rindex: " + Rindex);
        P.push(vertices[(Pindex) * 3]);
        P.push(vertices[((Pindex) * 3) + 1]);
        P.push(vertices[((Pindex) *3) + 2]);
        Q.push(vertices[(Qindex) * 3]);
        Q.push(vertices[((Qindex) * 3) + 1]);
        Q.push(vertices[((Qindex) *3) + 2]);
        R.push(vertices[(Rindex) * 3]);
        R.push(vertices[((Rindex) * 3) + 1]);
        R.push(vertices[((Rindex) *3) + 2]);   
    }
    console.log("P: " + P + " length: " + P.length);
    console.log("Q: " + Q);
    console.log("R: " + R);
    for(var j = 0; j < P.length; j++){
        PQ.push(Q[j] - P[j]);
    }
    for(var k = 0; k < Q.length; k++){
        QR.push(R[k] - Q[k]);
    }
    console.log("PQ: " +PQ + " length: " + PQ.length);
    console.log("QR: " + QR);
    calc_surface_normals_phase2(PQ, QR);       
}

function calc_surface_normals_phase2(PQ, QR){
    var cross = [];
    for(var i = 0; i < PQ.length; i+=3){
    cross.push((PQ[i+1] * QR[i+2]) - (QR[i+1] * PQ[i+2]));
    cross.push((QR[i] * PQ[i+2]) - (PQ[i] * QR[i+2]));
    cross.push((PQ[i] * QR[i+1]) - (QR[i] * PQ[i+1]));
    }
    console.log("cross product: " + cross + " length: " + cross.length);
    calc_surface_normals_phase3(cross);
}

function calc_surface_normals_phase3(cross){
    norm = [];
    for(var i = 0; i < cross.length; i+=3){
        var distance = Math.sqrt(Math.pow(cross[i], 2) + Math.pow(cross[i+1], 2) +
                                Math.pow(cross[i+2], 2));
        norm.push(cross[i]/distance);
        norm.push(cross[i+1]/distance);
        norm.push(cross[i+2]/distance);
    }
    console.log("normal vector: " + norm);
    console.log("num norms: " + norm.length);
    console.log("num indices: " + indexes.length);
}



function calc_centerPoints(){
    centers = [];
    surface_to_light = [];
    for(var i = 0; i < indexes.length; i+=3){
        var Pindex = indexes[i];
        console.log("Pindex: " + Pindex);
        var Qindex = indexes[i+1];
        console.log("Qindex: " + Qindex);
        var Rindex = indexes[i+2];
        console.log("Rindex: " + Rindex);
        centers.push((vertices[(Pindex) * 3] + vertices[(Qindex) * 3] + vertices[(Rindex) * 3]) / 3);
        centers.push((vertices[((Pindex) * 3) + 1] + vertices[((Qindex) * 3) + 1] + vertices[((Rindex) * 3) + 1])/3);
        centers.push((vertices[((Pindex) *3) + 2] + vertices[((Qindex) *3) + 2] + vertices[((Rindex) *3) + 2])/3 );   
    }
    for(var j = 0; j < centers.length; j++){
        surface_to_light.push(light_direction[j] - centers[j]);
    }
}

function normalize_light_direction(){
    var magnitude = Math.sqrt(3);
    normalized_light = [];
        normalized_light.push(light_direction[0]/magnitude);
        normalized_light.push(light_direction[1]/magnitude);
        normalized_light.push(light_direction[2]/magnitude);
}


function calc_surface_colors(){
    shaded_colors = [];
    console.log("normalized Light: " + normalized_light);
    for(var i = 0; i < norm.length; i +=3){
        var dot_product = normalized_light[0] * norm[i] + normalized_light[1] * norm[i+1] +
                          normalized_light[2] * norm[i+2];
        if(dot_product < 0){
            dot_product = 0;
        }
        shaded_colors.push(dot_product * color[0]);
        shaded_colors.push(dot_product * color[1]);
        shaded_colors.push(dot_product * color[2]);
    }
    console.log("shaded_colors: " + shaded_colors);
}


function fill_normal_vertex_colors(){
    normalVerticesColors = [];
    for (var i = 0; i < normalVertices.length; i+=3) {
        normalVerticesColors.push(normal_color[0]);
        normalVerticesColors.push(normal_color[1]);
        normalVerticesColors.push(normal_color[2]);
    }
}



//index array with x, y, z coordinates stored as 24 indeces
function initIndexArray(){
    indexes = [];
//    for(var i = 0; i < 12; i++){
//        indexes.push([((i) % 12)]);
//        indexes.push([((i+1) % 12)]);
//        indexes.push([(((i+1) % 12) + 12)]);
//        indexes.push([(((i) % 12) + 12)]);
//    }
    
    
    for(var i = 0; i < 12; i++){
        indexes.push([((i) % 12)]);
        indexes.push([(i+1) % 12]);
        indexes.push([(((i+1) % 12) + 12)]);
        
        indexes.push([(((i+1) % 12) + 12)]);
        indexes.push([(((i) % 12) + 12)]);
        indexes.push([((i) % 12)]);
        
    }
    
    
    console.log("indexes: " + indexes);
    console.log("indexes.length: " + indexes.length);
    return indexes;
}

function calc_normal_line_vertices() {
    normalVertices = [];
    var startPoints = [];
    var endPoints = [];
    for(var i = 0; i < norm.length; i+=3){
        startPoints.push(0);
        startPoints.push(0);
        startPoints.push(0);
    }
    for(var i = 0; i < norm.length; i += 3){
        endPoints.push(startPoints[i] + norm[i]);
        endPoints.push(startPoints[i+1] + norm[i+1]);
        endPoints.push(startPoints[i+2] + norm[i+2]);
    }
    for(var i = 0; i < norm.length; i +=3){
        normalVertices.push(startPoints[i]);
        normalVertices.push(startPoints[i+1]);
        normalVertices.push(startPoints[i+2]);
        normalVertices.push(endPoints[i]);
        normalVertices.push(endPoints[i+1]);
        normalVertices.push(endPoints[i+2]);
    }
    console.log("normal vertices: " + normalVertices);
}


function do_draw_surface_normals(){
   // var n = index/2; //Number of coordinate pairs
    
    
    calc_surface_normals_phase1();
    calc_normal_line_vertices();
    fill_normal_vertex_colors();
    
    var normals_array = new Float32Array(normalVertices);

    //Create buffer object
    var normalBuffer = gl.createBuffer();
    if (!normalBuffer){
        console.log('Failed to create the buffer object');
        return false;
    }
        
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals_array, gl.STATIC_DRAW);
    
    //initialize a_Position for shader
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    var normalColorArray = new Float32Array(normalVerticesColors);
    // Create color buffer
    var colorBuffer = gl.createBuffer();
    // Bind the color buffer and assign data
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normalColorArray, gl.STATIC_DRAW);
    // Bind the buffer to a_Color
    
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    
    gl.drawArrays(gl.LINES , 0, normalVertices.length/3);//Draw lines
    return true;    
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



function expand_cylinder_vertices() {
    expanded_vertices = [];
    for(var i = 0; i < indexes.length; i++) {
        var n = indexes[i];
        expanded_vertices.push(vertices[n * 3]);
        expanded_vertices.push(vertices[n * 3 +1]);
        expanded_vertices.push(vertices[n * 3 + 2]);
    } 
    console.log("expanded_vertices: " + expanded_vertices);
}

function expand_cylinder_vertex_colors() {
    expanded_vertex_colors = [];
    for(var i = 0; i < shaded_colors.length; i+=3){
        for(var j = 0; j < 3; j++){
            expanded_vertex_colors.push(shaded_colors[i]);
            expanded_vertex_colors.push(shaded_colors[i + 1]);   
            expanded_vertex_colors.push(shaded_colors[i + 2]);
        }
        
    }
    console.log("Num vertices: " + expanded_vertices.length + " Num colors: " + expanded_vertex_colors.length);
}

//create and bind buffers with P_prime
function do_draw_cylinders(){
    
    
    for(var i = 4; i <= index; i += 2){

        initIndexArray();
        transformed_cylinder_vertices_part1(i); 
        calc_surface_normals_phase1();
        normalize_light_direction();
        calc_surface_colors();
        expand_cylinder_vertices();
        expand_cylinder_vertex_colors();

        var vertices_array = new Float32Array(expanded_vertices);

        //Create buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer){
            console.log('Failed to create the buffer object');
            return false;
        }

        //Bind buffer to target and write data into buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, vertices_array, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        
        var shadedColorsArray = new Float32Array(expanded_vertex_colors);
        var colorBuffer = gl.createBuffer();
        
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, shadedColorsArray, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        
        gl.drawArrays(gl.TRIANGLES, 0, expanded_vertices.length / 3);
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

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    var vertBuffer = gl.createBuffer();
    var indBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawElements(gl.LINE_STRIP, indexes.length/2, gl.UNSIGNED_SHORT, 0);
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




  
  
  
