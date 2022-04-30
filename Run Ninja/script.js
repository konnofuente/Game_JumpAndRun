const WORLD_WIDTH = 90
const WORLD_HEIGHT = 30
const SPEED_INCREASE=0.00001
const worldElem = document.getElementById("data-world")
const groundElems = document.querySelectorAll("[data-ground]")//ground element
const scoreElems=document.querySelector("[data-score]")
const playerElem=document.querySelector("[data-player]")
const Press_Start=document.querySelector("[ data-press_start]")
const logo=document.querySelector("[ data-logo]")


window.addEventListener("resize", setPixelToWorldScale)
setPixelToWorldScale()
startgame()

let lastTime
let speedgame
let score



function update(time) { // for every change to happen depending on computer frame 
    if (lastTime == null) { //here we make sure lastime becomes time before start
      lastTime = time
      window.requestAnimationFrame(update) //inorder to create a loop of function
      return
    }
    delta = time - lastTime

    // score info
    score += delta*0.01     
    scoreElems.textContent=Math.floor(score)

    updateGround(delta,speedgame)
    updatePlayer(delta,speedgame)
    updateObtacle(delta,speedgame)
    speedgame +=delta*SPEED_INCREASE

    if(checklose())return handlelose()
    //console.log(lastTime)
    lastTime = time
    window.requestAnimationFrame(update)

  }



function setPixelToWorldScale() {
    let worldToPixelScale
    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
      worldToPixelScale = window.innerWidth / WORLD_WIDTH
    } else {
      worldToPixelScale = window.innerHeight / WORLD_HEIGHT
    }
  
    worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
    worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
  }
  

/***************************************************************888
 * for start game
 */
function startgame(){
  document.addEventListener("keydown", (event)=> {
    if (event.keyCode === 32) { // key code of the keybord key
      lastTime=null;
      document.getElementById('audio').play()
      speedgame=0.8;
      score=0
      Press_Start.classList.add("hide")
      setCustomProperty(logo,"display","none")
      setupGround()
      setupPlayer()
      setupObtacle()
      window.requestAnimationFrame(update)
    }
  },{once:true});
}

function handlelose(){
  setPlayerLose()
  document.getElementById('audio').pause()
  Press_Start.classList.remove ("hide")
  Press_Start.textContent="GAME OVER"
  setTimeout(()=>{
    document.addEventListener("keydown",startgame(),{once:true})
  }, 1000)
}




/***
 * for ground
 */
const SPEED=0.05
function updateGround(delta,speedscale){ //this function permit use to verloop the ground
  
  groundElems.forEach(ground => { //foreach element of ground we increment the left variable
    incrementCustomProperty(ground, "--left", delta *speedscale * SPEED * -1) // we increment it by the delta

    if(getCustomProperty(ground,"--left")<= -100){ // if the ground property exceed 300 we increment it to 600
      incrementCustomProperty(ground,"--left",200)
    }
  })
  }

function setupGround(){   // this permit us to setup the different ground left property
  setCustomProperty(groundElems[0],"--left",0)
  setCustomProperty(groundElems[1],"--left",100)
}

function getCustomProperty(elem, prop) {
  return parseFloat(getComputedStyle(elem).getPropertyValue(prop)) || 0 //this function will get all css property of the element
  //and  with getpropertyvalue we shall have a specific css attribute 
  //then with parseFloat we convert it to mathematics
}

function setCustomProperty(elem, prop, value) {
  elem.style.setProperty(prop, value)
}

function incrementCustomProperty(elem, prop, init) {
  setCustomProperty(elem, prop, getCustomProperty(elem, prop) + init)
}



/*******************************************
 * player
 */

const JUMP_SPEED= .45
const GRAVITY =.0015
const PLAYER_FRAME_COUNT = 5 
const FRAME_TIME =100


let isJumping
let playerFrame
let currentFrameTime
let yVelocity


function setPlayerLose(){

    playerElem.src = `imgs/3fall.png`

}

function setupPlayer(){
  isJumping=false
  playerFrame=0
  yVelocity=0
  setCustomProperty(playerElem,"--bottom",0)
currentFrameTime=0
document.removeEventListener("keydown",onJump)
document.addEventListener("keydown",onJump)

}


function updatePlayer(delta,speedgame){
  Run(delta,speedgame)
  Jump(delta)
}

function Run(delta,speedgame){
  if(isJumping){
    playerElem.src=`imgs/1jump.png`
    return
  }

  if(currentFrameTime >= FRAME_TIME){ //will be incremented every time we go throught the loop
    playerFrame=(playerFrame +1) % PLAYER_FRAME_COUNT
    playerElem.src = `imgs/${playerFrame}run.png`
    currentFrameTime -=FRAME_TIME
  }

  currentFrameTime +=delta*speedgame

}

function Jump(delta){
    if(!isJumping)return

    incrementCustomProperty(playerElem,"--bottom",yVelocity*delta)

    if(getCustomProperty(playerElem,"--bottom" ) <= 0){
      setCustomProperty(playerElem,"--bottom",0)
      isJumping=false
    }

    yVelocity -= GRAVITY * delta
}

function onJump(e){
  if(e.keyCode !== 32 || isJumping) return
  document.getElementById('audio_up').play()
  yVelocity=JUMP_SPEED
  isJumping=true
}



/*******************************************
 * obstacle
 */
const OBSTACLE_INTERVAL_MIN=500
const OBSTACLE_INTERVAL_MAX=2000 //min and max interval of each obstacle
const OBSTACLE_FRAME_COUNT=3

let nextobstacleTime
let obstacleFrame
function setupObtacle(){
  obstacleFrame=0
  nextobstacleTime=OBSTACLE_INTERVAL_MIN
}


function updateObtacle(delta,speedgame){
  document.querySelectorAll("[data-obstacle]").forEach(obstacle =>{
    incrementCustomProperty(obstacle,"--left",  delta*speedgame*SPEED * -1)

    if(getCustomProperty(obstacle,"--left")<= -100){
      obstacle.remove()

    }
  })

  if(nextobstacleTime <=0){
    createObstacle()
    nextobstacleTime=randomNumberBetween(OBSTACLE_INTERVAL_MIN,OBSTACLE_INTERVAL_MAX)/speedgame
  }
  nextobstacleTime-=delta// after the time reduce to zero which we create a new obstacle
}

function createObstacle(){

  obstacleFrame=(Math.floor(2*Math.random())+1) % 3 + 1;
  const obstacle = document.createElement("img")
  obstacle.dataset.obstacle=true //name it data-obstacle
  obstacle.src=`imgs/${obstacleFrame}obsta.png`
  obstacle.classList.add("obstacle")
  setCustomProperty(obstacle,"--left",80)
  setCustomProperty(obstacle,"width","5%")
  setCustomProperty(obstacle,"height","30%")
  setCustomProperty(obstacle,"margin","0")
  setCustomProperty(obstacle,"padding","0")
  setCustomProperty(obstacle,"postion","absolute")
  setCustomProperty(obstacle,"bottom","0")
  setCustomProperty(obstacle,"border","solid 2px")
  worldElem.append(obstacle)
}

function randomNumberBetween(min,max){
  return Math.floor(Math.random()*(max-min +1)+min)
  //we add min at end to be sure that e number should be in the min interval
}



/*************************************888
 * 
 * positioning
 */

function getPlayerReacts(){
  return playerElem.getBoundingClientRect()
}

function getObstacleReacts(){
  return[...document.querySelectorAll("[data-obstacle]")].map(obstacle=>{
    return obstacle.getBoundingClientRect() //return the position of an obstacle
  })
}


function checklose(){
  const playerReact=getPlayerReacts()
  return getObstacleReacts().some(react => isCollision(react,playerReact))
}


function isCollision(react1,react2){
return(react1.left < react2.right&&
      react1.top < react2.bottom && 
      react1.right > react2.left&&
      react1.bottom > react2.top
      ) 
}
