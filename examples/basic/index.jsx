import {useFeather} from "use-feather";
import {useRef} from "react";

function ComponentWithAnimation() {
	let ref=useRef();
	let feather=useFeather(v=>ref.current.style.transform=`translateX(${v}px)`);

	return (<>
		<button onclick={()=>feather.setTarget(0)}>left</button>
		<button onclick={()=>feather.setTarget(500)}>right</button>
		<div ref={ref} style="width: 100px">
			I can move
		</div>
	</>);
}

export default function() {
	return (<ComponentWithAnimation/>);
}