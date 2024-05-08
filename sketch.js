import { subscribeToResults, w, h } from "./detection.js";

let objects;
let faces;
let toothbrushConfidence = 0;
subscribeToResults((results) => {
  // console.log(results)
  // results contains object and face detections. You can tell which type of detection the current result is based on the lenght of the keypoints array (only the faces have keypoints)
  if (results.detections[0].keypoints.length == 6) {
    faces = results;
    //console.log("faces", faces)
  } else {
    objects = results;

    //console.log("objects", objects)
  }
});

// Added let code:
let progress = 0;
let moving = false;
const totalWidth = 400; // Total width of the progress bar
const barHeight = 20;   // Height of the progress bar
const speed = 0.0003;   // Speed of the progress bar movement
// const speed = 0.002;   // Speed of the progress bar movement


// Treat everything inside of 'sketch' as a regular p5.js sketch. put p. in front of anything that is a built-in p5.js function
let sketch = function (p) {
  p.setup = function () {
    p.createCanvas(w, h);
    p.colorMode(p.HSB);
    
    
    // // Create reset button
    // let resetButton = p.createButton('Restart Brushing');
    // resetButton.position(p.width / 2 - 60, p.height + barHeight);
    // resetButton.mousePressed(resetProgress);
  };


  p.draw = function () {
    p.clear();
    // if we detect both a face AND a toothbrush, do all the important stuff
    if (faces && objects && objects.detections[0].categories[0].score != toothbrushConfidence) {
      console.log("????")
      //console.log(faces, objects)
      const face = faces.detections[0];
      const mouth = p.createVector(
        p.width - face.keypoints[3].x * p.width,
        face.keypoints[3].y * p.height
      );

      const toothbrush = objects.detections[0];
      console.log(toothbrushConfidence)
      const boundingBox = toothbrush.boundingBox;
      const toothBrushCenter = p.createVector(
        p.width - boundingBox.originX - boundingBox.width / 2,
        boundingBox.originY + boundingBox.height / 2
      );

      const distance = p5.Vector.dist(mouth, toothBrushCenter);
      // console.log(distance);
      const midPoint = p5.Vector.lerp(mouth, toothBrushCenter, 0.5);
      // Distance Counter:
      // p.stroke(240, 100, 100);
      // p.strokeWeight(2);
      // p.line(mouth.x, mouth.y, toothBrushCenter.x, toothBrushCenter.y)
      // p.noStroke();
      // p.text(distance, midPoint.x, midPoint.y)


      // this is where we:
      // 1. calculate the distance between a toothbrush and a mouth
      // 2. if the distance is less than a certain amount, then the user is brushing their teeth (note, the distance threshold should scale with the size of the face's bounding box height)
      // 3.

      // add draw loop stuff here

      // Check if distance is less than 100 (in pixels)
      if (distance < 150) {
        moving = true; // Start moving the progress bar
      } else {
        moving = false; // Stop moving the progress bar
      }



      if (faces) {
        drawFaces();
      }

      if (objects) {
        drawToothbrushBox();
      }
      toothbrushConfidence = objects.detections[0].categories[0].score;
    } else {
      moving = false;
    }


    drawProgress()



    // console.log("faces, ", faces);
    // console.log("objects, ", objects);
  };

  // Function to reset progress
  function resetProgress() {
    progress = 0;
    // ADDED
    moving = false; // Ensure movement stops when resetting
  }

  // Click to reset
  p.mousePressed = function() {
    // Check if the click was inside the reset area
    if (p.mousePressed) {
      resetProgress();
    }
  }

  function resetProgress() {
    progress = 0;
    resetClicked = true;
  }

  function drawProgress() {
    if (moving) {
      progress += speed;
      progress = p.constrain(progress, 0, 1);
    }
    // Text bpx:
    // p.fill(200);
    // p.rectMode(p.CORNER);
    // p.rect(p.width/2 - 200, 500, 400, 50);
    p.fill(200, 204);
    p.rectMode(p.CORNER);
    p.push()
    p.rectMode(p.CENTER)
    let rectX = p.width / 2;
    let rectY = p.height/1.2;
    let rectWidth = p.width/4;
    let rectHeight = 50;
    let cornerRadius = 20; // Adjust the value to change corner roundness
    p.rect(rectX, rectY, rectWidth, rectHeight, cornerRadius);
    p.pop()

    // Text prompts:

    let messages = [
      { progressRange: [0.01, 0.1], message: "good start!" },
      { progressRange: [0.1, 0.2], message: "keep going!" },
      { progressRange: [0.2, 0.3], message: "Brush like your dentist is watching!" },
      { progressRange: [0.3, 0.4], message: "Keep Going!" },
      { progressRange: [0.4, 0.5], message: "Keep brushing, unless you want plaque!" },
      { progressRange: [0.5, 0.6], message: "You're only halfway there!" },
      { progressRange: [0.6, 0.7], message: "Keep brushing, or your dentist will get lonely!" },
      { progressRange: [0.7, 0.8], message: "Don't forget to floss after this!" },
      { progressRange: [0.8, 0.9], message: "Almost there!" },
      { progressRange: [0.9, 0.99], message: "Final stretch!" },
      { progressRange: [0.99, 1.01], message: "Great job brushing! Come back soon!" }
      // Not showing at 1
    ];

    p.textSize(24);
    p.fill(255, 0, 0, p.frameCount + 255 - p.frameCount);

    for (let i = 0; i < messages.length; i++) {
      let { progressRange, message } = messages[i];
      let [start, end] = progressRange;

      if (progress > start && progress < end) {
        p.text(message, p.width / 2, 900);
        break; // Exit loop once the message is displayed
      }
    }

    // Calculate the position to center the progress bar
    let barX = p.width / 2 - totalWidth / 2;
    let barY = p.height / 2 - barHeight / 2 + 250;

    // Draw progress bar background
    p.fill(200);
    p.rectMode(p.CORNER);
    p.rect(barX, barY, totalWidth, barHeight);

    // Draw progress bar
    p.fill(100, 240, 70);
    p.rect(barX, barY, totalWidth * progress, barHeight);

    // Display percentage counter
    let percent = progress * 100;
    p.fill(0);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(16);
    p.text(percent.toFixed(1) + '%', p.width / 2, p.height / 2 + 250);
    
  }

  function drawFaces() {
    const face = faces.detections[0];
    const mouth = p.createVector(
      p.width - face.keypoints[3].x * p.width,
      face.keypoints[3].y * p.height
    );
    p.fill(255, 0, 0);
    p.ellipse(mouth.x, mouth.y, 20, 20);
  }

  function drawToothbrushBox() {
    const toothbrush = objects.detections[0];

    // draw bounding box
    const boundingBox = toothbrush.boundingBox;
    const boundingBoxOrigin = p.createVector(
      p.width - boundingBox.originX - boundingBox.width,
      boundingBox.originY
    );
    const toothBrushCenter = p.createVector(
      p.width - boundingBox.originX - boundingBox.width / 2,
      boundingBox.originY + boundingBox.height / 2
    );
    p.stroke(30, 100, 100);
    p.strokeWeight(4);
    p.noFill();
    p.rect(
      boundingBoxOrigin.x,
      boundingBoxOrigin.y,
      boundingBox.width,
      boundingBox.height
    );
    p.strokeWeight(20);
    p.stroke(30, 100, 100);
    p.point(toothBrushCenter.x, toothBrushCenter.y);

    // draw category name
    const categoryName = toothbrush.categories[0].categoryName;
    const score = toothbrush.categories[0].score;
    p.noStroke();
    p.fill(0, 0, 100);
    p.textSize(30);
    p.text(
      `${categoryName}, ${Math.round(parseFloat(score) * 100)}%`,
      p.width - boundingBox.originX - boundingBox.width,
      boundingBox.originY
    );
  }
};

let myp5 = new p5(sketch);
