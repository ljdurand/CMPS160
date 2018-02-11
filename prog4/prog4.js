//Lisa Durand
//ldurand
//Dec 3, 2017
//prog4.js

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'varying vec2 v_TexCoord;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
   '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'uniform bool u_TextureLoaded;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  if(u_TextureLoaded){\n' +
  '    vec4 texture = texture2D(u_Sampler, v_TexCoord);\n' +
  '    gl_FragColor = v_Color + texture;\n' +
  '  }else{\n' +
  '    gl_FragColor = v_Color;\n' +
  '  }\n' +
  '}\n';

//need init and loadTexture before any drawing
//textcoord and matrix should be same length

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
var pointLight = [0, 500, 0];
var shouldDrawNormals = false;
var shouldUseSmoothShading = false;
var shouldUsePerspective = false;
var normalVertices = [];
var normalVerticesColors = [];
var lightBarColors = [1, 0, 0, 1, 0, 0];
var centers = [];
var surface_to_light = [];
var normalized_light = [];
var shaded_colors = [];
var normal_color = [1, 0, 0];
var color = [1, 0, 0];
var pointLightColor = [1, 1, 0];
var specular_color = [0, 1, 0];
var projMatrix;
var u_ProjMatrix;
var a_TexCoord;
var viewMatrix;
var u_ViewMatrix;
var averageTheta;
var flatShadingVertexColors = [];
var smoothShadingVertexColors = [];
var smoothNorms = [];
var extendedSmoothNormsArray = [];
var extendedTexCoordArray = [];
var shouldUseSpecShading = false;
var specValue;
var normalsForEachVertex = [];
var specularShading = [];
var extendedFlatNormsArray = [];
var lightBarVector = [0,0, 0, 500, 500,500];
var pointLightPerVertexSmooth = [];
var normalizedSmoothPointLight = [];
var pointLightPerVertexFlat = [];
var normalizedFlatPointLight = [];
var rubberbandColor = [0, 0, 0];
var rubberBandColors = [];
var lightBarAlpha = 0.99;
var cubeAlpha = 0.98;
var pointLightOn = true;
var directionalLightOn = true;
var shaded_point_light = [];
var specularShadingPoint = [];
var indexesList = []; //indexes of object
var verticesList = []; //vertices of object
var pickedObject = null; //for picking object
var alpha = .97;
var translationMatrixList = [];
var rotationMatrixList= [];
var scalingMatrixList = [];
var rotate = false;
var translate = false;
var translateOnZ = false;
var scaling = false;
var pan = false;
var cameraMove = false;
var dragStartX;
var dragStartY;
var previewTranslationMatrix =  new Matrix4();
previewTranslationMatrix.setIdentity();
var previewTranslationOnZMatrix =  new Matrix4();
previewTranslationOnZMatrix.setIdentity();
var previewRotationMatrix = new Matrix4();
previewRotationMatrix.setIdentity();
var previewScalingMatrix = new Matrix4();
previewScalingMatrix.setIdentity();
var currentScaleAmount = 0;
var currentFieldOfView = 60;
var theCurrentFieldOfView = 60;
var orthoLeft = -500.0;
var orthoRight = 500.0;
var orthoBottom = -500.0;
var orthoTop = 500.0;
var lookFromX = 0;
var lookFromY = 0;
var lookFromZ = 1000;
var lookAtX = 0;
var lookAtY = 0;
var lookAtZ = 0;
var panStartX;
var panStartY;
var near = 1;
var far = 1800;
var panPreviewX = 0;
var panPreviewY = 0;
var textCoord = [];
var textMap = false;

//retrieve the <canvas> element, get the rendering context for WebGL,
// initialize shaders, set color for clearing <canvas>, clear <canvas>,
function main(){
    
    //Retreive <canvas> element
     canvas = document.getElementById('webgl');

    //Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas,{preserveDrawingBuffer: true});
    if(!gl){
        // console.log('Failed to get redering context for gl');
        return;
    }
    
    //initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        // console.log('Failed to intialize shaders.');
        return;
    }
    
    
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        // console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if(a_Color < 0){
        // console.log('Failed to get the storage location of a_Color');
        return; 
    }
    
    a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if(a_TexCoord < 0){
        // console.log('Failed to get the storage location of a_Color');
        return; 
    }
    
    
    var u_TextureLoaded = gl.getUniformLocation(gl.program, 'u_TextureLoaded');
    if (!u_TextureLoaded) {
      console.log('Failed to get the storage location of u_TextureLoaded');
      return;
    }
    
    initTextureMap();
    gl.uniform1i(u_TextureLoaded, 0); 
        
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev){click(ev)};
    
    canvas.onmousewheel = function(ev){scale(ev)};
    
    canvas.onmouseup = function(ev){stopRT(ev)};
    

    //check for mouse movement
    canvas.addEventListener('mousemove',function(ev){follow_mouse(ev)});
     
    // specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    gl.enable(gl.DEPTH_TEST);
    
    //gl.disable(gl.TEXTURE_2D);
    
    //Clear >canvas>
  //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    redraw_canvas();
    
    setupIOSOR("fileName");
    
}


//Saving and reading functions
function saveSOR(){
    vertices = [];
    indexes = []; 
    for(var i = 0; i < verticesList.length; i ++){
      //  var size = verticesList[i].length;
       // for(var j = 0; j < size; j ++){
        var transformationMatrix = new Matrix4();
        transformationMatrix.setIdentity();
        transformationMatrix.multiply(translationMatrixList[i]);
        transformationMatrix.multiply(rotationMatrixList[i]);
        transformationMatrix.multiply(scalingMatrixList[i]);

        nonTransformedVertices = verticesList[i];
    
        //for each vertex, multiply by transformation x, y, z, 1, transformation by matrix4
    
    
        for(var j = 0; j < nonTransformedVertices.length; j +=3){
            var oneVector = new Vector4([nonTransformedVertices[j], nonTransformedVertices[j+1], nonTransformedVertices[j+2], 1]);
            oneVector = transformationMatrix.multiplyVector4(oneVector);
            vertices.push(oneVector.elements[0]);
            vertices.push(oneVector.elements[1]);
            vertices.push(oneVector.elements[2]);
        }     
            
         //   vertices.push(verticesList[i][j]);
       // }
    }
    
    var shift = 0;
    for(var i = 0; i < indexesList.length; i++){
        var size = indexesList[i].length;
        for(var j = 0; j < size; j++){
            indexes.push(indexesList[i][j] + shift);
        }
        shift += verticesList[i].length / 3;
    }
    
    
    
    
    var name = prompt("Please enter your file name");
    saveFile(new SOR(name, vertices, indexes));
}

function readSOR(){
    var SORObj = readFile();
    vertices = SORObj.vertices;
    // console.log("vertices: " +vertices);
    indexes = SORObj.indexes;
    // console.log("indexes: " + indexes);

    right_clicked = true;
    
    addObject();
    redraw_canvas();
}


function image1Clicked(){
    var image = "pinkflower.jpg";
    initTextureMap(image);
}

function image2Clicked(){
    var image = "sky_cloud.jpg";
    initTextureMap(image);
}

function image3Clicked(){
    var image = "lightblueflower.jpg";
    initTextureMap(image);
}

function image4Clicked(){
    var image = "yellowflower.jpg";
    initTextureMap(image);
}


function initTextureMap(clickedImage){
  textMap = true;
   
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
    
  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
    
  var u_TextureLoaded = gl.getUniformLocation(gl.program, 'u_TextureLoaded');
  if (!u_TextureLoaded) {
      console.log('Failed to get the storage location of u_TextureLoaded');
      return false;
  }
  gl.uniform1i(u_TextureLoaded, 1);
    
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ loadTexture(texture, u_Sampler, image); };
    
  image.src = clickedImage;
  return true; 
}


function textMapOff(){
    textMap = false;
     var u_TextureLoaded = gl.getUniformLocation(gl.program, 'u_TextureLoaded');
    if (!u_TextureLoaded) {
      console.log('Failed to get the storage location of u_TextureLoaded');
      return;
    }
    gl.uniform1i(u_TextureLoaded, 0);
    redraw_canvas();
}

function loadTexture(texture, u_Sampler, image){
  //console.log("loadTexture");
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler, 1);  
    
  redraw_canvas();
}

//actions that take place on mouse click- get coordinates, convert to
//canvas plane, store coordinates in arrays, print and keep track of
//coordinates pressed, check for mouse movement
function click(ev){
    var x = ev.clientX; //x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
    if(right_clicked){
        if(pickedObject != null){
            scalingMatrixList[pickedObject] = scalingMatrixList[pickedObject].multiply(previewScalingMatrix);
            previewScalingMatrix.setIdentity();
            currentScaleAmount = 0;
            scaling = false;
        }
        if(rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom){
            var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
            trySelect(x_in_canvas, y_in_canvas);
        }   
        if(ev.button == 0 && pickedObject != null){
            translate = true;
            dragStartX = x;
            dragStartY = y;
        }
        if(ev.button == 2 && pickedObject != null){
            rotate = true;
            dragStartX = x;
            dragStartY = y;
        }
        if(ev.button == 1 && pickedObject != null){
            translateOnZ = true;
            dragStartX = x;
            dragStartY = y;
        }
        if(ev.button == 0 && pickedObject == null){
            pan = true;
            panStartX = x;
            panStartY = y;
        }
        if(ev.button == 1 && pickedObject == null){
            cameraMove = true;
        }
        
        console.log("ev.button: " + ev.button);
        redraw_canvas();
        return;  
    }
    
    
    if(ev.button==0 && right_clicked == false){        
        //convert coordinates to canvas plane
      x = (((x - rect.left) - canvas.width/2)/(canvas.width/2)) * 500;
      y = ((canvas.height/2 - (y - rect.top))/(canvas.height/2)) * 500; 
        
    //    // console.log("x: " + x);
      //  // console.log("y: " + y);

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
        
       // console.log("You left-clicked at (" +x+ ", "+y+ ")");
    }
    
    
    //print out list of all coordinates from array
    if(ev.button==2 && right_clicked == false){
        //transformed_cylinder_vertices_part1(index);   //call function to rotate coordinates around clicked point
        
        
//         x = (((x - rect.left) - canvas.width/2)/(canvas.width/2)) * 500;
//        y = ((canvas.height/2 - (y - rect.top))/(canvas.height/2)) * 500; 
//        
//    //    // console.log("x: " + x);
//      //  // console.log("y: " + y);
//
//        //store coordinates in xy_points array
//        xy_points[index]=x;
//        index++;
//        xy_points[index]=y;
//        index++;
//        
        // console.log("You right-clicked at (" + ev.clientX + ", " + ev.clientY + ")."); 
        // console.log("List of all Coordinates: " + "\n");
        for(var i=0; i< index; i+=2){
            // console.log("("+xy_points[i]+"," + xy_points[i+1] + ")" + "\n");
        }
        
        initIndexArray();
        transformed_cylinder_vertices();
//        indexesList.push(indexes);
//        verticesList.push(vertices);
        
        addObject();
        right_clicked = true;
        
    }

    
    //code from piazza to get rid of box on right click
    canvas.addEventListener('contextmenu',function(ev){
        if(ev.button == 2){
            ev.preventDefault();
            return false;
        }
    }, false);
    
    
 //  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   redraw_canvas();
}


function scale(ev){
    ev.preventDefault();
    if(right_clicked){
        if(pickedObject != null){
            currentScaleAmount += ev.deltaY * .009;
            if(currentScaleAmount < -1)    currentScaleAmount = -1;
            if(currentScaleAmount > 1)     currentScaleAmount = 1;
            var actualScale = Math.pow(2, currentScaleAmount);
            previewScalingMatrix.setScale(actualScale, actualScale, actualScale);
           // scalingMatrixList[pickedObject] = scalingMatrixList[pickedObject].multiply(previewScalingMatrix);
            redraw_canvas();
            //scalingMatrix.scale(zoomX, zoomY, zoomX);
        }else if(pickedObject == null && cameraMove == true){
            lookFromZ += ev.deltaY * .1;
           // lookFromY += ev.deltaY * .1;
    //       near += ev.deltaY * .009;
   //        far += ev.deltaY * .009;
            redraw_canvas();
            
        }else if(pickedObject == null){
            currentFieldOfView += (ev.deltaY * .009);
            if(currentFieldOfView > 180)    currentFieldOfView = 180;
            if(currentFieldOfView < 0)      currentFieldOfView = .1;
            orthoLeft -= ev.deltaY * .1;
            orthoRight += ev.deltaY * .1;
            orthoBottom -= ev.deltaY * .1;
            orthoTop += ev.deltaY * .1;
            if(orthoTop < 12.5){
                orthoTop = 12.5;
                orthoRight = 12.5;
            }
            if(orthoBottom > -12.5){
                orthoBottom = -12.5;
                orthoLeft = -12.5;
            }
            console.log("orthoTop: " + orthoTop);
            console.log("orthoBottom: " + orthoBottom);
            redraw_canvas();
        }
    }
}

//to draw line when mouse moves until clicked
function follow_mouse(ev){
   
    var x = ev.clientX; //x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    
     if(right_clicked) {
       // console.log("rotate: " + rotate);
        console.log("cameraMove: " + cameraMove);
         console.log("translateOnZ: " + translateOnZ);
        if(pickedObject != null &&  translate == true){
            previewTranslationMatrix.setTranslate((x - dragStartX), -(y - dragStartY), 0);
            redraw_canvas();
        }
        if(pickedObject != null &&  translateOnZ == true){
            previewTranslationMatrix.setTranslate(0, 0,  -(y - dragStartY));
            redraw_canvas();
        }
        if(pickedObject != null && rotate == true){
            if(Math.abs((x-dragStartX)) > Math.abs((y-dragStartY))){
                previewRotationMatrix.setRotate(x-dragStartX, 0, 0, 1);
                redraw_canvas();
            }
            if(Math.abs((x - dragStartX)) < Math.abs((y-dragStartY))){
                previewRotationMatrix.setRotate(-(y-dragStartY), 1, 0, 0);
                redraw_canvas();
            } 
        }
        if(pickedObject != null && scaling == true){
            scalingMatrixList[pickedObject] = scalingMatrixList[pickedObject].multiply(previewScalingMatrix);
            previewScalingMatrix.setIdentity();
            currentScaleAmount = 0;
            scaling = false;
            redraw_canvas(); 
        }
        if(pickedObject == null && pan == true){
            panPreviewX = x-panStartX;
            panPreviewY = -(y - panStartY);
            if(panPreviewX > 400) panPreviewX = 400;
            if(panPreviewX < -400) panPreviewX = -400;
            if(panPreviewY > 400) panPreviewY = 400;
            if(panPreviewY < -400) panPreviewY = -400;
            redraw_canvas();
            
        }
         console.log("panPreviewX: " + panPreviewX);
         console.log("panPreviewY: " + panPreviewY);
         console.log("lookFromX: " + lookFromX);
         console.log("lookFromY: " + lookFromY);
         console.log("orthoLeft: " + orthoLeft);
         console.log("orthoRight: " + orthoRight);
         console.log("orthoBottom: " + orthoBottom);
         console.log("orthoTop: " + orthoTop);
        return; 
    }
        
    // Convert coordinates to canvas plane
    x = (((x-rect.left)-canvas.width/2)/(canvas.width/2)) * 500;
    y = ((canvas.height/2-(y-rect.top))/(canvas.height/2)) * 500;
    
   // // console.log("x: " + x);
   // // console.log("y: " + y);
    
    //store coordinates in xy_points array
       xy_points[index]=x;
       index++;
       xy_points[index]=y;
       index++; 
       index-=2;
    
    
 //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      redraw_canvas();
}
    
function stopRT(ev){
    
    if(!right_clicked) return;
    if(pickedObject != null){
        rotationMatrixList[pickedObject] = rotationMatrixList[pickedObject].multiply(previewRotationMatrix);
        translationMatrixList[pickedObject] = translationMatrixList[pickedObject].multiply(previewTranslationMatrix);
        scalingMatrixList[pickedObject] = scalingMatrixList[pickedObject].multiply(previewScalingMatrix);
        translationMatrixList[pickedObject] = translationMatrixList[pickedObject].multiply(previewTranslationOnZMatrix);
    }
    
    if(pickedObject == null){
        lookAtX += panPreviewX;
        lookAtY += panPreviewY;
        lookFromX += panPreviewX;
        lookFromY += panPreviewY;
    }
    
    console.log("ev.button up: " + ev.button);
    rotate = false;
    translate = false;
    translateOnZ = false;
    scaling = false;
    cameraMove = false;
    pan = false;
    previewTranslationMatrix.setIdentity();
    previewRotationMatrix.setIdentity();
    previewScalingMatrix.setIdentity();
    currentScaleAmount = 0;
    panPreviewX = 0;
    panPreviewY = 0;
    previewTranslationOnZMatrix.setIdentity();
    redraw_canvas();
}

    

//clear buffer and call functions to call draw functions
function redraw_canvas(){
    // clear <canvas>
    
    u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if(!u_ProjMatrix){
        // console.log("Failed to get the storage location of u_ProjMatrix");
        return;
    }
        
    projMatrix = new Matrix4();
    
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if(!u_ViewMatrix){
        // console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }
        
    viewMatrix = new Matrix4();
    
    if(shouldUsePerspective == true){
        console.log("currentFieldOfView: " + currentFieldOfView);
        projMatrix.setPerspective(currentFieldOfView, canvas.width/canvas.height, 1, 1800);
        viewMatrix.lookAt(lookFromX + panPreviewX, lookFromY + panPreviewY, lookFromZ, lookAtX + panPreviewX, lookAtY + panPreviewY, lookAtZ, 0, 1, 0);
    }else{
        projMatrix.setOrtho(orthoLeft, orthoRight, orthoBottom, orthoTop, near, far);
        viewMatrix.setIdentity();
        viewMatrix.lookAt(lookFromX + panPreviewX, lookFromY + panPreviewY, lookFromZ, lookAtX + panPreviewX, lookAtY + panPreviewY, lookAtZ, 0, 1, 0);
        console.log("viewMatrix: " + viewMatrix);
      //  viewMatrix.lookAt(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    
    
   // // console.log("redraw vertices: " + vertices);
   // // console.log("redraw indices: " + indexes);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    alpha = .97;
    draw_light_cube();
    draw_light_bar(); //WHYYYYYY
    draw_clicked_points();
    if(right_clicked == true){
//        initIndexArray();
//        transformed_cylinder_vertices();
//        indexesList.push(indexes);
//        verticesList.push(vertices);
        for(var i = 0; i < indexesList.length; i++){
                draw_object(i, alpha);
                alpha -= .01;
            }
        }
        // console.log(" indexesList: " +  indexesList);
        if(shouldDrawNormals == true){
            for(var i = 0; i < indexesList.length; i++){
                draw_surface_normals(i);
            }
        }
}


function addObject(){
    //in read sor on right click
    //take in vertices and indices, 
    //add indices adn vertices to object list, get center of object, empty transformation matrix with scaling, rotating, and movement. identity matrix starter, translate first
    //transformationmatrices for every object, 
    //solve for center point
    // transformation matrix shifts entire object to object center
    
    //average of all object vertices
    var translationMatrix= [];
    var rotationMatrix = [];
    var scalingMatrix = [];
    
    var sumx = 0;
    var sumy = 0;
    var sumz = 0;
    var avg = 0;
    var objectCenter = [];
    var div = vertices.length / 3;
    for(var i = 0; i < vertices.length; i+=3){
        sumx += vertices[i];
        sumy += vertices[i+1];
        sumz+= vertices[i+2];
    }
    objectCenter.push(sumx/div);
    objectCenter.push(sumy/div);
    objectCenter.push(sumz/div);
    
    
    for(var i = 0; i < vertices.length; i +=3){
        vertices[i] = vertices[i] - objectCenter[0];
        vertices[i+1] = vertices[i+1] - objectCenter[1];
        vertices[i+2] = vertices[i+2] - objectCenter[2];
    }
    
    
    verticesList.push(vertices);
    indexesList.push(indexes);
    translationMatrix = new Matrix4();
    rotationMatrix = new Matrix4();
    scalingMatrix = new Matrix4();
    translationMatrix.setTranslate(objectCenter[0], objectCenter[1], objectCenter[2]);
    rotationMatrix.setIdentity();
    scalingMatrix.setIdentity();
    
//    scalingMatrix.scale(2, 1, .1);
    
    translationMatrixList.push(translationMatrix);
    rotationMatrixList.push(rotationMatrix);
    scalingMatrixList.push(scalingMatrix);
}

function trySelect(x, y){
    var pixels = new Uint8Array(4);
    var cubeAlphaAsInt = 250;
    var lightBarAlphaAsInt = 252;
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    // console.log("alpha: " + pixels);
    if(pixels[3] == cubeAlphaAsInt){
         pointLightOn = !pointLightOn;
    }else if(pixels[3] == lightBarAlphaAsInt){
        directionalLightOn = !directionalLightOn;
    }else if(pixels[3] != 255){
        for(var i = 0; i < indexesList.length; i++){
            var comparison = Math.round((255 * (.97 - (i*.01))));
            if(comparison == pixels[3]){
                pickedObject = i;
            }
        }
    }else{
         pickedObject = null;      
    }
    // console.log("pixels: " + pixels);
}


function draw_light_cube(){
    var success = do_draw_light_cube();
    if (!success) {
        // console.log('Failed to draw light cube');
        return;
    }      
}

function draw_light_bar(){
    var success = do_draw_light_bar();
    if (!success) {
        // console.log('Failed to draw light bar');
        return;
    }  
}

//error check clicking points
function draw_clicked_points(){
      //set the positions of vertices
    var success = do_draw_clicked_points();
    if (!success) {
        // console.log('Failed to set the positions of the vertices');
        return;
    }
}

//error check drawing cylinders
function draw_object(anObjectIndex, alpha){
    // console.log("anobjectindex: " + anObjectIndex);
    var success = do_draw_objects(anObjectIndex, alpha);
    if (!success) {
        // console.log('Failed to set the positions of the vertices');
        return;
    }
}

function on_perspective_view_checkbox_clicked(element){
    shouldUsePerspective = element.checked;
    // console.log("shouldUsePerspective: " + shouldUsePerspective);
    redraw_canvas();
}

//on event that checkbox for normals is clicked
function on_surface_normal_checkbox_clicked(element) {
    shouldDrawNormals = element.checked;
    // console.log('shouldDrawNormals: ' + shouldDrawNormals);
    redraw_canvas();
}

function on_smooth_shading_checkbox_clicked(element) {
    shouldUseSmoothShading = element.checked;
    // console.log('shouldUseSmoothShading: ' +shouldUseSmoothShading);
    redraw_canvas();
}

function on_spec_shading_checkbox_clicked(element){
    shouldUseSpecShading = element.checked;
    // console.log('shouldUseSpecShading: ' +shouldUseSpecShading);
    specValue = 10;
    redraw_canvas();
}

function sliderValueChange(element){
    var slider = document.getElementById("myRange");
    // console.log("slider.value: " + slider.value);
    specValue = slider.value;
    specValue.innerHTML;
    // console.log("spec Value: " + specValue);
    redraw_canvas();
}

//error check for drawing surface normals
function draw_surface_normals(anObjectIndex){
    var success = do_draw_surface_normals(anObjectIndex);
    if (!success) {
        // console.log('Failed to set the positions of the vertices');
        return;
    }
}


//[1, 2, 3] //Vector of size 3
//[1, 2, 3, 2, 3, 4] //CONCATENATED vectors (concat)
//[[1,2,3], [1,2,3]] //LIST of vectors
//rename buffers to buffer instead of array, BUFFER


function magnitude(vector){
    var sum = 0;
    for (var i = 0; i < vector.length; i++){
        sum += Math.pow(vector[i], 2);
    }
    return Math.sqrt(sum);
}

function normalize(vector){
    var normalizedVector = [];
    var distance = magnitude(vector);
    for(var i = 0; i < vector.length; i++){
        normalizedVector.push(vector[i]/distance);
    }
    return normalizedVector;
}

function dotProduct(vector1, vector2){
    var theDotProduct = 0;
    for(var i = 0; i < vector1.length; i++){
        theDotProduct += vector1[i] * vector2[i];
    }
    return theDotProduct;
}

function crossProduct(vector1, vector2){
    var theCrossProduct = [];
    theCrossProduct.push((vector1[1] * vector2[2]) - (vector2[1] * vector1[2]));
    theCrossProduct.push((vector2[0] * vector1[2]) - (vector1[0] * vector2[2]));
    theCrossProduct.push((vector1[0] * vector2[1]) - (vector2[0] * vector1[1]));
    return theCrossProduct;
}

function normalizedCrossProduct(vector1, vector2){
    var normalizedCrossProduct = crossProduct(vector1, vector2);
    return normalize(normalizedCrossProduct);
}

function addVector(vector1, vector2){
    var addedVector = [];
    for(var i = 0; i < vector1.length; i++){
        addedVector.push(vector1[i] + vector2[i]);
    }
    return addedVector;
}

function multiplyVectorByScalar(vector, scalar){
    var scaledVector = [];
    for(var i = 0; i < vector.length; i++){
        scaledVector.push(scalar * vector[i]);
    }
    return scaledVector;
}

function averageVectors(listOfVectors){
    var avgVector = [];
    var size = listOfVectors[0].length;
    for(var j = 0; j < size; j++){
        avgVector.push(0);
    }
    for(var i = 0; i < listOfVectors.length; i+=1){
        avgVector = addVector(listOfVectors[i], avgVector);
    }
    var div = listOfVectors.length;
    avgVector = multiplyVectorByScalar(avgVector, 1/div);
    return avgVector;
}

//given 1  2D point, as vector [x, y], rotate point counterclockwise by theta
function rotatePoint(pointVector, theta) {
    var rotatedVector = [];
    var r = magnitude(pointVector);
    var x = r * Math.sin(theta);
    var y = r * Math.cos(theta);
    rotatedVector.push(x);
    rotatedVector.push(y);   
    return rotatedVector;
}

//given one 3D point, rotate point counterclockwise by theta radians, x shouldn't change
function rotate3DPointAroundXAxis(pointVector, theta){
    var pointVector2D = [];
    var rotatedPointVector2D = [];
    var rotatedPointVector3D = [];
    pointVector2D.push(pointVector[1]);
    pointVector2D.push(pointVector[2]);
    rotatedPointVector2D = rotatePoint(pointVector2D, theta);
    rotatedPointVector3D.push(pointVector[0]);
    rotatedPointVector3D.push(rotatedPointVector2D[0]);
    rotatedPointVector3D.push(rotatedPointVector2D[1]);
    return rotatedPointVector3D;
}

function transformAllConcatVectors(concatVectors, sizeOfOneVector, transformFunc){
    var newConcatVector = [];
    for(var i = 0; i < concatVectors.length; i+=sizeOfOneVector){
        var oneVector = [];
        for(var j = 0; j < sizeOfOneVector; j++){
            oneVector.push(concatVectors[j+i]);
        }
        var transformedVector = transformFunc(oneVector);
        for(var k = 0; k < transformedVector.length; k++){
            newConcatVector.push(transformedVector[k]); 
        }
    }
    return newConcatVector; 
}

//return 12 points, rotated to average theta. they will be on top of one clicked point
function calculateOneAverageTheta(i){
    var theta1;
    var theta2;
    //expand indices for many cylinders and norms 
    var P3x = xy_points[i-2];    
    var P3y = xy_points[i-1];
    var P2x = xy_points[i-4];
    var P2y = xy_points[i-3];
    var P1x = xy_points[i - 6];
    var P1y = xy_points[i - 5];
    var m1 = (P2y - P1y) / (P2x - P1x);
    var m2 = (P3y - P2y) / (P3x - P2x); //slope
    theta1 = Math.atan(m1);
    theta2 = Math.atan(m2); //get theta
    
    if(P2x-P1x < 0){
        theta1 += Math.PI;
    }
    
    if(P3x - P2x < 0){
        theta2 += Math.PI;
    }
    
    averageTheta = (theta1 + theta2) / 2;
    return averageTheta;
}

function calculateOneNonAverageTheta(i){
    var P1x = xy_points[i-4];
    var P1y = xy_points[i-3];
    var P2x = xy_points[i-2];
    var P2y = xy_points[i-1];
    var m = (P2y - P1y) / (P2x - P1x);
    var nonAverageTheta = Math.atan(m);
    
    if(P2x-P1x < 0){
        nonAverageTheta += Math.PI;
    }
    return nonAverageTheta;                                    
}

function calculateAllAverageThetas(){
    var allAverageThetas = [];
    allAverageThetas.push(calculateOneNonAverageTheta(4));
    for(var i = 6; i <= index; i+=2){
        allAverageThetas.push(calculateOneAverageTheta(i));
    }
     allAverageThetas.push(calculateOneNonAverageTheta(index)); 
    return allAverageThetas;
}

function calculateAllTheta2s(){
    var theta2s = [];
    for(var i = 4; i <= index; i+=2){
        theta2s.push(calculateOneNonAverageTheta(i));
    }
    theta2s.push(calculateOneNonAverageTheta(index));
    return theta2s;
}

function calculateLScale(){
    var LArray = [];
    var thetaAvgs = calculateAllAverageThetas();
    var L;
    var theta2 = calculateAllTheta2s();
    for(var i = 0; i < thetaAvgs.length; i++){
       L = 1/(Math.cos(thetaAvgs[i] - theta2[i]));
       LArray.push(L);
    }
    return LArray;
}

//rotate 12 points around origin and push coordinates into array
function calculate_cylinder_template_vertices(n){
    var P1 = [];    //rotated points on unit cylinder
    var r = 50; //radius
    //coordinates for unit cylinder:
    var x = 0;     
    var y = 0;
    var z = 0;
    
    //get x, y, z coordinates and store in P1
    for(var theta =  2* (Math.PI); theta > 0; theta-= 2 *(Math.PI * (1.0/12.0))){
        z = r * Math.cos(theta);
        y = r * Math.sin(theta);
        P1.push(x);
        P1.push(y);
        P1.push(z);
    }
    // console.log("P1.length: " + P1.length);
    // console.log("P1 array(12 rotated coordinates around point): " + P1);
    return P1;
}

function calculateOneCrossSectionVertices(LScale, avgTheta, centerPointX, centerPointY, P1){
    var rotated = []; //array of rotated points with correct coordinates
    var x;
    var y;
    var z;
    for(var j = 0; j < P1.length; j+=3){
       x = LScale * ((P1[j] * Math.cos(avgTheta)) - (P1[j+1] * Math.sin(avgTheta)));
       y = LScale * ((P1[j] * Math.sin(avgTheta)) + (P1[j+1] * Math.cos(avgTheta)));
       z = (P1[j+2]);
       rotated.push(x);
       rotated.push(y);
       rotated.push(z);
    }
    
    for(var i = 0; i < P1.length; i+=3){
        vertices.push(rotated[i] + centerPointX);
        vertices.push(rotated[i+1] + centerPointY);
        vertices.push(rotated[i+2]);
      }

    // console.log("vertices (rotated coordinates from clicked points): " + vertices);
    // console.log("vertices.length: " + vertices.length);
    
}

//translate P1 coordinates to coordinates depending on left mouse click locations
function transformed_cylinder_vertices(){
    //// console.log("n: " +n);
    //coordinates for point A and B
    vertices = [];
    
    var P1 = calculate_cylinder_template_vertices();
    
    var Ls = calculateLScale();
    var avgThetas = calculateAllAverageThetas();
    
    for(var i = 0; i < index / 2; i++){
        calculateOneCrossSectionVertices(Ls[i], avgThetas[i], xy_points[i * 2], xy_points[(i*2) + 1], P1);
    }    
}

//make arrays of P, Q, and R vertices and calculate PQ and QR
function calc_surface_normals_phase1(P1){
    var P = [];
    var Q = [];
    var R = [];
    var PQ = [];
    var QR = [];
    //get coordinates for indices and store them in arrays
    for(var i = 0; i < indexes.length; i +=3){
        var Pindex = indexes[i];
        // console.log("Pindex: " + Pindex);
        var Qindex = indexes[i+1];
        // console.log("Qindex: " + Qindex);
        var Rindex = indexes[i+2];
        // console.log("Rindex: " + Rindex);
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
    // console.log("P: " + P);
    // console.log("Q: " + Q);
    // console.log("R: " + R);
    for(var j = 0; j < P.length; j++){
        PQ.push(Q[j] - P[j]);
    }
    for(var k = 0; k < Q.length; k++){
        QR.push(R[k] - Q[k]);
    }
    // console.log("PQ: " +PQ);
    // console.log("QR: " + QR);
    calc_surface_normals_phase2(PQ, QR);       
}

//take cross product of PQ and QR
function calc_surface_normals_phase2(PQ, QR){
    var cross = [];
    for(var i = 0; i < PQ.length; i+=3){
    cross.push((PQ[i+1] * QR[i+2]) - (QR[i+1] * PQ[i+2]));
    cross.push((QR[i] * PQ[i+2]) - (PQ[i] * QR[i+2]));
    cross.push((PQ[i] * QR[i+1]) - (QR[i] * PQ[i+1]));
    }
    // console.log("cross product: " + cross);
    calc_surface_normals_phase3(cross);
}

//get normals
function calc_surface_normals_phase3(cross){
    norm = [];
    for(var i = 0; i < cross.length; i+=3){
        var distance = Math.sqrt(Math.pow(cross[i], 2) + Math.pow(cross[i+1], 2) +
                                Math.pow(cross[i+2], 2));
        norm.push(cross[i]/distance);
        norm.push(cross[i+1]/distance);
        norm.push(cross[i+2]/distance);
    }
    // console.log("normal vector: " + norm);
    // console.log("normal vector length: " + norm.length);
}

function calc_centerPoints(){
    centers = [];
    surface_to_light = [];
    for(var i = 0; i < indexes.length; i+=3){
        var Pindex = indexes[i];
        // console.log("Pindex: " + Pindex);
        var Qindex = indexes[i+1];
        // console.log("Qindex: " + Qindex);
        var Rindex = indexes[i+2];
        // console.log("Rindex: " + Rindex);
        centers.push((vertices[(Pindex) * 3] + vertices[(Qindex) * 3] + vertices[(Rindex) * 3]) / 3);
        centers.push((vertices[((Pindex) * 3) + 1] + vertices[((Qindex) * 3) + 1] + vertices[((Rindex) * 3) + 1])/3);
        centers.push((vertices[((Pindex) *3) + 2] + vertices[((Qindex) *3) + 2] + vertices[((Rindex) *3) + 2])/3 );   
    }
    for(var j = 0; j < centers.length; j++){
        surface_to_light.push(light_direction[j] - centers[j]);
    }
    return centers;
}


//normalize light direction
function normalize_light_direction(lightDirection){
    normalized_light = normalize(lightDirection);
}


//calculate colors by taking dot product of normalized light and normals and multiplying by color vector to get a scalar
function calc_colors(normals){
    shaded_colors = [];
    // console.log("normalized Light: " + normalized_light);
    shaded_colors = transformAllConcatVectors(normals, 3, function(vector){
        var dot_product = dotProduct(vector, normalized_light);
        // console.log("dot_product: " + dot_product);
        // console.log("normalize_light: " + normalized_light);
        // console.log("vector: " + vector);
        if(dot_product < 0){
            dot_product = 0;
        }
        return multiplyVectorByScalar(color, dot_product);
    });
    // console.log("shaded_colors: " + shaded_colors);
}

function calc_colors_point(normals, lightDirection){
    shaded_point_light = [];
    var multipliedByScalar = [];
    // console.log("normal vector dot product: " + normals);
    // console.log("light vector dot product: " + lightDirection);
    for(var i = 0; i < normals.length; i+=3){
        var dotProduct = 0;
        //// console.log("dotproduct: " + dotProduct);
        dotProduct += normals[i] * lightDirection[i];
        dotProduct += normals[i+1] * lightDirection[i+1];
        dotProduct += normals[i+2] * lightDirection[i+2];
        if(dotProduct < 0){
            dotProduct = 0;
        }
        multipliedByScalar = multiplyVectorByScalar(color, dotProduct);
        shaded_point_light.push(multipliedByScalar[0]);
        shaded_point_light.push(multipliedByScalar[1]);
        shaded_point_light.push(multipliedByScalar[2]);
    }
   // // console.log("dotproduct: " + dotProduct);
}


//fill normalVerticesColors as green
function fill_normal_vertex_colors(){
    normalVerticesColors = [];
    for (var i = 0; i < normalVertices.length; i+=3) {
        normalVerticesColors.push(normal_color[0]);
        normalVerticesColors.push(normal_color[1]);
        normalVerticesColors.push(normal_color[2]);
    }
}

function rubberbandLinesColors(){
    rubberBandColors = [];
    for(var i = 0; i < xy_points.length; i+=3){
        rubberBandColors.push(rubberbandColor[0]);
        rubberBandColors.push(rubberbandColor[1]);
        rubberBandColors.push(rubberbandColor[2]);
    }
}

//index array with x, y, z coordinates stored as 24 indeces
function initIndexArray(){
    var numCylinders = (index / 2) - 1;
    
    indexes = [];    
    
    for(var j = 0; j < numCylinders; j++){
        for(var i = 0; i < 12; i++){
            indexes.push(((i) % 12) + 12 * j);
            indexes.push((i+1) % 12 + 12 * j);
            indexes.push((((i+1) % 12) + 12 * (j + 1)));

            indexes.push((((i+1) % 12) + 12 * (j + 1)));
            indexes.push((((i) % 12) + 12 * (j + 1)));
            indexes.push(((i) % 12) + 12 * j);
        }
    }
    
    // console.log("indexes: " + indexes);
    // console.log("indexes.length: " + indexes.length);
    return indexes;
}

//calc normals from the center TODO: CHANGE THIS TO HAVE IT CALCULATE FROM THE FACES
function calc_normal_line_vertices() {
    normalVertices = [];
    var startPoints = [];
    var endPoints = [];
    startPoints = calc_centerPoints();
    for(var i = 0; i < norm.length; i += 3){
        endPoints.push(startPoints[i] + norm[i] * 15);
        endPoints.push(startPoints[i+1] + norm[(i+1)] * 15);
        endPoints.push(startPoints[i+2] + norm[(i+2)] * 15);
    }
    // console.log("startPoints: " + startPoints);
    // console.log("endPoints: " + endPoints);
    for(var i = 0; i < norm.length; i +=6){
        normalVertices.push(startPoints[i]);
        normalVertices.push(startPoints[i+1]);
        normalVertices.push(startPoints[i+2]);
        normalVertices.push(endPoints[i]);
        normalVertices.push(endPoints[i+1]);
        normalVertices.push(endPoints[i+2]);
    }
    // console.log("normal vertices: " + normalVertices);
}



function extendedVertices(){
    extendedVerticesArray = [];
    for(var i = 0; i < indexes.length; i++){
        var Pindex = indexes[i];
        extendedVerticesArray.push(vertices[Pindex * 3]);
        extendedVerticesArray.push(vertices[(Pindex * 3) + 1]);
        extendedVerticesArray.push(vertices[(Pindex * 3) + 2]);
    }
}

function extendedSmoothNorms(){
    extendedSmoothNormsArray = [];
    for(var i = 0; i < indexes.length; i++){
        var Pindex = indexes[i];
        extendedSmoothNormsArray.push(smoothNorms[Pindex * 3]);
        extendedSmoothNormsArray.push(smoothNorms[(Pindex * 3) + 1]);
        extendedSmoothNormsArray.push(smoothNorms[(Pindex * 3) + 2]);
    }
    // console.log("extended smooth norms array: " + extendedSmoothNormsArray);
}


function extendedTextureCoordinates(){
    extendedTexCoordArray = [];
    for(var i = 0; i < indexes.length; i++){
        var Pindex = indexes[i];
        extendedTexCoordArray.push(textCoord[Pindex * 2]);
        extendedTexCoordArray.push(textCoord[(Pindex * 2) + 1]);       
    }
    
    for(var i = 0; i < indexes.length/12; i++){
        var j = (i * 6 * 12) * 2 + ((11*6)*2);
        extendedTexCoordArray[j+2] = 1;
        extendedTexCoordArray[j+4] = 1;
        extendedTexCoordArray[j+6] = 1;
    }
    console.log("extendedTexCoordArray: " + extendedTexCoordArray);
    console.log("extendedTexCoordArray length: " + extendedTexCoordArray.length);
    console.log("extendedVerticesArray length: " + extendedVerticesArray.length);
}

function calculatePointLightFlat(){
    pointLightPerVertexFlat = [];
    normalizedFlatPointLight = [];
    var centerVertices = calc_centerPoints();
    for(var i = 0; i < extendedFlatNormsArray.length; i +=9){
        var surfaceNumber = i/9
        // console.log("Pindex calculatepointlight: " + surfaceNumber);
        // console.log("centerVertices[Pindex * 3]: " + centerVertices[surfaceNumber * 3]);
        normalizedFlatPointLight = normalize([pointLight[0] - centerVertices[(surfaceNumber * 3)], pointLight[1] - centerVertices[(surfaceNumber * 3) + 1], 
                                                                pointLight[2] - centerVertices[(surfaceNumber * 3) + 2]]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[0]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[1]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[2]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[0]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[1]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[2]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[0]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[1]);
        pointLightPerVertexFlat.push(normalizedFlatPointLight[2]);
    }
    // console.log("normalizedFlatPointLight: " +normalizedFlatPointLight);
    calc_colors_point(extendedFlatNormsArray, pointLightPerVertexFlat);
}
        
function calculatePointLightSmooth(){
    pointLightPerVertexSmooth = [];
    normalizedSmoothPointLight = [];
    var centerVertices = calc_centerPoints();
    for(var i = 0; i < extendedSmoothNormsArray.length; i +=9){
        var surfaceNumber = i/9;
        normalizedSmoothPointLight = normalize([pointLight[0] - centerVertices[surfaceNumber * 3], pointLight[1] - centerVertices[(surfaceNumber * 3) + 1], 
                                                pointLight[2] - centerVertices[(surfaceNumber * 3) + 2]]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[0]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[1]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[2]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[0]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[1]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[2]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[0]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[1]);
        pointLightPerVertexSmooth.push(normalizedSmoothPointLight[2]);
    }
    calc_colors_point(extendedSmoothNormsArray, pointLightPerVertexSmooth);
}

function extendedFlatNorms(){
    extendedFlatNormsArray = [];
    for(var i = 0; i < norm.length; i+=3){
        extendedFlatNormsArray.push(norm[i]);
        extendedFlatNormsArray.push(norm[i + 1]);
        extendedFlatNormsArray.push(norm[i + 2]);
        extendedFlatNormsArray.push(norm[i]);
        extendedFlatNormsArray.push(norm[i + 1]);
        extendedFlatNormsArray.push(norm[i + 2]);
        extendedFlatNormsArray.push(norm[i]);
        extendedFlatNormsArray.push(norm[i + 1]);
        extendedFlatNormsArray.push(norm[i + 2]);
    }
    // console.log("extended flat norms array: " + extendedFlatNormsArray);
}

function calcFlatShading(){
    flatShadingVertexColors = [];
    for(var i = 0; i < shaded_colors.length; i+=3){
        flatShadingVertexColors.push(shaded_colors[i]);
        flatShadingVertexColors.push(shaded_colors[i+1]);
        flatShadingVertexColors.push(shaded_colors[i + 2]);
        flatShadingVertexColors.push(shaded_colors[i]);
        flatShadingVertexColors.push(shaded_colors[i+1]);
        flatShadingVertexColors.push(shaded_colors[i + 2]);
        flatShadingVertexColors.push(shaded_colors[i]);
        flatShadingVertexColors.push(shaded_colors[i+1]);
        flatShadingVertexColors.push(shaded_colors[i + 2]);
    }
}

function allNormalsForEachVertex(){
    smoothNorms = [];
    normalsForEachVertex = [];
    for(var i = 0; i < vertices.length / 3; i++){
        normalsForEachVertex.push([]);
    }
    
    
    // console.log("normalsForEachVertex:" + normalsForEachVertex);
    for(var i = 0; i < indexes.length; i+=3){
        var Pindex = indexes[i];
        // console.log("Pindex all normals for each vertex: " + Pindex);
        var Qindex = indexes[i+1];
        // console.log("Qindex all normals for each vertex: " + Pindex);
        var Rindex = indexes[i+2];
        // console.log("Rindex all normals for each vertex: " + Pindex);
        var surfaceNorm = ([norm[i], norm[i+1], norm[i+2]]);
        
        normalsForEachVertex[Pindex].push(surfaceNorm);
        normalsForEachVertex[Qindex].push(surfaceNorm);
        normalsForEachVertex[Rindex].push(surfaceNorm);
    }
    // console.log("surfaceNorm: " + surfaceNorm);
   // // console.log("normalsForEachVertex: " +normalsForEachVertex);
    for(var i = 0; i < vertices.length / 3; i++){
        var v = averageVectors(normalsForEachVertex[i]);
        smoothNorms.push(v[0]);
        smoothNorms.push(v[1]);
        smoothNorms.push(v[2]);
    }
    // console.log("smoothNorms: " + smoothNorms);
    
}

function calcSmoothShading(){
    smoothShadingVertexColors = [];
    for(var i = 0; i < shaded_colors.length; i+=3){
        smoothShadingVertexColors.push(shaded_colors[i]);
        smoothShadingVertexColors.push(shaded_colors[i+1]);
        smoothShadingVertexColors.push(shaded_colors[i + 2]);
    }
}

function calcSpecularShading(specValue, expandedNormsToUse){
    var H; //halfway vector
    var L = light_direction;
    var Ks = specular_color;
    var V = [0, 0, 1];
    var N = [];
    specularShading = [];
    var specAngle = [];
    
    
    for(var i = 0; i < expandedNormsToUse.length; i+=3){
        var oneNormal = ([expandedNormsToUse[i], expandedNormsToUse[i+1], expandedNormsToUse[i+2]]);
        N.push(normalize(oneNormal));
    }
    
    var addedV = addVector(L, V);
    H = normalize(addedV);
   
    
    for(var i = 0; i < N.length; i++){
        specAngle.push(dotProduct(N[i], H));
    }
    
    for(var j = 0; j < specAngle.length; j++){
        specularShading.push(Ks[0] * Math.pow(specAngle[j], specValue));
        specularShading.push(Ks[1] * Math.pow(specAngle[j], specValue));
        specularShading.push(Ks[2] * Math.pow(specAngle[j], specValue));
    }
    // console.log("specValue: " + specValue);
    // console.log("H: " + H);
    // console.log("N: " + N);
    // console.log("specAngle: " + specAngle);
    // console.log("specularShading: " + specularShading);      
}

function calcSpecularShadingWithPointLight(specValue, expandedNormsToUse, lightDirections){
    var H = [];
    var L = lightDirections;
    var oneLightDirection = [];
    var Ks = specular_color;
    var V = [0, 0, 1];
    var N = [];
    specularShadingPoint = [];
    var  specAngle = [];
    
    for(var i = 0; i < expandedNormsToUse.length; i+=3){
        var oneNormal = ([expandedNormsToUse[i], expandedNormsToUse[i+1], expandedNormsToUse[i+2]]);
        N.push(normalize(oneNormal));
    }
    
    for(var i = 0; i < L.length; i+=3){
        oneLightDirection.push([L[i], L[i+1], L[i+2]]);
    }
    
    for(var i = 0; i < oneLightDirection.length; i++){
        var addedV = addVector(oneLightDirection[i], V);
        H.push(normalize(addedV));
    }


    for(var i = 0; i < N.length; i++){
        specAngle.push(dotProduct(N[i], H[i]));
    }
    
    for(var j = 0; j < specAngle.length; j++){
        specularShadingPoint.push(Ks[0] * Math.pow(specAngle[j], specValue));
        specularShadingPoint.push(Ks[1] * Math.pow(specAngle[j], specValue));
        specularShadingPoint.push(Ks[2] * Math.pow(specAngle[j], specValue));
    }
    // console.log("specValue: " + specValue);
    // console.log("H: " + H);
    // console.log("N: " + N);
    // console.log("specAngle: " + specAngle);
    // console.log("specularShading: " + specularShading);   
}

function appendAlphaToColors(colorsToUse, alpha){
    var appendedAlphaColors = [];
    
    for(var i = 0; i < colorsToUse.length; i+=3){
        appendedAlphaColors.push(colorsToUse[i]);
        appendedAlphaColors.push(colorsToUse[i+1]);
        appendedAlphaColors.push(colorsToUse[i+2]);
        appendedAlphaColors.push(alpha);
    }
    return appendedAlphaColors;
}


function do_draw_light_cube(){
//    var c = document.getElementById('webgl');
//    var ctx=c.getContext("2d");
//    ctx.fillStyle="#FF0000";
//    ctx.fillRect(0,500,50,50);
    
    var cubeVertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);
    
    for(var i = 0; i < cubeVertices.length; i+=3){
        cubeVertices[i] = cubeVertices[i] * 25;
        cubeVertices[i+1] = (cubeVertices[i+1] * 25) + 500;
        cubeVertices[i+2] = cubeVertices[i+2] * 25;
    }

  var cubeColors = new Float32Array([     // Colors
    1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  // v0-v1-v2-v3 front(white)
    1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  // v0-v3-v4-v5 right(white)
    1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  // v0-v5-v6-v1 up(white)
    1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  // v1-v6-v7-v2 left(white)
    1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  // v7-v4-v3-v2 down(white)
    1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha,  1.0, 1.0, 0.0, cubeAlpha   // v4-v7-v6-v5 back(white)
  ]);

  var cubeIndices = new Uint16Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);

    
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);
    
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
    return true;
    
}


function do_draw_light_bar(){
    
//    fill_light_bar_colors();
    
    var lightBarVertices = new Float32Array([
        5, 0, 0, 0, 5, 0, 495, 500, 500, 500, 495, 500
    ]);
    
    var triangleColors = new Float32Array([
        1, 0, 0, lightBarAlpha, 1, 0, 0, lightBarAlpha, 1, 0, 0, lightBarAlpha, 1, 0, 0, lightBarAlpha
    ]);
    
    var triangleIndices = new Uint16Array([
        0, 1 , 2, 0, 2, 3
    ]);
    
    
    //var lightBar = new Float32Array(lightBarVector);
    //// console.log("lightbar length: " + lightBar.length);
    //Create buffer object
    var lightBarBuffer = gl.createBuffer();
    if (!lightBarBuffer){
        // console.log('Failed to create the buffer object');
        return false;
    }
    
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, lightBarBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lightBarVertices, gl.STATIC_DRAW);
    
    //initialize a_Position for shader
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    
   // var newlightBarColors = appendAlphaToColors(lightBarColors, lightBarAlpha);
   // var lightBarColorArray = new Float32Array(newlightBarColors);
    
   // // console.log("lightbarcolors length: " + lightBarColorArray.length);
    
    // Create color buffer
    var lightBarColorBuffer = gl.createBuffer();
    // Bind the color buffer and assign data
    gl.bindBuffer(gl.ARRAY_BUFFER, lightBarColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleColors, gl.STATIC_DRAW);
    // Bind the buffer to a_Color

    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);

    // console.log("lightBar.length: " + lightBarVertices.length);
    gl.lineWidth(5);
    gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_SHORT, 0);//Draw lines
    return true; 
}


//buffers for drawing surface normals
function do_draw_surface_normals(anObjectIndex){
    
        
        //initIndexArray();
       // transformed_cylinder_vertices(); 
    
        var transformationMatrix = new Matrix4();
        transformationMatrix.setIdentity();
        vertices = [];
        
        
        transformationMatrix.multiply(translationMatrixList[anObjectIndex]);
    
        if(pickedObject == anObjectIndex){
            transformationMatrix.multiply(previewTranslationMatrix);
            transformationMatrix.multiply(previewTranslationOnZMatrix);
        }
    
        
        transformationMatrix.multiply(rotationMatrixList[anObjectIndex]);
    
        if(pickedObject == anObjectIndex){
            transformationMatrix.multiply(previewRotationMatrix);
        }
    
        transformationMatrix.multiply(scalingMatrixList[anObjectIndex]);
        if(pickedObject == anObjectIndex){
            transformationMatrix.multiply(previewScalingMatrix);
        }
    
        nonTransformedVertices = verticesList[anObjectIndex];
    
        //for each vertex, multiply by transformation x, y, z, 1, transformation by matrix4
    
    
        for(var i = 0; i < nonTransformedVertices.length; i +=3){
            var oneVector = new Vector4([nonTransformedVertices[i], nonTransformedVertices[i+1], nonTransformedVertices[i+2], 1]);
            oneVector = transformationMatrix.multiplyVector4(oneVector);
            vertices.push(oneVector.elements[0]);
            vertices.push(oneVector.elements[1]);
            vertices.push(oneVector.elements[2]);
        }
    
        indexes = (indexesList[anObjectIndex]);
    
        calc_surface_normals_phase1();
        calc_normal_line_vertices();
        fill_normal_vertex_colors();

        var normals_array = new Float32Array(normalVertices);

        //Create buffer object
        var normalBuffer = gl.createBuffer();
        if (!normalBuffer){
            // console.log('Failed to create the buffer object');
            return false;
        }

        //Bind buffer to target and write data into buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals_array, gl.STATIC_DRAW);

        //initialize a_Position for shader
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        var newNormalVerticesColor = appendAlphaToColors(normalVerticesColors, 1.0);
        var normalColorArray = new Float32Array(newNormalVerticesColor);
        
        // Create color buffer
        var colorBuffer = gl.createBuffer();
        // Bind the color buffer and assign data
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normalColorArray, gl.STATIC_DRAW);
        // Bind the buffer to a_Color

        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.drawArrays(gl.LINES , 0, normalVertices.length/3);//Draw lines
    
        return true;   
}



//create and bind buffers with xy_points
function do_draw_clicked_points(){
    if(right_clicked != true){
        
    rubberbandLinesColors();
        
    var n = index/2; //Number of coordinate pairs
    //// console.log("index saved: "+ index);
    
    //Create buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        // console.log('Failed to create the buffer object');
        return false;
    }
    
    //Bind buffer to target and write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xy_points, gl.STATIC_DRAW);
    
    //initialize a_Position for shader
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
       
    var newClickedLineColor = appendAlphaToColors(rubberBandColors, 1.0);
    var clickedLineColor = new Float32Array(newClickedLineColor);
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, clickedLineColor, gl.STATIC_DRAW);
        
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    
    gl.drawArrays(gl.LINE_STRIP, 0, index/2 + 1);//Draw lines
    }
    return true;    
}


//create and bind buffers to draw cylinders
function do_draw_objects(anObjectIndex, alpha){

        var colorsToUse;
        var expandedNormsToUse;
        var transformationMatrix = new Matrix4();
        transformationMatrix.setIdentity();
        vertices = [];        
        
        transformationMatrix.multiply(translationMatrixList[anObjectIndex]);
    
        if(pickedObject == anObjectIndex){
            transformationMatrix.multiply(previewTranslationMatrix);
            transformationMatrix.multiply(previewTranslationOnZMatrix);
        }
    
        
        transformationMatrix.multiply(rotationMatrixList[anObjectIndex]);
    
        if(pickedObject == anObjectIndex){
            transformationMatrix.multiply(previewRotationMatrix);
        }
    
        transformationMatrix.multiply(scalingMatrixList[anObjectIndex]);
        if(pickedObject == anObjectIndex){
            transformationMatrix.multiply(previewScalingMatrix);
        }
        
        var addSpec = [];
    
    
        indexes = (indexesList[anObjectIndex]);
        nonTransformedVertices = verticesList[anObjectIndex];
    
        //for each vertex, multiply by transformation x, y, z, 1, transformation by matrix4
    
    
        for(var i = 0; i < nonTransformedVertices.length; i +=3){
            var oneVector = new Vector4([nonTransformedVertices[i], nonTransformedVertices[i+1], nonTransformedVertices[i+2], 1]);
            oneVector = transformationMatrix.multiplyVector4(oneVector);
            vertices.push(oneVector.elements[0]);
            vertices.push(oneVector.elements[1]);
            vertices.push(oneVector.elements[2]);
        }
    
    
      //  initIndexArray();
    //  transformed_cylinder_vertices(); 
        calc_surface_normals_phase1();
        //do it for point_light if point light is pressed, do for light_direction if light bar is pressed
        normalize_light_direction(light_direction);
        allNormalsForEachVertex();
        extendedVertices();
        if(shouldUseSmoothShading){
            extendedSmoothNorms();
            expandedNormsToUse = extendedSmoothNormsArray;
            calc_colors(extendedSmoothNormsArray);
            calcSmoothShading();
            colorsToUse = smoothShadingVertexColors;
        }else{
            calc_colors(norm);
            extendedFlatNorms();
            expandedNormsToUse = extendedFlatNormsArray;
            calcFlatShading();
            colorsToUse = flatShadingVertexColors;
        }
    
        if(shouldUseSpecShading){
            calcSpecularShading(specValue, expandedNormsToUse);
            for(var i = 0; i < expandedNormsToUse.length; i++){
                addSpec.push(specularShading[i] + colorsToUse[i]);
            }
            // console.log("colorsToUse length: "+colorsToUse.length);
            // console.log("specularShading Length: " + specularShading.length);
            // console.log("expandedNormsToUse length: " + expandedNormsToUse.length);
            colorsToUse = addSpec;
        }  
        if(directionalLightOn == false){
            for(var i = 0; i < expandedNormsToUse.length; i+=3){
                colorsToUse[i] = 0;
                colorsToUse[i+1] = 0;
                colorsToUse[i+2] = 0;
            }
        }
    
    
      //  // console.log("final vertices: " + vertices);
        // console.log("final indexes: " + indexes);
        
        if(textMap){
            pointLightOn = false;
        }
        
        if(pointLightOn){
            if(shouldUseSmoothShading){
                calculatePointLightSmooth();
                for(var i = 0; i < expandedNormsToUse.length; i++){
                    colorsToUse[i] = (shaded_point_light[i] + colorsToUse[i]);
                }
                if(shouldUseSpecShading){
                    calcSpecularShadingWithPointLight(specValue, expandedNormsToUse, pointLightPerVertexSmooth);
                    for(var i = 0; i < expandedNormsToUse.length; i++){
                        colorsToUse[i] = (specularShadingPoint[i] + colorsToUse[i]);
                    }
                }
            }else{
                calculatePointLightFlat();
                for(var i = 0; i < expandedNormsToUse.length; i++){
                    colorsToUse[i] = (shaded_point_light[i] + colorsToUse[i]);
                }
                 if(shouldUseSpecShading){
                    calcSpecularShadingWithPointLight(specValue, expandedNormsToUse, pointLightPerVertexFlat);
                    for(var i = 0; i < expandedNormsToUse.length; i++){
                        colorsToUse[i] = (specularShadingPoint[i] + colorsToUse[i]);
                    }
                }
            }

            // console.log("colors I'm using shaded point light on: " + shaded_point_light);
            // console.log("expandedNormsToUse: " + expandedNormsToUse);
        }
        
        if(pickedObject != anObjectIndex){
            for(var i = 0; i < colorsToUse.length; i+=3){
                colorsToUse[i] = colorsToUse[i] + 0;
                colorsToUse[i+1] = colorsToUse[i+1] + 0;
                colorsToUse[i+2] = colorsToUse[i+2] + .2;
            }
        }else{
            for(var i = 0; i < colorsToUse.length; i+=3){
                colorsToUse[i] = colorsToUse[i] + .5;
                colorsToUse[i+1] = colorsToUse[i+1] + .5;
                colorsToUse[i+2] = colorsToUse[i+2] + .5;
            }
        }
    
        var newColorsToUse = appendAlphaToColors(colorsToUse, alpha); 
        
        
    
        
    
        // console.log("specularShading: " + specularShading);
        // console.log("addSpec: " + addSpec);
    
        // console.log('num vertices: ' + vertices.length/3);
        // console.log('final vertices: ' + vertices);
        // console.log('num norms: ' + norm.length/3);
        // console.log(' num shaded_colors: ' + shaded_colors.length/3);  
    
        // console.log("directionalLightOn: " + directionalLightOn);
        // console.log("pointLightOn: " + pointLightOn);

        var vertices_array = new Float32Array(extendedVerticesArray);

        //Create buffer object
        var vertexBuffer = gl.createBuffer();
        if (!vertexBuffer){
            // console.log('Failed to create the buffer object');
            return false;
        }

        //Bind buffer to target and write data into buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, vertices_array, gl.STATIC_DRAW);


        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        
        var shadedColorsArray = new Float32Array(newColorsToUse);
        var colorBuffer = gl.createBuffer();
    
        //NEW
        for(var j = 0; j < indexes.length/12; j++){
            for(var i = 0; i < 12; i++){
                textCoord.push(i/12); textCoord.push(j);
            }
        }
    
        console.log("textCoordArray: " + textCoord);
        console.log("textCoordArray length: " + textCoord.length);
    
         extendedTextureCoordinates();
         var verticesTextCoord = new Float32Array(extendedTexCoordArray);
        //create texture buffer object
        var vertexTexCoordBuffer = gl.createBuffer();
        if (!vertexTexCoordBuffer) {
            console.log('Failed to create the buffer object');
            return false;
        }
        
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, shadedColorsArray, gl.STATIC_DRAW);
    
        var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
        if (a_TexCoord < 0) {
            console.log('Failed to get the storage location of a_TexCoord');
            return false;
        }
        
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
    
    
        //NEW
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesTextCoord, gl.STATIC_DRAW);
    
        //NEW
        //if textMap is true, want to add texture to colors with spec and without diffuse
        if(textMap){
            // Assign the buffer object to a_TexCoord variable
            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object
        }
        
        gl.drawArrays(gl.TRIANGLES, 0, vertices_array.length / 3);
        return true;    
}







