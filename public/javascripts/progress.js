// RADIAL PROGRESS BAR /////////////////////////////////////////////////////////
progressToPercent = (prog, goal) => {
  prog = prog.reduce((a,b)=>a+b,0);
  let percent = Math.round( prog / goal * 100 );
  progressPie.progress(percent);
  return percent;
}

progressPie = {
  leftHalf: document.querySelector(".left-half"),
  rightHalf: document.querySelector(".right-half"),
};

progressPie.progress = function (percent) {
  percent = Math.min(Math.max(0, percent), 100);
  if (percent <= 50) {
      this.leftHalf.style.visibility = "hidden";
      this.leftHalf.style.transform = "rotate(180deg)";
      this.rightHalf.style.transform = "rotate(" + (percent*3.6) + "deg)";
  } 
  else {
      this.leftHalf.style.visibility = "visible";
      this.leftHalf.style.transform = "rotate(" + (percent*3.6) + "deg)";
      this.rightHalf.style.transform = "rotate(180deg)";
  }
}

progressPie.slammer = function (difficulty){
  var slammer;
  if (difficulty >= 2){
    slammer =`<span class="text-danger material-icons" 
                    style="font-size: 3.5em; line-height: 1em;
                    text-shadow: 1px 1px 1px gray !important;">
                priority_high
              </span>`;
  }
  else if (difficulty == 1){
    slammer =`<span class="text-warning material-icons" 
                    style="font-size: 3.5em; line-height: 1em;
                    text-shadow: 1px 1px 1px gray !important;">
                priority_high
              </span>`;
  }
  else{ 
    slammer = ''; 
  }
  return slammer;
}
