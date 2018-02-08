'use strict';

import $ from 'jquery';
import roundTo from 'round-to';

// ----------------------------------------------------

/**
 * @typedef {object} PolygonPoint
 * @property {number} x
 * @property {string} y
 */

/**
 * Polygon points animation
 * @example
 * let polymate = new Polymate($polygon, {duration: 150});
 * // Or
 * $polygon.polymate({duration: 150})
 * let polymate = $polygon.data('polymate');
 *
 * // Then
 *
 * polymate.start();
 * polymate.start(true); // Reverse animation
 */
class Polymate {

    /**
     * @param {jquery} $el - <polygon>
     * @param {object} [options] - jQuery .animate() options
     */
    constructor($el, options){
        this._$polygon          = $($el);
        this._node              = this._$polygon[0];
        this._node.transformVal = 0;
        this._svgPointsFrom     = this._$polygon.attr('points');
        this._svgPointsTo       = this._$polygon.attr('data-animate-to');

        // Check attributes
        // ----------------------------------------------------

        if(this._node.tagName.toLowerCase() !== 'polygon')
            throw new Error('Not a polygon element');

        if(!this._svgPointsTo)
            throw new Error('"data-animate-to" attribute is required');

        // ----------------------------------------------------

        this._pointsArrFrom = Polymate.pointsStrToArr(this._svgPointsFrom);
        this._pointsArrTo   = Polymate.pointsStrToArr(this._svgPointsTo);

        // ----------------------------------------------------

        if(this._pointsArrFrom.length !== this._pointsArrTo.length)
            throw new Error('Array length should be the same');

        // ----------------------------------------------------

        this.options = $.extend({}, options);
    }

    // API
    // ----------------------------------------------------

    /**
     * Start animation
     * @param {boolean} reverse - Reverse animation or not
     * @return {Polymate} self
     */
    start(reverse = false){
        let animationProps,
            animateTo = reverse ? 0 : 1;

        // Extend options and overwrite "step" prop if present
        // ----------------------------------------------------

        animationProps = $.extend(this.options, {
            step: (val) =>{
                // Update property
                this._node.transformVal = val;

                // Write points
                this._$polygon.attr('points', this._getNewPoints(val));
            }
        });

        // ----------------------------------------------------

        this.stop().animate({transformVal: animateTo}, animationProps);

        return this;
    }

    /**
     * Stop animation
     * @return {Polymate} self
     */
    stop(){
        return this._$polygon.stop();
    }

    // Static
    // ----------------------------------------------------

    /**
     * Get value in specified range with provided multiplier (% / 100)
     * @param {number} fromVal
     * @param {number} toVal
     * @param {number} multiplier - Value from 0 to 1
     * @return {number}
     */
    static getMiddleVal(fromVal, toVal, multiplier){

        // 10 - 0    |   20   - 0
        // x  - 0.5  |   x    - 0.5
        // 20 - 1    |   10   - 1

        // ----------------------------------------------------

        if(typeof fromVal !== 'number' || typeof toVal !== 'number')
            throw new Error('1-st and 2-d argument should be a number');

        if(multiplier > 1 || multiplier < 0)
            throw new Error('Multiplier should be between 0 and 1');

        // ----------------------------------------------------

        if(fromVal < toVal)
            return fromVal + (toVal - fromVal) * multiplier;

        else if(fromVal > toVal)
            return fromVal - (fromVal - toVal) * multiplier;

        else
            return toVal;
    }

    /**
     * Get array of polygon points
     * @param {string} points <polygon points="">
     * @return {PolygonPoint[]}
     */
    static pointsStrToArr(points){
        let pointsArr = points.split(' ');

        // Convert each value into xy object
        pointsArr = pointsArr.map((point) =>{
            let pointArr = point.split(','),
                pointObj = {
                    x: parseFloat(pointArr[0]),
                    y: parseFloat(pointArr[1])
                };

            return (isNaN(pointObj.x) || isNaN(pointObj.y)) ? null : pointObj;
        });

        // Check for null in the array
        pointsArr.forEach((pointObj) =>{
            if(!pointObj)
                throw new Error('Empty point object');
        });

        return pointsArr;
    }

    /**
     * @param {PolygonPoint[]} arr
     * @param {number} roundPrecision
     * @return {string}
     */
    static arrToPointsStr(arr, roundPrecision = 2){
        arr = arr.map((pointObj) => `${roundTo(pointObj.x, 2)},${roundTo(pointObj.y, 2)}`);
        return arr.join(' ');
    }

    // Private
    // ----------------------------------------------------

    /**
     * @param {number} multiplier - Value from 0 to 1
     * @return {string} - points
     * @private
     */
    _getNewPoints(multiplier){
        let pointsArrNow = [];

        // Get current animation points
        this._pointsArrFrom.forEach((pointObjFrom, i) =>{
            let pointObjTo = this._pointsArrTo[i];

            pointsArrNow.push({
                x: Polymate.getMiddleVal(pointObjFrom.x, pointObjTo.x, multiplier),
                y: Polymate.getMiddleVal(pointObjFrom.y, pointObjTo.y, multiplier)
            });
        });

        return Polymate.arrToPointsStr(pointsArrNow);
    }

}

// ----------------------------------------------------

$.fn.polymate = function(options){
    return this.each(function(){
        let polymate = new Polymate($(this), options);
        $(this).data("polymate", polymate);
    });
};

// ----------------------------------------------------

export default Polymate;

