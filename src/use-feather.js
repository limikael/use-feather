import {useRef, useEffect, useLayoutEffect, useState, useCallback} from "react";

class Feather {
    constructor(conf) {
        let defaultConf={
            value: 0,
            threshold: 0,
            stiffness: 170,
            damping: 26,
            algo: "spring",
            decay: 1,
        }

        for (let k in defaultConf) {
            this[k]=defaultConf[k];
            if (conf[k])
                this[k]=conf[k];
        }

        this.setter=conf.setter;
        this.velocity=0;
        this.lastT=0;
        this.target=this.value;
        this.epsilon=0.1;
        this.forceUpdate=conf.forceUpdate;
    }

    setAlgo(algo) {
        this.algo=algo;
    }

    setThreshold(value) {
        this.threshold=value;
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value=value;
        this.target=value;
        this.velocity=0;

        if (this.targetDelayTimeout) {
            clearTimeout(this.targetDelayTimeout);
            this.targetDelayTimeout=null;
        }

        if (this.initialEffectHasRan)
            this.setter(this.value);
    }

    setTarget(target) {
        if (this.targetDelayTimeout) {
            clearTimeout(this.targetDelayTimeout);
            this.targetDelayTimeout=null;
        }

        if (target==this.target)
            return;

        this.target=target;
        if (!this.isAtRest())
            this.requestAnimation();

        this.forceUpdate();
    }

    setTargetDelayed(target, delay) {
        if (this.targetDelayTimeout) {
            clearTimeout(this.targetDelayTimeout);
            this.targetDelayTimeout=null;
        }

        this.targetDelayTimeout=setTimeout(()=>{
            this.setTarget(target);
        },delay);
    }

    getTarget() {
        return this.target;
    }

    tick(delta) {
        switch (this.algo) {
            case "spring":
                        let displacement=this.value-this.target;
                    let hookeForce=-1.0*(this.stiffness*displacement);
                    let dampenedForce=(hookeForce-(this.damping*this.velocity));
                        this.velocity += dampenedForce * delta;
                        this.value += this.velocity * delta;
                        break;

                case "decay":
                    this.velocity=this.decay*(this.target-this.value);
                    this.value+=this.velocity*delta;
                    break;
        }
    }

    onAnimationFrame=(t)=>{
        this.animationFrameId=undefined;

        let delta=t-this.lastT;
        if (delta<0)
            delta=0;

        if (delta>40)
            delta=40;

        //console.log("animation, delta="+delta);
        /*for (let i=0; i<10; i++)
            this.tick((delta/1000)/10);*/

        let prevThresholdState=this.isAboveThreshold();

        this.tick(delta/1000);
        this.setter(this.value);

        if (this.isAtRest() || this.isAboveThreshold()!=prevThresholdState)
            this.forceUpdate()

        if (!this.isAtRest())
            this.requestAnimation(t);
    }

    requestAnimation(t) {
        if (typeof window=="undefined")
            return;

        if (!t)
            t=performance.now();

        if (!this.animationFrameId) {
            this.lastT=t;
            this.animationFrameId=requestAnimationFrame(this.onAnimationFrame);
        }
    }

    isAtRest() {
        return (
            Math.abs(this.value-this.target)<this.epsilon && 
            Math.abs(this.velocity)<this.epsilon
        );
    }

    isAboveThreshold() {
        return (this.value>this.threshold)
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId=undefined;
        }
    }
}

function objectifyArgs(params, fields) {
    let conf={};

    for (let i=0; i<params.length; i++) {
        if (typeof params[i]=="object")
            conf={...conf,...params[i]}

        else if (fields[i])
            conf[fields[i]]=params[i];
    }

    return conf;
}

export function useFeather(...args) {
    let ref=useRef();
    let [_,setDummyState]=useState();
    let forceUpdate=useCallback(()=>setDummyState({}));

    useLayoutEffect(()=>{
        ref.current.initialEffectHasRan=true;
        if (ref.current.isAtRest())
            ref.current.setter(ref.current.value);

        return ()=>{
            ref.current.stop();
        }
    },[]);

    let conf=objectifyArgs(args,["setter","algo","value"]);
    if (!ref.current) {
        conf.forceUpdate=forceUpdate;
        ref.current=new Feather(conf);
        if (!ref.current.isAtRest())
            ref.current.requestAnimation();
    }

    ref.current.setter=conf.setter;
    return ref.current;
}