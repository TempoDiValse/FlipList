/*----------------------------------------------------------------------------------------
	FlipList

	ol이나 ul형태의 리스트나 DIV내의 child들에 순차적으로 애니메이션을 입혀준다.
	애니메이션의 형태는 Rotate와 Blink, Protrude, Slide 타입이 있음.

	API
	1. 초기화
		@param id => Element ID 값
		@param _options => 초기 옵션 지정값(없으면 패스)

	2. 옵션 값
		@key flipType(String) => rotate, blink, protrude, slide
		@key flipDirection(String(UpperCase)) => X, Y (flipType이 rotate일 경우 사용가능)
		@key velocity(Integer/Float) => 각 타입마다 최대 최소 허용 속도치가 다름.
		@key onComplete(Function) => 완료 Callback
	
	3. 기타 메소드
		- getProperty : 옵션값을 확인 할 수 있음
			@param key(String) => option key 값
		
		- flipStart : 애니메이션이 1회 시작한다.

		- refresh : 매 초마다 갱신되는 경우 데이터를 리프레쉬 하고 애니메이션을 1회 시작한다. 
					(데이터를 모아서 한번에 뿌리는게 아니기 때문에 싱크를 잘 맞춰야 한다)

	@author LaValse
	@date 2016.08.22
------------------------------------------------------------------------------------------*/
/**
	Copyright (c) <2016~> <LaValse (jiwow34@gmail.com)>

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
**/
var FlipList = (function(){
	"use strict";
	
	var DefVelocity = {
		rotate: {
			min: 1,
			max: 5,
			default: 3
		},
		blink: {
			min: 0.005,
			max: 0.03,
			default: 0.02
		},
		protrude: {
			min: 0.5,
			max: 2,
			default: 1
		},
		slide: {
			min: 0.05,
			max: 0.09,
			default: 0.06
		}
	}

	var _proto = FlipList.prototype;

	var options = {
		flipType: "rotate",
		flipDirection: 'X',
		velocity: 0,
		onComplete: null
	}

	var wrapper;
	var child;
	var datas;
	var elFlipState;

	function FlipList(id, _options){
		if(id){
			wrapper = document.getElementById(id);

			if(_options){
				extend(options, _options);

				var _t = option("flipType");
				var _v = option("velocity");

				if(_v == 0){
					option("velocity", DefVelocity[_t].default);
				}else{
					var _min = DefVelocity[_t].min;
					var _max = DefVelocity[_t].max;

					if(_v < _min || _v > _max){
						var _def = DefVelocity[_t].default;

						console.warn("Velocity is under or over ("+_v+") than default value(Min: "+_min+", Max: "+_max+"). \nIt will set a default ("+_def+") automatically");
						option("velocity", _def);
					}
				}
			}
			
			init();
		}else{
			console.log("set component id");
		}
	}
	
	function option(){
		var v = arguments[0];

		if(arguments.length > 1){
			options[v] = arguments[1];
		}else{
			return options[v];
		}
	}

	function extend(dest, src){
		for(var k in src){
			if(src.hasOwnProperty(k)){
				option(k, src[k]);
			}
		}

		return;
	}

	function init(){
		child = wrapper.childNodes;

		elFlipState = new Array();
		
		release("all");
		animInterval = null;

		for(var i=0,size=child.length; i<size; i++){
			var obj = child[i];

			if(obj.nodeName == "#text") continue;

			if(typeof obj === 'object'){
				if(!obj.id) obj.id = "flipRow_"+i;
				if(option("flipType") == "blink" && i == 0) obj.style.opacity = 0.0;
				if(option("flipType") == "slide"){
					obj.style.transform = "translateY(10px)";
					obj.style.opacity = 0.0;
				}

				elFlipState.push(false);
			}
		}
	}

	var row = 0;

	var degree = 0;
	var opacity = 0.0;
	var offset = 0.0;

	var increment = 0;

	var animInterval;

	var rotateAnimation = function(obj, complete){
		if(degree < 360){
			degree += increment;

			obj.style.transform = "rotate"+option("flipDirection")+"("+degree+"deg)";
			
			registerAnimation(rotateAnimation, obj, complete);
		}else{
			release(obj);
			complete(++row);
		}
	}

	var blinkAnimation = function(obj, complete){
		if(opacity <= 1.0){
			opacity += increment;
			obj.style.opacity = ease(opacity, 1.0);

			registerAnimation(blinkAnimation, obj, complete);
		}else{
			release(obj);
			complete(++row);
		}
	}

	var protrudeAnimation = function(obj, complete){
		if(degree <= 90){
			degree += increment;
			
			var xValue = Math.abs(20 * Math.sin((2 * Math.PI) *(degree/180)));
			
			obj.style.transform = "translateX("+xValue+"px)";

			registerAnimation(protrudeAnimation, obj, complete);
		}else{
			release(obj);
			complete(++row);
		}
	}

	var slideAnimation = function(obj, complete){
		if(offset > 0.0){
			offset -= increment;
			opacity += (increment-0.045);

			obj.style.transform = "translateY("+offset+"px)";
			obj.style.opacity = ease(opacity, 1.0);

			registerAnimation(slideAnimation, obj, complete);
		}else{

			release(obj);
			complete(++row);
		}
	}

	var animate = function(elIndex){
		if(elIndex < child.length){
			if(child[elIndex].nodeName == "#text") {
				animate(++row);
				return;
			}

			var _func;
			
			increment = option("velocity");

			switch(option("flipType")){
				case "rotate":
					degree = 0;
					_func = rotateAnimation;
					break;
				case "blink":
					opacity = 0.0;
					_func = blinkAnimation;
					break;
				case "protrude":
					degree = 0;
					_func = protrudeAnimation;
					break;
				case "slide":
					offset = 10;
					opacity = 0.0;
					_func = slideAnimation;
					break;
			}
			
			_func.call(this, child[elIndex], animate);	
		}else{
			row = 0;

			if(option("onComplete") != null){
				option("onComplete").call(this);
			}
		}
	}

	function ease(current, end){
		return current / end;
	}

	function registerAnimation(anim ,obj, complete){
		if(!elFlipState[row] && animInterval == null){
			elFlipState[row] = true;
			
			var itv_id = setInterval(anim, 1, obj, complete);
			
			animInterval = {
				obj: obj.id,
				interval: itv_id
			};
		}
	}

	function release(obj){
		if(animInterval != null){
			clearInterval(animInterval.interval);
		}
		animInterval = null;
		
		var cssProps = new Array();

		switch(option("flipType")){
			case "rotate":
			case "protrude":
				cssProps.push({ prop: "transform" });
				break;
			case "blink":
				cssProps.push({ prop: "opacity" });
				break;
			case "slide":
				cssProps.push({ prop: "transform" });
				cssProps.push({	prop: "opacity" });
				break;
		}
		
		// re-configure styles of each element or all elements
		if(typeof obj === "string"){ // "all"
			for(var i=0; i<child.length; i++){
				var obj = child[i];
				if(obj.nodeName == "#text") continue;

				for(var j=0; j<cssProps.length; j++){
					var prop = cssProps[j].prop;
					var value = cssProps[j].value || "";

					obj.style[prop] = value;
				}
			}
		}else{ 
			if(obj.nodeName == "#text") return;

			for(var i=0; i<cssProps.length; i++){
				var prop = cssProps[i].prop;
				var value = cssProps[i].value || "";

				obj.style[prop] = value;
			}
		}
	}

	_proto.getProperty = function(key){
		return option(key);
	}

	_proto.flipStart = function(){
		if(child.length == 0) return;
		
		row = 0;
		animate(row);
	}

	_proto.refresh = function(){
		init();
		this.flipStart();
	}

	return FlipList;
})();
