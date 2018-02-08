'use strict';

/* Add those globals to JSHint */
/* global describe, expect, it, before, beforeEach, after, afterEach */

import $ from 'jquery';
import Polymate from 'polymate';

// ----------------------------------------------------

describe('Polymate', () =>{

    let $polygon = $('<polygon points="7.4,10.4 7.4,10.4 17.1,21.2 17.1,25 17.1,30 20.5,27.5 20.5,27.5 20.5,24.5"/>'),
        polymate;

    it('should init', () =>{
        expect(() => new Polymate($polygon)).toThrow();

        $polygon.attr('data-animate-to', '12,9 9,12 15.7,18.7 9,25.7 11.9,28.59 18.6,21.9 25.6,28.59 28.5,25.7');

        expect(() => $polygon.polymate()).not.toThrow();
        expect(() => polymate = new Polymate($polygon)).not.toThrow();
        expect(polymate._node).toBe($polygon.data('polymate')._node);

    });

    it('should complete animation', (done) =>{
        let statPoints = $polygon.attr('points');

        polymate.options = {
            duration: 50,
            complete : _firstComplete
        };

        function _firstComplete(){
            expect($polygon.attr('points')).toBe($polygon.attr('data-animate-to'));
            polymate.options.complete = _secondComplete;
            polymate.start(true);
        }

        function _secondComplete(){
            expect($polygon.attr('points')).toBe(statPoints);
            done();
        }

        polymate.start();
    });

    it('should get middle val', () =>{
        expect(() => Polymate.getMiddleVal()).toThrow();
        expect(() => Polymate.getMiddleVal(1, 2, 50)).toThrow();
        expect(() => Polymate.getMiddleVal(1, 2, -10)).toThrow();
        expect(Polymate.getMiddleVal(1, 2, 0.5)).toBe(1.5);
        expect(Polymate.getMiddleVal(1, 2, 0)).toBe(1);
        expect(Polymate.getMiddleVal(1, 2, 1)).toBe(2);
    });
});