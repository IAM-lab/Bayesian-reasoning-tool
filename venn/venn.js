/*
 * NAME: 			venn.js
 * AUTHOR:			Alan Davies
 * DATE:			01/12/2015
 * INSTITUTION:		Interaction Analysis and Modelling Lab (IAM), University of Manchester
 * DESCRIPTION:		Main object for creation and manipulation of venn diagram objects. 
 */ 
 function createVenn(circleArgs)
 {
	 venn = new Object();
	 
	 // member vars 
	 venn.initialCircleDistance = 0;
	 venn.circleDistance = 0;
	 venn.yellowCircleCanvas = null;
	 venn.redCircleCanvas = null;
	 venn.updateSecondFrequency = false; 
	 venn.outerNumberText = " Women took a mammography test";
	 venn.innerNumberText = " Do not have cancer";
	 venn.gridCellSize = 0;
	 venn.gridVals = null;
	  
	 // initialize function
	 venn.initialize = function()
	 {
		 var vennWindow = document.getElementById("vennBackground");
		 var vennWidgets = document.getElementById("widgetContainer");
		 var vennOuterNumber = document.getElementById("outerNumber");
		 var slider = document.getElementById("circleDist");
		 
		 // position the venn area in horizontal centre 
		 windowWidth = window.innerWidth;
		 vennWindow.style.left = ((windowWidth / 2) - (vennWindow.offsetWidth / 2));
		 vennWidgets.style.width = vennWindow.offsetWidth;
		 
		 vennWidgets.style.top = vennWindow.offsetTop + vennWindow.offsetHeight + 5; 
		 vennWidgets.style.left = vennWindow.offsetLeft;
		 
		 // position the outer number container
		 vennOuterNumber.style.left = vennWindow.offsetLeft;
		 vennOuterNumber.style.top = vennWindow.offsetTop - vennOuterNumber.offsetHeight;
		 vennOuterNumber.innerHTML += this.outerNumberText;
		 
		 // position the venn buttons pane
		 vennButtons = document.getElementById("vennButtons");
		 vennButton1 = document.getElementById("interVenn");
		 vennButton2 = document.getElementById("treeView");
		 vennButton3 = document.getElementById("originVenn");
		 vennButton4 = document.getElementById("gridVenn");
		 vennButtons.style.width = vennButton1.offsetWidth + vennButton2.offsetWidth + vennButton3.offsetWidth + vennButton4.offsetWidth;
		 vennButtons.style.height = vennButton1.offsetHeight + 5;
		 vennButtons.style.left = (vennWindow.offsetLeft + vennWindow.offsetWidth) - vennButtons.offsetWidth;
		 
		 // disable slider
		 slider.disabled = true;
		
		 // add legend
		 this.addLegend("dynamic");
		
		 // hide the center button
		 this.showHideCenter("hide");
	 }
	 
	 // show the popup for changing the population value 
	 venn.showEditOuterPopup = function()
	 {
		$('#editOuterNumModal').modal('show');
	 }
	 
	 // apply changes to the inner number 
	 venn.editOuterNumber = function()
	 {
		// get outer and inner number references 
		var outerNumber = document.getElementById("outerNumber");
		var innerNumber = document.getElementById("innerNumber");
		var yellowArea = document.getElementById("yellowAreaOutput");
		
		// get the new value, hide popup and set outer number value  
		newValue = $("#editBox").val();
		$("#editOuterNumModal").modal("hide");
		outerNumber.innerHTML = newValue + this.outerNumberText;
		
		// set the new inner number value 
		innerNumber.innerHTML = newValue - (parseFloat(yellowArea.innerHTML) * 100);
	 }
	 
	 // set the default position of the two circles
	 venn.setInitialCircleDistance = function()
	 {
		var vennWindow = document.getElementById("vennBackground");
		var yellowCircle = document.getElementById(circleArgs.circles["yellow"].canvasId);
		var redCircle = document.getElementById(circleArgs.circles["red"].canvasId);
		var distanceText = document.getElementById("circle_dist_text");
		
		// position yellow circle to left of center screen area
		yellowCircle.style.left = (vennWindow.offsetWidth / 2) - yellowCircle.offsetWidth;
		
		// calculate the distance 
		this.initialCircleDistance = (circleArgs.circles["red"].width / 2) + (circleArgs.circles["yellow"].width / 2);
		
		// set red circle to distance and update text area
		redCircle.style.left = yellowCircle.offsetLeft + (yellowCircle.offsetWidth / 2) + this.initialCircleDistance - (redCircle.offsetWidth / 2);
		this.circleDistance = this.initialCircleDistance;
		distanceText.value = this.circleDistance;
	 }
	 
	 // alter the circle distance
	 venn.updateCircleDistance = function()
	 {
		// get inputed distance and slider
		var distance = parseFloat(document.getElementById("circle_dist_text").value);
		
		// get radius
		var radiusYellow = circleArgs.circles["yellow"].radius;
		var radiusRed = circleArgs.circles["red"].radius;
	 
		// get canvas left 
		var leftRed = circleArgs.circles["red"].left;
		//leftYellow = circleArgs.circles["yellow"].left;
	 
		var leftYellow = document.getElementById("yellowCircle").offsetLeft;
		var maxLimit = radiusYellow + radiusRed;
	 
		// do not update if too large a value 
		if(distance > maxLimit) 
		{
			// set to default value and show error popup 
			document.getElementById("circle_dist_text").value = this.initialCircleDistance;
			$('#inputErrorModal').modal('show');
			return;
		}
		
		// get canvases 
		var redCircle = document.getElementById(circleArgs.circles["red"].canvasId);
		var yellowCircle = document.getElementById(circleArgs.circles["yellow"].canvasId);
		
		// set new left position 
		var newLeft = (yellowCircle.offsetLeft + (yellowCircle.offsetWidth / 2)) + (distance - (redCircle.offsetWidth / 2));
		console.log("newleft = ", newLeft, " leftYellow = ", leftYellow, " logic = if(newLeft < leftYellow)");
		
		
		// calculate and display minimum distance 
		var minLimit = (leftYellow + radiusRed) - (leftYellow + radiusYellow);		
		
		if(newLeft < leftYellow)
		{
			// calculate and display minimum distance 		
			document.getElementById("circle_dist_text").value = minLimit;
			$('#inputErrorModal').modal('show');
			return;
		}
		
		// set the new left position 
		redCircle.style.left = newLeft;
		
		// set the new distance
		this.circleDistance = distance;
		
		// calculate the actual overlap 
		this.calculateGeometricOverlap();	
	 }
	 
	 // calculate the actual overlap 
	 venn.calculateGeometricOverlap = function()
	 {
		// calculate overlap
		var redCircle = circleArgs.circles["red"];
		var yellowCircle = circleArgs.circles["yellow"];
		var redRadius = redCircle.width / 2;
		var yellowRadius = yellowCircle.width / 2;
		var circleDistance = this.circleDistance;
		var overlapOutput2 = document.getElementById("overlapOutput2");
				
		//var overalpBox = document.getElementById("overlap_text");
		var block1 = (Math.pow(yellowRadius, 2) * Math.acos((Math.pow(circleDistance, 2) + 
				 (Math.pow(yellowRadius, 2) - (Math.pow(redRadius, 2)))) / (2 * circleDistance * yellowRadius))); 
					
		var block2 = (Math.pow(redRadius, 2) * Math.acos((Math.pow(circleDistance, 2) + 
				 (Math.pow(redRadius, 2) - (Math.pow(yellowRadius, 2)))) / (2 * circleDistance * redRadius)));
					
		var block3 = (0.5 * (Math.sqrt((-circleDistance + yellowRadius + redRadius) * (circleDistance + yellowRadius - redRadius) *
				 (circleDistance - yellowRadius + redRadius) * (circleDistance + yellowRadius + redRadius))));
						
		var overlapArea = block1 + block2 - block3;
		overlapOutput2.innerHTML = Math.ceil(overlapArea);
	 }
	 
	 // set sliders to initial values
	 venn.setSliders = function()
	 {
		var redArea = document.getElementById("red");
		var yellowArea = document.getElementById("yellow");
		var redTextArea = document.getElementById("red_text");
		var yellowTextArea = document.getElementById("yellow_text");
		
		redArea.value = circleArgs.circles["red"].area;
		yellowArea.value = circleArgs.circles["yellow"].area;
		redTextArea.value = redArea.value;
		yellowTextArea.value = yellowArea.value;
	 }
	 
	 // move circles
	 venn.moveCircle = function(id, circle_id)
	 { 
		var circleSlider = document.getElementById(id);
		with(circleArgs.circles[circle_id])
		{
			var currentCircleCanvas = document.getElementById(canvasId);
			
			// recalculate distance from edge
			distanceFromEdge = left + circleCenter;
			
			// recalculate dist between both circles
			this.calculateCircleCenterDistance();
			
			// update canvas positions
			this.updateCircleCanvasPositions();
		}
	 }
	 
	 // update the relavent item(s) based on slider changed
	 venn.updateVenn = function(id, circle_id)
	 { 
		if(id.search("_") != -1)
		{
			id = id.substr(0, id.indexOf('_'));
		}
	 
		switch(id)
		{
			case "yellowAreaOutput":
			{
				var probOutput1 = document.getElementById("probOutput1");
				var probInput1 = document.getElementById("probInput1");
				
				probOutput1.innerHTML = 100 - probInput1.value;
				this.adjustCircleArea(id, circle_id);
				this.adjustProbabilityInputs(id);
				
				break;
			}
			case "yellow": 
			case "red": 
			case "red_text":
			{
				this.adjustCircleArea(id, circle_id);
				this.adjustProbabilityInputs(id);
				break;
			}
			case "overlap": break;
			case "yellowhorizontal": 
			case "redhorizontal": 
			{
				var circleToMove = circle_id.substr(0, circle_id.indexOf('h'));
				this.moveCircle(id, circleToMove);
				break;
			}
			case "prior":
			{
				break;
			}
			case "notPrior":
			{
				// calculate red area 
				var box1 = document.getElementById("yellowAreaOutput");
				var box2 = document.getElementById("prior");
				var box3 = document.getElementById("notPrior");
				var probOutput1 = document.getElementById("probOutput1");
				var areaOutput = document.getElementById("redAreaOutput");
				var posterior = document.getElementById("posterior");
				var overlapOutput = document.getElementById("overlapOutput");
				var overlapOutputPx = document.getElementById("overlapOutputPx");
				
				areaOutput.innerHTML = ((parseFloat(box1.innerHTML) * box2.value) + (parseFloat(probOutput1.innerHTML) * box3.value)) / 100;				
				this.adjustCircleArea("redAreaOutput", "redAreaOutput"); //circle_id); //TODO: Tidy up
				
				var prior = box2.value / 100;
				var frequency = parseFloat(box1.innerHTML) / 100;
				var nonPrior = box3.value / 100;
				var nonFrequency = parseFloat(probOutput1.innerHTML) / 100;

				// calculate posterior probability 
				posterior.innerHTML = (prior * frequency) / ((prior * frequency) + (nonPrior * nonFrequency));
				
				// calculate overlap area (small formula)
				overlapOutput.innerHTML = (parseFloat(box1.innerHTML)) * prior;
				overlapOutputPx.innerHTML = (parseFloat(overlapOutput.innerHTML) * 30) * 100;
				
				console.log("overlapOutput = ", overlapOutput.innerHTML);
				
				// recalculate circle distance
				this.setInitialCircleDistance();
				
				break;
			}
		}
		
		// calculate the distance between the two circles 
		this.calculateCircleCenterDistance();
	 }
	 
	 // adjust probability values
	 venn.adjustProbabilityInputs = function(id)
	 {
		switch(id)
		{
			case "yellow":
			{
				var box = document.getElementById("probInput1");
				var yellowArea = document.getElementById("yellow_text");
				box.value = yellowArea.value;
				
				var probOutput1 = document.getElementById("probOutput1");
				probOutput1.innerHTML = 100 - box.value;
				
				break;
			}
			case "red":
			{
				// calculate red area 
				var box1 = document.getElementById("probInput1");
				var box2 = document.getElementById("probInput2");
				var box3 = document.getElementById("probInput3");
				var probOutput1 = document.getElementById("probOutput1");
				
				var redArea = document.getElementById("red_text");
				redArea.value = (box1.value * box2.value) + (parseFloat(probOutput1.innerHTML) * box3.value);
				
				// calculate overlap
				var redCircle = circleArgs.circles["red"];
				var yellowCircle = circleArgs.circles["yellow"];
				var redRadius = redCircle.width / 2;
				var yellowRadius = yellowCircle.width / 2;
				var circleDistance = this.circleDistance;
				
				var overalpBox = document.getElementById("overlap_text");
				block1 = (Math.pow(yellowRadius, 2) * 1 / Math.cos((Math.pow(circleDistance, 2) + 
					(Math.pow(yellowRadius, 2) - (Math.pow(redRadius, 2)))) / (2 * circleDistance * yellowRadius))) 
					
				block2 = (Math.pow(redRadius, 2) * 1 / Math.cos((Math.pow(circleDistance, 2) + 
					(Math.pow(redRadius, 2) - (Math.pow(yellowRadius, 2)))) / (2 * circleDistance * redRadius)))
					
				block3 = (0.5 * Math.sqrt((-circleDistance + yellowRadius + redRadius) * (circleDistance + yellowRadius - redRadius) *
					(circleDistance - yellowRadius + redRadius) * (circleDistance + yellowRadius + redRadius)))
				
				overlapArea = (box2.value * box1.value) / ((box2.value * box1.value) + (box3.value * parseFloat(probOutput1.innerHTML)));
				
				overalpBox.value = overlapArea * 100;
				
				realOverlap = overlapArea * redArea.value;
				realOverlapPx = realOverlap * 30 * 100;
				break;
			}
		}
	 }
	 
	 // calculate the distance 
	 venn.calculateCircleCenterDistance = function()
	 {
		//distLabel = document.getElementById("distanceLabel");
		redCircle = circleArgs.circles["red"];
		yellowCircle = circleArgs.circles["yellow"];
		
		// calculate and display distance between both circles 
		dist = redCircle.distanceFromEdge - yellowCircle.distanceFromEdge;
	 }
	 
	 // change the area of the circle and redraw
	 venn.adjustCircleArea = function(id, circle_id)
	 { 
		var circleArea = "";
		var newCircleId = "";
			
		if(circle_id.search("yellow") != -1)
		{
			newCircleId = "yellow";
			circleArea = "yellowAreaOutput";
		}
		else if(circle_id.search("red") != -1)
		{
			newCircleId = "red";
			circleArea = "redAreaOutput";
		}
	 
		var vennBkg = document.getElementById("vennBackground");
		
		with(circleArgs.circles[newCircleId])
		{
			// remove the child 
			var currentCircleCanvas = document.getElementById(canvasId);
			vennBkg.removeChild(currentCircleCanvas);
			
			// change area to sliders value 
			area = parseFloat(document.getElementById(circleArea).innerHTML); 
			
			// draw circle with new radius
			this.drawCircle(x, y, color, area, canvasId);
		}
	 }
	 
	 // move slider
	 venn.slide = function(sliderObj)
	 {
		// get the distance text 
		var distanceText = document.getElementById("circle_dist_text");
		
		// update the value and calculate circle distance 
		distanceText.value = sliderObj.value;
		this.updateCircleDistance();
	 }
	
	 // update values based on textual input 
	 venn.updateText = function(obj, text_id)
	 {
		var notPrior = document.getElementById("notPrior");
		var prior = document.getElementById("prior");
		var probInput1 = document.getElementById("probInput1");
		 
		 // can't be more than 100%
		if(obj.value > 100)
		{
			$('#inputErrorModal').modal('show');
			return;
		}
		 
		// update circle area output
		document.getElementById(text_id).innerHTML = obj.value;
		this.updateVenn(text_id, text_id);
		
		// update the second frequency value
		if(!this.updateSecondFrequency)
		{
			// get number items
			var innerNumber = document.getElementById("innerNumber");
			var yellowArea = document.getElementById("yellowAreaOutput");
			var newValue = document.getElementById("outerNumber");
			
			// calculate second frequency
			innerNumber.innerHTML = parseFloat(newValue.innerHTML) - (parseFloat(yellowArea.innerHTML) * 10) + this.innerNumberText;
			
			// set flag
			this.updateSecondFrequency = true;
		}
		
		// get string values of the inputs
		var notPriorValue = toString(notPrior.innerHTML);
		var priorValue = toString(prior.innerHTML);
		var probInput1Value = toString(probInput1.innerHTML);
		
		// update ledgend 
		var text1 = document.getElementById("tableCellText1");
		text1.innerHTML = "Have cancer (" + (parseFloat(probInput1.value) * 10) + " women)";
		
		if((notPriorValue.length > 0) && (priorValue.length > 0) && (probInput1Value.length > 0))
		{
			var slider = document.getElementById("circleDist");
			var leftYellow = document.getElementById("yellowCircle").offsetLeft;
			var radiusYellow = circleArgs.circles["yellow"].radius;
			var radiusRed = circleArgs.circles["red"].radius;
	 
			var maxLimit = radiusYellow + radiusRed;
			var minLimit = (leftYellow + radiusRed) - (leftYellow + radiusYellow);

			// set slider 
			slider.disabled = false;
			slider.max = maxLimit;
			slider.min = minLimit;
			slider.value = maxLimit;
			
			// show center button if entered final value 
			if(notPrior.value != "")
			{
				// show the center button
				this.showHideCenter("show");
			}
		}
	 }
	 
	 // add the canvas dimensions to the circle data object
	 venn.addCanvasSizes = function(circle_id, canvasData)
	 {
		// get the correct circle reference
		var currentCircle = circle_id.substr(0, circle_id.lastIndexOf('C'));
		
		// add new canvas data to the existing circle objects 
		circleArgs.circles[currentCircle].width = canvasData.width;
		circleArgs.circles[currentCircle].height = canvasData.height;
		circleArgs.circles[currentCircle].left = canvasData.offsetLeft;
		circleArgs.circles[currentCircle].top = canvasData.offsetTop;
		circleArgs.circles[currentCircle].circleCenter = canvasData.width / 2;
		circleArgs.circles[currentCircle].distanceFromEdge = circleArgs.circles[currentCircle].left + 
			circleArgs.circles[currentCircle].circleCenter;
		circleArgs.circles[currentCircle].radius = canvasData.width / 2;
	 }
	 
	 // function to draw a circle
     venn.drawCircle = function(x, y, circleColor, circleArea, circle_id)
	 {
		// scale the circle to make it visible on screen 
		circleArea = (circleArea * 30) * 100;
		 
		// create a new canvas element
		var newCanvas = document.createElement("canvas");
		document.getElementById("vennBackground").appendChild(newCanvas);
		
		// set the canvas properties
		newCanvas.className = "circle";
		newCanvas.id = circle_id;
		newCanvas.style.position = "absolute";
		
		var circleRadius = this.findRadius(circleArea);
		newCanvas.width = circleRadius * 2;
		newCanvas.height = circleRadius * 2;
		
		// get the canvas context
		var ctx = newCanvas.getContext("2d");
		
		newCanvas.style.left = (x - circleRadius) + "px";
		newCanvas.style.top = (y - circleRadius) + "px";
	
		// set the width, height and size
		var cx = newCanvas.width / 2;
		var cy = newCanvas.height / 2;
		
		// draw the circle
		ctx.beginPath();
		ctx.arc(cx, cy, circleRadius, 0, 2 * Math.PI);
		
		// fill color
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = circleColor;
		ctx.fill();
		
		// add the new canvas data to the existing circle data objects 
		this.addCanvasSizes(circle_id, newCanvas);
	 }
	  
	 // get container dimensions
	 venn.getBackgorundSize = function(theElement)
	 {
		 var sizes = new Array();
		 sizes.push(theElement.offsetLeft);
		 sizes.push(theElement.offsetTop);
		 sizes.push(theElement.offsetWidth);
		 sizes.push(theElement.offsetHeight);
		 
		 return sizes;
	 }
	 
	 // set circle radius 
	 venn.findRadius = function(circleArea)
	 {
		 circleRadius = Math.sqrt(circleArea / Math.PI);
		 return circleRadius;
	 }
	 
	 // update the canvas positions of the circles
	 venn.updateCircleCanvasPositions = function()
	 {
		 with(circleArgs.circles["yellow"])
		 {
			var yellowCircleCanvas = document.getElementById(canvasId);
			top = yellowCircleCanvas.offsetTop;
			left = yellowCircleCanvas.offsetLeft;
		 }
		 with(circleArgs.circles["yellow"])
		 {
			var redCircleCanvas = document.getElementById(canvasId);
			top = redCircleCanvas.offsetTop;
			left = redCircleCanvas.offsetLeft;
		 }
	 }
	 
	 // reset buttons
	 venn.reset = function()
	 {
		 // get elements
		 var slider = document.getElementById("circleDist");
		 var redAreaOutput = document.getElementById("redAreaOutput");
		 var overlapOutputPx = document.getElementById("overlapOutputPx");
		 var overlapOutput2 = document.getElementById("overlapOutput2");
		 var circleDist = document.getElementById("circle_dist_text");
		 var probInput1 = document.getElementById("probInput1");
		 var prior = document.getElementById("prior");
		 var notPrior = document.getElementById("notPrior");
		 var probOutput1 = document.getElementById("probOutput1");
		 var posterior = document.getElementById("posterior");
		 
		 // reset them
		 slider.disabled = true;
		 redAreaOutput.innerHTML = "0";
		 overlapOutputPx.innerHTML = "0";
		 overlapOutput2.innerHTML = "0";
		 circleDist.value = 0;
		 probInput1.value = 0;
		 prior.value = 0;
		 notPrior.value = 0;
		 probOutput1.innerHTML = "0";
		 posterior.innerHTML = "0";

		 // set focus on first input
		 probInput1.focus();
		 
		 // allow the inner number to update 
		 this.updateSecondFrequency = false;
		 
		 // hide the center button
		this.showHideCenter("hide");
	 }
	 
	 // draw tree
	 venn.drawTree = function()
	 {
		 var vennBackground = document.getElementById("vennBackground");
		 
		 // hide the legend 
		 this.showHideLedgend("hide", ["original", "grid"]);
		 
		 // hide the center button
		 this.showHideCenter("hide");
		
		 // remove other venn elements for this view 
		 this.removeVennelements(["original", "grid"]); 
		  
		 // if doesn't exist create it
		 if(!document.getElementById("treeWindow"))
		 {
			// hide the reset button
			document.getElementById("resetButton").style.display = "none";
			 
			// create the tree area
			var treeArea = document.createElement("div");
			treeArea.id = "treeWindow";
			vennBackground.appendChild(treeArea);
	
			// add tree line image
			var newTreeNodeImage = document.createElement('div');
			newTreeNodeImage.id = "treeNodes";
			treeArea.appendChild(newTreeNodeImage);
		
			// get element values
			var outerNumber = parseFloat(document.getElementById("outerNumber").innerHTML);
			var innerNumber = parseFloat(document.getElementById("innerNumber").innerHTML);
			var probInput1 = document.getElementById("probInput1").value;
			var notPrior = document.getElementById("notPrior").value;
			var prior = document.getElementById("prior").value;
		
			// calculate and store in array
			var treeTextNodeValues = new Array();
			treeTextNodeValues.push(outerNumber);
			treeTextNodeValues.push(innerNumber);
			treeTextNodeValues.push(probInput1 * 10);
			treeTextNodeValues.push(innerNumber * (notPrior / 100));
			treeTextNodeValues.push(innerNumber - (innerNumber * (notPrior / 100)));
			treeTextNodeValues.push((probInput1 * 10) * (prior / 100));
			treeTextNodeValues.push((probInput1 * 10) - ((probInput1 * 10) * (prior / 100)));
		
			// create label text strings
			var labelText = new Array();
			labelText.push("took the test");
			labelText.push("no cancer");
			labelText.push("cancer");
			labelText.push("tested positive");
			labelText.push("tested negative");
			labelText.push("tested positive");
			labelText.push("tested negative");
		
			// add tree text nodes
			for(i = 0; i < 7; i++)
			{
				var newTextNode = document.createElement('label');
				newTextNode.className = "treeTextNode";
				newTextNode.id = "treeTextNodeId_" + (i + 1);
				newTextNode.innerHTML = Math.round(treeTextNodeValues[i]);
				treeArea.appendChild(newTextNode);
				
				var treeTextLabelNode = document.createElement('label');
				treeTextLabelNode.className = "treeTextLabelNode";
				treeTextLabelNode.id = "treeTextLabelNodeId_" + (i + 1);
				treeTextLabelNode.innerHTML = labelText[i];
				treeArea.appendChild(treeTextLabelNode);
			}
		 }
	 }
		 
	// draw original venn
	venn.drawOriginalVenn = function()
	{
		var vennBackground = document.getElementById("vennBackground");
		
		 // hide the legend 
		 this.showHideLedgend("hide", ["grid"]);
		
		// remove other venn elements for this view 
		this.removeVennelements(["tree", "grid"]); 
			 
		// hide the center button
		this.showHideCenter("hide");
		
		// if doesn't exist create it
		if(!document.getElementById("originalVennWindow"))
		{
			// hide the reset button
			document.getElementById("resetButton").style.display = "none"; 
				
			// create the venn area
			var originalVennArea = document.createElement("div");
			originalVennArea.id = "originalVennWindow";
			originalVennArea.style.backgroundColor = "lightblue";
			vennBackground.appendChild(originalVennArea);

			// add venn image
			var newVennImage = document.createElement('div');
			newVennImage.id = "originalVennImage";
			originalVennArea.appendChild(newVennImage);
			
			// get element values
			var outerNumber = parseFloat(document.getElementById("outerNumber").innerHTML);
			var innerNumber = parseFloat(document.getElementById("innerNumber").innerHTML);
			var probInput1 = document.getElementById("probInput1").value;
			var notPrior = document.getElementById("notPrior").value;
			var prior = document.getElementById("prior").value;
			
			var vennNodeValues = new Array();
			vennNodeValues.push((probInput1 * 10) - ((probInput1 * 10) * (prior / 100)));
			vennNodeValues.push((probInput1 * 10) * (prior / 100));
			vennNodeValues.push(innerNumber * (notPrior / 100));
			
			var labelValues = ["have cancer and tested negative", "have cancer and tested postive", "do not have cancer and tested positive"];
			
			// add text nodes
			for(i = 0; i < 3; i++)
			{
				var neworiginalVennTextNode = document.createElement('label');
				neworiginalVennTextNode.className = "origionalVennTextNode";
				neworiginalVennTextNode.id = "originalVennTextNodeId_" + (i + 1);
				neworiginalVennTextNode.innerHTML = Math.round(vennNodeValues[i]);
				originalVennArea.appendChild(neworiginalVennTextNode);
				
				var textLabelNode = document.createElement('label');
				textLabelNode.className = "textLabelNodeclass";
				textLabelNode.id = "textLabelNode_" + (i + 1);
				textLabelNode.innerHTML = labelValues[i];
				originalVennArea.appendChild(textLabelNode);
			}
			
			var newInnerArea = document.createElement('div');
			newInnerArea.id = "originalInnerNumber";
			newInnerArea.innerHTML = document.getElementById("innerNumber").innerHTML;
			originalVennArea.appendChild(newInnerArea);
			
			// add legend
			this.addLegend("original");
		}			
	 }
	 
	 // interactive venn
	 venn.drawInteractiveVenn = function()
	 {
		var vennBackground = document.getElementById("vennBackground");
		 
		// hide the legend 
		this.showHideLedgend("hide", ["grid"]);
		 
		// show the reset button
		document.getElementById("resetButton").style.display = "table-cell"; 
		 
		// remove other venn elements for this view 
		this.removeVennelements(["original", "tree", "grid"]); 
		
		// add legend
		this.addLegend("dynamic");
	 }
	 
	 // remove additional venn elements
	 venn.removeVennelements = function(itemsToRemove)
	 {
		if(itemsToRemove.indexOf("original") != -1)
		{			
			if(document.getElementById("originalVennWindow")) 
			{
				vennBackground.removeChild(document.getElementById("originalVennWindow"));
			}
		}
		if(itemsToRemove.indexOf("tree") != -1)
		{
			if(document.getElementById("treeWindow"))
			{
				vennBackground.removeChild(document.getElementById("treeWindow"));
			}
		}
		if(itemsToRemove.indexOf("grid") != -1)
		{
			if(document.getElementById("gridWindow"))
			{
				vennBackground.removeChild(document.getElementById("gridWindow"));
			}
		}
	 }
	 
	 // grid venn 
	 venn.drawGridVenn = function()
	 {
		var vennBackground = document.getElementById("vennBackground");
		 
		// hide the center button
		this.showHideCenter("hide");
		 
		// remove other venn elements for this view 
		this.removeVennelements(["original", "tree"]); 
		 
		// if doesn't exist create it
		if(!document.getElementById("gridWindow"))
		{
			// hide the reset button
			document.getElementById("resetButton").style.display = "none";
			 
			// create the tree area
			var gridArea = document.createElement("div");
			gridArea.id = "gridWindow";
			vennBackground.appendChild(gridArea);
				
			// get elements
			var innerNumber = parseFloat(document.getElementById("innerNumber").innerHTML);
			var probInput1 = parseFloat(document.getElementById("probInput1").value);
			var notPrior = parseFloat(document.getElementById("notPrior").value);
			var prior = parseFloat(document.getElementById("prior").value);
			
			var areaWidth = gridArea.offsetWidth;
			var areaHeight = gridArea.offsetHeight;
			
			var unitWidth = Math.sqrt(areaWidth * areaHeight / 1000);
			this.gridCellSize = unitWidth;
			var boxRowLength = areaWidth / unitWidth;
			var boxColLength = areaHeight / unitWidth;
			
			// calculate numbers for different types of circles
			var numYellowCircles = probInput1 * 10;
			var numYellowRed = Math.round((numYellowCircles * prior) / 100);
			var numBlueRed = Math.round(((numYellowCircles * (prior / 100)) + (innerNumber * (notPrior / 100))) - numYellowRed);
			var numYellowCirclesOnly = numYellowCircles - numYellowRed
			
			// store for grid ledgend 
			this.gridVals = { yellow : Math.round(numYellowCircles), yellowRed : Math.round(numYellowRed), blueRed : Math.round(numBlueRed), yellowOnly : Math.round(numYellowCirclesOnly)};
			
			var leftOffset = 0;
			var topOffset = 0;
			
			for(var y = 0; y < boxColLength; y++)
			{
				for(var x = 0; x < boxRowLength; x++)
				{
					var gridCell = document.createElement('canvas');
					gridArea.appendChild(gridCell); 
					var gridCtx = gridCell.getContext('2d');
					gridCell.className = "gridCellClass";		
					gridCell.width = unitWidth;
					gridCell.height = unitWidth;
					gridCell.style.top = topOffset + "px";
					gridCell.style.left = leftOffset + "px";  
					leftOffset += unitWidth;
					
					var cx = (unitWidth  / 2); 
					var cy = (unitWidth  / 2); 
					var radius = (unitWidth  / 2) - 2;
					
					gridCtx.beginPath();
					gridCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
					
					if(numYellowCirclesOnly > 0)
					{
						gridCtx.fillStyle = "#f6fb39";
						gridCtx.fill();
						numYellowCirclesOnly--;
					}
					else if(numYellowRed > 0 && numYellowCirclesOnly == 0)
					{
						gridCtx.fillStyle = "#f6fb39";
						gridCtx.lineWidth = 2;
						gridCtx.fill();
						gridCtx.strokeStyle = '#D66C73';
						gridCtx.stroke();
						numYellowRed--;
					}
					else if(numBlueRed > 0 && numYellowCirclesOnly == 0 && numYellowRed == 0)
					{
						gridCtx.fillStyle = "lightblue";
						gridCtx.lineWidth = 2;
						gridCtx.fill();
						gridCtx.strokeStyle = '#D66C73';
						gridCtx.stroke();
						numBlueRed--;
					}
					else{
						gridCtx.fillStyle = "lightblue";
						gridCtx.fill();
					}
				}
				leftOffset = 0;
				topOffset += unitWidth;
			}
		}
		 
		// add legend
		this.addLegend("grid");
	}
	
	// add legend
	venn.addLegend = function(legendType)
	{
		var vennBackground = document.getElementById("vennBackground");
		var legendContainer = document.getElementById("legendContainer");
		var color1 = document.getElementById("tableLedgendCell1");
		var color2 = document.getElementById("tableLedgendCell2");
		
		// show legend
		legendContainer.style.display = "block";
		
		// position legend
		legendContainer.style.left = vennBackground.offsetLeft + vennBackground.offsetWidth + 20;
		legendContainer.style.top = vennBackground.offsetTop;
		
		// change color depending on legend type 
		switch(legendType)
		{
			case "dynamic":
				color1.style.backgroundColor = "yellow";
				color1.style.opacity = "0.5";
				color2.style.backgroundColor = "#D66C73";
				break;
			case "original":
				color1.style.backgroundColor = "#FFFFBF";
				color1.style.border = "4px solid yellow";
				color2.style.backgroundColor = "#EAB4B8";
				color2.style.border = "4px solid #D66C73";
				break;
			case "grid":
				this.drawGridLedgend();
				break;
			default: break;
		}
	}
	
	// draw the more complex grid ledgend
	venn.drawGridLedgend = function()
	{
		var idCount = 0;
		
		// if ledgend already exists don't create again
		if(document.getElementById("legendContainerGrid"))
		{
			document.getElementById("legendContainerGrid").style.display = "block";
			this.showHideLedgend("hide", ["original"]);
			return;
		}
		
		console.log("DRAWING GRID LEDGEND");
		
		// get original ledgend
		var originalLedgend = document.getElementById("legendContainer");
		
		// create gid ledgend container
		var legendContainer = document.createElement('div');
		legendContainer.id = "legendContainerGrid";
		document.getElementById("pageBody").appendChild(legendContainer);
		
		// position ledgend 
		legendContainer.style.top = originalLedgend.offsetTop + "px";
		legendContainer.style.left = originalLedgend.offsetLeft + 100 + "px";
		legendContainer.style.height = originalLedgend.offsetHeight + 500 + "px";
		legendContainer.style.width = originalLedgend.offsetWidth + 150 + "px";
		
		// hide ledgend
		this.showHideLedgend("hide", ["original"]);
		
		// create ledgend table
		var ledgendTable = document.createElement('table');
		ledgendTable.id = "ledgendTableId";
		legendContainer.appendChild(ledgendTable);
		
		for(var rows = 0; rows < 6; rows++)
		{
			// create table row
			var ledgendTableRow = document.createElement('tr');
			ledgendTable.appendChild(ledgendTableRow);
		
			for(var cols = 0; cols < 4; cols++)
			{
				// create table-cell
				var ledgendTableCell = document.createElement('td');
				ledgendTableCell.id = "td_" + idCount;
				ledgendTableCell.style.paddingTop = "10px";
				idCount++;
				
				// add the approripate items to the ledgend table 
				switch(idCount)
				{
					case 3: this.drawMiniCircle('#f6fb39', 'none', ledgendTableCell); break;
					case 4: ledgendTableCell.innerHTML = "Have cancer & tested negative (" + this.gridVals.yellowOnly + " women)"; break;
					case 7: this.drawMiniCircle('#f6fb39', '#D66C73', ledgendTableCell); break;
					case 8: ledgendTableCell.innerHTML = "Have cancer & tested positive (" + this.gridVals.yellowRed + " women)"; break;
					case 11: this.drawMiniCircle('lightblue', '#D66C73', ledgendTableCell); break;
					case 12: ledgendTableCell.innerHTML = "Do not have cancer & tested positive (" + this.gridVals.blueRed + " women)"; break;
					case 15: this.drawMiniCircle('lightblue', 'none', ledgendTableCell); break;
					case 16: ledgendTableCell.innerHTML = "Do not have cancer & tested negative (" + (1000 - this.gridVals.blueRed - this.gridVals.yellowRed - this.gridVals.yellowOnly) + " women)"; break;
					case 17: this.drawMiniCircle('#f6fb39', 'none', ledgendTableCell); break;
					case 18: ledgendTableCell.innerHTML = "+"; break;
					case 19: this.drawMiniCircle('#f6fb39', '#D66C73', ledgendTableCell); break;
					case 20: ledgendTableCell.innerHTML = "Have cancer (" + this.gridVals.yellow + " women)"; break;
					case 21: this.drawMiniCircle('lightblue', 'none', ledgendTableCell); break;
					case 22: ledgendTableCell.innerHTML = "+"; break;
					case 23: this.drawMiniCircle('lightblue', '#D66C73', ledgendTableCell); break;
					case 24: ledgendTableCell.innerHTML = "Do not have cancer (" + (1000 - this.gridVals.yellowRed - this.gridVals.yellowOnly) + " women)"; break;
				}
				ledgendTableRow.appendChild(ledgendTableCell);
			}
		}
	}
	
	// draw an mini circle for the grid ledgend
	venn.drawMiniCircle = function(innerColor, outerColor, parentCell)
	{
		var miniCircle = document.createElement('canvas');
		parentCell.appendChild(miniCircle);
		var miniCircleCtx = miniCircle.getContext('2d');
		
		miniCircle.width = this.gridCellSize;
		miniCircle.height = this.gridCellSize;
		
		var cx = (this.gridCellSize  / 2); 
		var cy = (this.gridCellSize  / 2); 
		var radius = (this.gridCellSize  / 2) - 2;
					
		miniCircleCtx.beginPath();
		miniCircleCtx.arc(cx, cy, radius, 0, 2 * Math.PI);
					
		miniCircleCtx.fillStyle = innerColor;
		miniCircleCtx.lineWidth = 2;
		miniCircleCtx.fill();
		
		if(outerColor != 'none')
		{
			miniCircleCtx.strokeStyle = outerColor;
			miniCircleCtx.stroke();
		}
	}
	
	// centre the circle 
	venn.center = function()
	{
		// calculate distance between circle canvases
		var redCircle = document.getElementById("redCircle");
		var yellowCircle = document.getElementById("yellowCircle");
		var vennBackground = document.getElementById("vennBackground");
		
		// calculate distance 
		var distance = redCircle.offsetLeft - yellowCircle.offsetLeft;
		
		// set yellow circle to left of container plus small margin
		yellowCircle.style.left = 20;
		redCircle.style.left = yellowCircle.offsetLeft + distance;
	}
	
	// show or hide the center button
	venn.showHideCenter = function(mode)
	{
		var centreButton = document.getElementById("centreButton");
		
		if(mode == "hide")
		{
			centreButton.style.display = "none";
		}
		else
		{
			centreButton.style.display = "table-cell";
		}
	}
	
	// show or hide the ledgend 
	venn.showHideLedgend = function(action, ledgends)
    {
		if(action == "hide")
	    {
			var legend = document.getElementById("legendContainer");
			var gridLedgend = document.getElementById("legendContainerGrid"); 
			
			if(legend && ledgends.indexOf("original") != -1)
			{
				legend.style.display = "none";
				console.log("Should be hiding original ledgend");
			}
			if(gridLedgend && ledgends.indexOf("grid") != -1)
			{
				gridLedgend.style.display = "none";
				console.log("Should be hiding grid ledgend");
			}
		}
	}
	
	return(venn);
 }