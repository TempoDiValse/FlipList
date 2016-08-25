# FlipList
Animations of showing on a list for JS

ol이나 ul형태의 리스트나 DIV내의 child들에 순차적으로 애니메이션을 입혀준다.
애니메이션의 형태는 Rotate와 Blink, Protrude, Slide 타입이 있음.

API

1. 초기화<br>
	@param id => Element ID 값<br>
	@param _options => 초기 옵션 지정값(없으면 패스)

2. 옵션 값<br>
	@key flipType(String) => rotate, blink, protrude, slide <br>
	@key flipDirection(String(UpperCase)) => X, Y (flipType이 rotate일 경우 사용가능)
	@key velocity(Integer/Float) => 각 타입마다 최대 최소 허용 속도치가 다름.
	@key onComplete(Function) => 완료 Callback

3. 기타 메소드
	- getProperty : 옵션값을 확인 할 수 있음<br>
		@param key(String) => option key 값
	
	- flipStart : 애니메이션이 1회 시작한다.

	- refresh : 매 초마다 갱신되는 경우 데이터를 리프레쉬 하고 애니메이션을 1회 시작한다. 
		    (데이터를 모아서 한번에 뿌리는게 아니기 때문에 싱크를 잘 맞춰야 한다)
