"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.GuardAnt = exports.ScubaAnt = exports.EaterAnt = exports.ThrowerAnt = exports.GrowerAnt = exports.Ant = exports.Bee = exports.Insect = void 0;
/**
 * Comments for the ants.ts File by Victoria Senn.
 */
var game_1 = require("./game");
/**
 * Abstract Insect class that becomes subdivided into Ant and Bee.
 */
var Insect = /** @class */ (function () {
    function Insect(armor, place) {
        this.armor = armor;
        this.place = place;
    }
    Insect.prototype.getName = function () { return this.name; };
    Insect.prototype.getArmor = function () { return this.armor; };
    Insect.prototype.getPlace = function () { return this.place; };
    Insect.prototype.setPlace = function (place) { this.place = place; };
    /**
     * Reduces the armor of an Insect by a given amount.
     * If armor is depleted the insect is removed from the map.
     * @param amount
     * @returns True or False
     */
    Insect.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        if (this.armor <= 0) {
            console.log(this.toString() + ' ran out of armor and expired');
            this.place.removeInsect(this);
            return true;
        }
        return false;
    };
    Insect.prototype.toString = function () {
        return this.name + '(' + (this.place ? this.place.name : '') + ')';
    };
    return Insect;
}());
exports.Insect = Insect;
/**
 * Extension of the Insect class.
 * Deals with Bee creation, actions, and status.
 */
var Bee = /** @class */ (function (_super) {
    __extends(Bee, _super);
    function Bee(armor, damage, place) {
        var _this = _super.call(this, armor, place) || this;
        _this.damage = damage;
        _this.name = 'Bee';
        return _this;
    }
    /**
     * Bee stings given ant, reducing its armor.
     * @param ant
     * @returns amount of damage inflicted to given ant.
     */
    Bee.prototype.sting = function (ant) {
        console.log(this + ' stings ' + ant + '!');
        return ant.reduceArmor(this.damage);
    };
    /**
     * Indicates if Bee is blocked by an ant.
     * @returns True or False
     */
    Bee.prototype.isBlocked = function () {
        return this.place.getAnt() !== undefined;
    };
    Bee.prototype.setStatus = function (status) { this.status = status; };
    /**
     * Determines if Bee is blocked by an ant.
     * If so, checks status to see if Bee can attack.
     * If not checks if Bee status prohibits movement.
     * Bee then attacks or exits, respectively, if possible.
     */
    Bee.prototype.act = function () {
        if (this.isBlocked()) {
            if (this.status !== 'cold') {
                this.sting(this.place.getAnt());
            }
        }
        else if (this.armor > 0) {
            if (this.status !== 'stuck') {
                this.place.exitBee(this);
            }
        }
        this.status = undefined;
    };
    return Bee;
}(Insect));
exports.Bee = Bee;
/**
 * Extension of the Insect class.
 * Deals with ant food cost and granting boosts.
 */
var Ant = /** @class */ (function (_super) {
    __extends(Ant, _super);
    function Ant(armor, foodCost, place) {
        if (foodCost === void 0) { foodCost = 0; }
        var _this = _super.call(this, armor, place) || this;
        _this.foodCost = foodCost;
        return _this;
    }
    Ant.prototype.getFoodCost = function () { return this.foodCost; };
    Ant.prototype.setBoost = function (boost) {
        this.boost = boost;
        console.log(this.toString() + ' is given a ' + boost);
    };
    return Ant;
}(Insect));
exports.Ant = Ant;
/**
 * Extends Ant class.
 * Deals with food and boost generation.
 */
var GrowerAnt = /** @class */ (function (_super) {
    __extends(GrowerAnt, _super);
    function GrowerAnt() {
        var _this = _super.call(this, 1, 1) || this;
        _this.name = "Grower";
        return _this;
    }
    /**
     * Deals with food and boost generation.
     * @param colony
     */
    GrowerAnt.prototype.act = function (colony) {
        var roll = Math.random();
        if (roll < 0.6) {
            colony.increaseFood(1);
        }
        else if (roll < 0.7) {
            colony.addBoost('FlyingLeaf');
        }
        else if (roll < 0.8) {
            colony.addBoost('StickyLeaf');
        }
        else if (roll < 0.9) {
            colony.addBoost('IcyLeaf');
        }
        else if (roll < 0.95) {
            colony.addBoost('BugSpray');
        }
    };
    return GrowerAnt;
}(Ant));
exports.GrowerAnt = GrowerAnt;
/**
 * Extends Ant class.
 * Deals with Thrower ant attack.
 */
var ThrowerAnt = /** @class */ (function (_super) {
    __extends(ThrowerAnt, _super);
    function ThrowerAnt() {
        var _this = _super.call(this, 1, 4) || this;
        _this.name = "Thrower";
        _this.damage = 1;
        return _this;
    }
    /**
     * Determines what boost ant has, then attacks closest Bee with boosted effect.
     * Also attacks if ant is not currently boosted.
     */
    ThrowerAnt.prototype.act = function () {
        if (this.boost !== 'BugSpray') {
            var target = void 0;
            if (this.boost === 'FlyingLeaf')
                target = this.place.getClosestBee(5);
            else
                target = this.place.getClosestBee(3);
            if (target) {
                console.log(this + ' throws a leaf at ' + target);
                target.reduceArmor(this.damage);
                if (this.boost === 'StickyLeaf') {
                    target.setStatus('stuck');
                    console.log(target + ' is stuck!');
                }
                if (this.boost === 'IcyLeaf') {
                    target.setStatus('cold');
                    console.log(target + ' is cold!');
                }
                this.boost = undefined;
            }
        }
        else {
            console.log(this + ' sprays bug repellant everywhere!');
            var target = this.place.getClosestBee(0);
            while (target) {
                target.reduceArmor(10);
                target = this.place.getClosestBee(0);
            }
            this.reduceArmor(10);
        }
    };
    return ThrowerAnt;
}(Ant));
exports.ThrowerAnt = ThrowerAnt;
/**
 * Extends Ant class.
 * Deals with Eater ant status and attack.
 */
var EaterAnt = /** @class */ (function (_super) {
    __extends(EaterAnt, _super);
    function EaterAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.name = "Eater";
        _this.turnsEating = 0;
        _this.stomach = new game_1.Place('stomach');
        return _this;
    }
    /**
     * Determines if given ant has already eaten a bee.
     * @returns True or False
     */
    EaterAnt.prototype.isFull = function () {
        return this.stomach.getBees().length > 0;
    };
    /**
     * Determines if ant is already eating.
     * If not ant tries to eat closest bee.
     * If ant has been eating for three previous turns the bee is removed from play.
     */
    EaterAnt.prototype.act = function () {
        console.log("eating: " + this.turnsEating);
        if (this.turnsEating == 0) {
            console.log("try to eat");
            var target = this.place.getClosestBee(0);
            if (target) {
                console.log(this + ' eats ' + target + '!');
                this.place.removeBee(target);
                this.stomach.addBee(target);
                this.turnsEating = 1;
            }
        }
        else {
            if (this.turnsEating > 3) {
                this.stomach.removeBee(this.stomach.getBees()[0]);
                this.turnsEating = 0;
            }
            else
                this.turnsEating++;
        }
    };
    /**
     * Determines ant armor amount.
     * Determines if ant is eating.
     * If not eating damage is then calculated.
     * If eating and armor is less than zero, bee escapes, then ant is removed.
     * If armor is above zero bee escapes, then damaged is calculated.
     * @param amount
     * @returns damage amount
     */
    EaterAnt.prototype.reduceArmor = function (amount) {
        this.armor -= amount;
        console.log('armor reduced to: ' + this.armor);
        if (this.armor > 0) {
            if (this.turnsEating == 1) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
                this.turnsEating = 3;
            }
        }
        else if (this.armor <= 0) {
            if (this.turnsEating > 0 && this.turnsEating <= 2) {
                var eaten = this.stomach.getBees()[0];
                this.stomach.removeBee(eaten);
                this.place.addBee(eaten);
                console.log(this + ' coughs up ' + eaten + '!');
            }
            return _super.prototype.reduceArmor.call(this, amount);
        }
        return false;
    };
    return EaterAnt;
}(Ant));
exports.EaterAnt = EaterAnt;
/**
 * Extends Ant class.
 * Deals with Scuba attack.
 */
var ScubaAnt = /** @class */ (function (_super) {
    __extends(ScubaAnt, _super);
    function ScubaAnt() {
        var _this = _super.call(this, 1, 5) || this;
        _this.name = "Scuba";
        _this.damage = 1;
        return _this;
    }
    /**
     * Determines what boost ant has, then attacks closest Bee with boosted effect.
     * Also attacks if ant is not currently boosted.
     */
    ScubaAnt.prototype.act = function () {
        if (this.boost !== 'BugSpray') {
            var target = void 0;
            if (this.boost === 'FlyingLeaf')
                target = this.place.getClosestBee(5);
            else
                target = this.place.getClosestBee(3);
            if (target) {
                console.log(this + ' throws a leaf at ' + target);
                target.reduceArmor(this.damage);
                if (this.boost === 'StickyLeaf') {
                    target.setStatus('stuck');
                    console.log(target + ' is stuck!');
                }
                if (this.boost === 'IcyLeaf') {
                    target.setStatus('cold');
                    console.log(target + ' is cold!');
                }
                this.boost = undefined;
            }
        }
        else {
            console.log(this + ' sprays bug repellant everywhere!');
            var target = this.place.getClosestBee(0);
            while (target) {
                target.reduceArmor(10);
                target = this.place.getClosestBee(0);
            }
            this.reduceArmor(10);
        }
    };
    return ScubaAnt;
}(Ant));
exports.ScubaAnt = ScubaAnt;
/**
 * Extends Ant class.
 * Deals with Guard action.
 */
var GuardAnt = /** @class */ (function (_super) {
    __extends(GuardAnt, _super);
    function GuardAnt() {
        var _this = _super.call(this, 2, 4) || this;
        _this.name = "Guard";
        return _this;
    }
    GuardAnt.prototype.getGuarded = function () {
        return this.place.getGuardedAnt();
    };
    /**
     * Guard has no action except to intercept damage.
     */
    GuardAnt.prototype.act = function () { };
    return GuardAnt;
}(Ant));
exports.GuardAnt = GuardAnt;
