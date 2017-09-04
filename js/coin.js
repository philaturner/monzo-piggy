function Coin (x,y,w,h,cat){
  //set physics properties
  this.options = {
    restitution: 0.6,
    friction: 0.1
  }
  //create circle body
  this.body = Bodies.circle(x,y,w, this.options);
  this.w = w;
  this.h = h;
  //add to world
  World.add(engine.world, this.body);
  //colour base on monzo category colours
  this.col = monzo_cat_colours[cat];
  if (this.col == undefined) this.col = '#000'; //if col if undefined make black

  //render the object
  this.render = function(){
    //get position and angle
    let pos = this.body.position;
    let angle = this.body.angle;

    //translate to object and draw as appropiate
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    stroke(255);
    strokeWeight(1);
    fill(this.col);
    ellipse(0,0,this.w*2);
    pop();
  }

}
