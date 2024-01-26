# use-feather

`use-feather` is a library for simple spring based animations in react.

## Basic Usage

In order to create an animation, you simply call `useFeather` with a
callback function. The callback function will be called every
animation frame with the current value. It is up to the callback
function to update the actual element to be animated. This makes
it very flexible, and you can easily animate position, color or
rotation, it is up to you. 

In order to understand `useFeather` you can think of it as being
similar to `useState`. In the case of `useState` there is a function
to set the value of the state. In the case of `useFeather` there is
instead a function to set the *target* for the value. The actual
value will then move closer to the target every animation frame.

Here is a simple example:

```jsx
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
```

As seen in the example, the `useFeather` is initialized with a
callback. The callback updates the transform of a referenced element.
There are also two buttons. When the buttons are clicked, the feather
object (i.e. the object returned by `useFeather`) has its target value
modified.

## Reference

### useFeather

```
useFeather(function, [options])
```

Returns an object of type `Feather` as described below. The instance of this object will be the same for the lifetime
of the component. The `function` argument is the function to be called on each animation frame. The `options` argument is
an object with the following fields. Note that the options passed will be used to initialy instantiate a class. If you want to modify the vlues later, use methods on the object.

* `value` - Initial value.
* `threshold` - A threshold value that can be used to check progress of
the animation. Intended to be used together with the `isAboveThreshold` function on the returned feather object. When the status of this function changes, i.e. when the animated value changes from being below the threshold to above, a re-render of the component will be triggered so that the value returned by `isAboveThreshold` will always be up to date.
* `algo` - Algorithm to use. Accepted values are `decay` and `spring`. Default value is `spring`.
* `stiffness` - Spring stiffness when the spring algorithm is used. Default is 170.
* `damping` - Spring damping when the spring algorithm is used. Default is 26.
* `decay` - Decay factor when the decay algorithm is used. Default is 1.


### Feather

The object returned by `useFeather` is an instance of this class. The class has the following methods:

* `setAlgo(algo)` - Set algorithm.
* `setThreshold(value)` - Set threshold.
* `getValue()` - Get the current anmated value.
* `setValue(value)` - Hard set the current value, as well as the target. This will cause the value to be immediately set, i.e. it will not be animated.
* `setTarget(value)` - Set target value.
* `setTargetDelayed(value,delay)` - Schedule the target to be set to value after delay milliseconds.
* `getTarget()` - Get the current target.
* `isAtRest()` - Return `true` or `false` depending on weather the animation has reached its target. If the status changes, the component will be re-rendered.
* `isAboveThreshold()` - Return `true` or `false` depending on if the animated value is above or below the threshold. If the status changes, the component will be re-rendered.
