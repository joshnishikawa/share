////////////////////////////////////////////////////////////////////////////////
// progress.js — Radial progress bar (CSS pie chart) and difficulty indicator.
//
// DUPLICATION: progressToPercent, progressPie, and progressPie.slammer are
//   ALSO defined in study_utilities.js (with slightly different signatures).
//   This file appears to be the standalone version loaded on non-study pages.
//   study_utilities.js's progressToPercent has a `base` parameter; this does not.
//   Having both creates a risk of them diverging.
//
// BUG: progressPie uses document.querySelector at parse time — if this script
//   loads before the DOM has .left-half / .right-half elements, both will be
//   null and progressPie.progress() will throw.
//   (Same issue noted in study_utilities.js.)
////////////////////////////////////////////////////////////////////////////////

// RADIAL PROGRESS BAR /////////////////////////////////////////////////////////
// Sum up progress array values, calculate percent of goal, update the pie.
// NOTE: Also calls progressPie.progress() as a side effect — not a pure function.
progressToPercent = (prog, goal) => {
  prog = prog.reduce((a,b)=>a+b,0);
  let percent = Math.round( prog / goal * 100 );
  progressPie.progress(percent);
  return percent;
}

// CSS pie chart object — manipulates two half-circle DOM elements.
progressPie = {
  leftHalf: null,
  rightHalf: null,
};

progressPie.progress = function (percent) {
  if (!this.leftHalf) this.leftHalf = document.querySelector(".left-half");
  if (!this.rightHalf) this.rightHalf = document.querySelector(".right-half");
  if (!this.leftHalf || !this.rightHalf) return;
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

// Return a Material Icons exclamation mark colored by difficulty level.
// difficulty >= 2 = red (danger), 1 = yellow (warning), 0 = empty string.
// NOTE: The two non-empty branches differ ONLY by text-danger vs text-warning —
//   could use a lookup or ternary instead of duplicating the full HTML.
progressPie.slammer = function (difficulty){
  const color = difficulty >= 2 ? 'text-danger' : difficulty == 1 ? 'text-warning' : null;
  if (!color) return '';
  return `<span class="${color} material-icons" 
                style="font-size: 3.5em; line-height: 1em;
                text-shadow: 1px 1px 1px gray !important;">
            priority_high
          </span>`;
}
