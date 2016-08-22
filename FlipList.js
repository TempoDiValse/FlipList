/*----------------------------------------------------------------------------------------
	FlipList

	ol이나 ul형태의 리스트나 DIV내의 child들에 순차적으로 애니메이션을 입혀준다.
	애니메이션의 형태는 Rotate와 Blink 타입이 있음.

	API
	1. 초기화
		@param id => Element ID 값
		@param _options => 초기 옵션 지정값(없으면 패스)

	2. 옵션 값
		@key flipType(String) => rotate, blink
		@key flipDirection(String(UpperCase)) => X, Y (flipType이 rotate일 경우 사용가능)
	
	3. 기타 메소드
		- getProperty : 옵션값을 확인 할 수 있음
			@param key(String) => option key 값
		
		- flipStart : 애니메이션이 1회 시작한다.

		- refresh : 매 초마다 갱신되는 경우 데이터를 리프레쉬 하고 애니메이션을 1회 시작한다. 
					(데이터를 모아서 한번에 뿌리는게 아니기 때문에 싱크를 잘 맞춰야 한다)

	@author LaValse
	@date 2016.08.22
------------------------------------------------------------------------------------------*/

var FlipList = (function(){
	"use strict";
	
	var _proto = FlipList.prototype;

	var options = {
		flipType: "rotate",
		flipDirection: 'X'
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
		
		release();
		animInterval = null;

		for(var i=0,size=child.length; i<size; i++){
			var obj = child[i];

			if(typeof obj === 'object'){
				if(!obj.id) obj.id = "flipRow_"+i;
				if(option("flipType") == "blink" && i == 0) obj.style.opacity = 0.0;

				elFlipState.push(false);
			}
		}
	}

	var row = 0;

	var degree = 0;

	var increment = 0;
	var opacity = 0.0;

	var animInterval;

	var rotateAnimation = function(obj, complete){
		if(degree <= 360){
			degree += increment;

			obj.style.transform = "rotate"+option("flipDirection")+"("+degree+"deg)";
			
			registerAnimation(rotateAnimation, obj, complete);
		}else{
			release();
			complete(++row);
		}
	}

	var blinkAnimation = function(obj, complete){
		if(opacity <= 1.0){
			opacity += increment;
			obj.style.opacity = ease(opacity, 1.0);

			registerAnimation(alphaAnimation, obj, complete);
		}else{
			release();
			complete(++row);
		}
	}

	var animate = function(elIndex){
		if(elIndex < child.length){
			var flipType = option("flipType");

			if(flipType == "rotate"){
				degree = 0;
				increment = 3;

				rotateAnimation(child[elIndex], animate);
			}else if(flipType == "blink"){
				opacity = 0.0;
				increment = 0.02;

				blinkAnimation(child[elIndex], animate);
			}
		}else{
			row = 0;
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

	function release(){
		if(animInterval != null){
			clearInterval(animInterval.interval);
		}

		animInterval = null;
		
		var flipType = option("flipType");
		
		var cssProperty = "";
		if(flipType == "rotate"){
			cssProperty = "transform";
		}else if(flipType == "blink"){
			cssProperty = "opacity";
		}

		for(var i=0; i<child.length; i++){
			var obj = child[i];
			
			child[i].style[cssProperty] = "";
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