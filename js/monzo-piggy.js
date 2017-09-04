var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Composite = Matter.Composite;

var engine, data, intervalTimer, img, changeLabel, animationType, dateLabel;
var dateText = '01/01/2007';
var totChange = 0;
var coins = [];
var changes = [];
var pigWalls = [];
var ground, leftWall, centreWall;
var counter = 0;

var WIDTH = 900;
var HEIGHT = 600;
var INTA = 100;
var drawing = false;
var debug = false;

var monzo_cat_colours = {
  'bills': '#50B8DD',
  'cash': '#9ABBAA',
  'eating_out': '#E64B5F',
  'entertainment': '#EB824B',
  'groceries': '#F5B946',
  'holidays': '#B882FC',
  'shopping': '#F09696',
  'transport': '#1C7890',
  'general': '#9a9a9a',
  'expenses': '#E1B981',
  'gold': '#EBD278'
};

//x,y of pig walls [x1,y1],[x2,y2]
var piggyLines = {
  0: [[512,414],[510,511]],
  1: [[510,503],[563,507]],
  2: [[563,507],[602,541]],
  3: [[600,547],[603,589]],
  4: [[600,588],[647,588]],
  5: [[643,592],[647,563]],
  6: [[646,561],[729,563]],
  7: [[729,559],[730,597]],
  8: [[732,592],[779,591]],
  9: [[778,593],[780,544]],
  10: [[776,552],[827,507]],
  11: [[826,515],[852,426]]
}

function preload(){
  //load image first
  img = loadImage('assets/piggy.png');
}

function setup() {
  let cnv = createCanvas(WIDTH, HEIGHT);
  cnv.parent('#animation');
  resetVariables();

  //event listener for visualise button
  document.getElementById('btnsubmit').addEventListener('click', function() {
    console.log('Button Click');
    //get account details and call API
    let atoken = select('#atoken');
    let uacc = select('#uacc');
    user.access_token = atoken.value();
    user.acc_id = uacc.value();
    user.getData();
  });
}

function startEngineAndSetup(){

  //define and start physics engine
  engine = Engine.create();
  Engine.run(engine);
  //loop through pig object and build walls
  for (var i = 0; i < Object.keys(piggyLines).length; i++){
    //get angle between two points in radians - (p2.y - p1.y, p2.x - p1.x);
    let angleRadians = Math.atan2(piggyLines[i][1][1] - piggyLines[i][0][1], piggyLines[i][1][0] - piggyLines[i][0][0]);
    //calculate length of rectangle
    let pHeight = dist(piggyLines[i][0][0],piggyLines[i][0][1],piggyLines[i][1][0],piggyLines[i][1][1]);
    //calculate center x and y as matter.js draw from centre
    let cX = (piggyLines[i][0][0] + piggyLines[i][1][0])/2;
    let cY = (piggyLines[i][0][1] + piggyLines[i][1][1])/2;
    //create wall base don above
    let pigWall = Bodies.rectangle(cX,cY,20,pHeight,{ isStatic: true });
    //rotate to angle with offset
    Matter.Body.rotate(pigWall, angleRadians + 1.57);
    //push wall to pigs array
    pigWalls.push(pigWall);
    //add to world
    World.add(engine.world, pigWall);
  }

  //define various physics boddies and add to world
  ground = Bodies.rectangle(WIDTH/2,height+225,width, WIDTH/2, { isStatic: true });
  leftWall = Bodies.rectangle(0,HEIGHT/2,10, height, { isStatic: true });
  centreWall = Bodies.rectangle(width/2,HEIGHT/2+100,10, height/100*80, { isStatic: true });
  World.add(engine.world, [ground, leftWall, centreWall]);
}

function draw() {
  //only draw if true
  background(51);
  if (drawing){
    image(img, width/2+50, height-400, 400, 400);
    fill(155);
    textAlign('center')
    textSize(42);
    textLabel = text('£' + floor(totChange),690,275);
  
    //draw vertices of pig walls (used for debug)
    if (debug == true){
      for (var i = 0; i < pigWalls.length; i++){
        for (var j = 0; j < pigWalls[i].vertices.length; j++){
            stroke(255);
            let next = j + 1
            if (next == 4){
              next = 0;
            } 
            line(pigWalls[i].vertices[j].x,pigWalls[i].vertices[j].y,pigWalls[i].vertices[next].x,pigWalls[i].vertices[next].y)
            noStroke();
        }
      }
    }
  
    //draw line around centre wall vertices
    for (var j = 0; j < centreWall.vertices.length; j++){
      stroke(255);
      let next = j + 1
      if (next == 4) next = 0;
      line(centreWall.vertices[j].x,centreWall.vertices[j].y,centreWall.vertices[next].x,centreWall.vertices[next].y)
      noStroke();
    }
  
    //draw all coints in canvas
    for (i = 0; i < coins.length; i++){
      coins[i].render();
    }
    //draw all change coins in canvas
    for (i = 0; i < changes.length; i++){
      changes[i].render();
    }
    
    //add various text elements to canvas
    fill(255);
    text('Monzo - Save the Change',width/2,50);
    textSize(28);
    fill(155);
    text('Transactions',width/4,100);
    text('Change',width/4*3,100);

    //add text based on animation type
    textSize(18);
    if (animationType == 'api'){
      text('Using API Data',width/2,75);
    } else{
      fill(255,0,0);
      text('Using Sample Data',width/2,75);
    }
    //draw dateLabel
    fill(190);
    dateLabel = text(dateText,width/4*3,125);
  }
}

//after getting data create coin every x seconds
function gotData(data){
  console.log('Got Data')
  console.log(data);
  intervalTimer = setInterval(function(){ createCoin(data); }, INTA);
}

function createCoin(data){
  let totalTrans = data.transactions.length;
  //create random x coordinate to drop ball from
  let rX = floor(random(25,width/2-50));
  //get date of transaction and draw
  let rawDate = new Date(data.transactions[counter].created);
  let transDate = rawDate.toDateString();
  dateText = transDate;
  //calculate size of circla based on transaction value and amount of transactions
  let rSize = (data.transactions[counter].amount * -1) / (map(totalTrans,0,totalTrans,0,150));
  //if a valid transaction to get change from then do
  if (data.transactions[counter].include_in_spending && data.transactions[counter].merchant != null){
    let cat = data.transactions[counter].category;
    //create new coin and add to world
    coins.push(new Coin(rX,100,rSize,rSize,cat));
    //create change coing based pass transaction amount
    createChange((data.transactions[counter].amount * -1));
  }
  counter++;
  //if ran through all transactions end coin gen
  if (counter == data.transactions.length){
    clearInterval(intervalTimer);
    console.log('Finished');
  }
}

function createChange(amount){
  //calculation to find change amount
  let act = amount / 100;
  let upper = Math.ceil(act);
  let change = upper - act
  //increment total change value
  totChange += change;
  //set x of coin drop
  let rX = floor(width/4*3+10);
  //create new coin and push to change array
  changes.push(new Coin(rX,275,change*12,change*12,'gold'));
}

function resetVariables(){
  var totChange = 0;
  var coins = [];
  var changes = [];
  var pigWalls = [];
  var counter = 0;
}
