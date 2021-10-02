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
exports.AntColony = exports.Hive = exports.Place = exports.AntGame = void 0;
/**
 * Comments for the game.ts File by Victoria Senn.
 */
var ants_1 = require("./ants");
/**
 * Class deals with positioning of insect objects, and tunnel entraces/exits.
 * Includes methods for placing, removing, and getting all insects.
 */
var Place = /** @class */ (function () {
    function Place(name, water, exit, entrance) {
        if (water === void 0) { water = false; }
        this.name = name;
        this.water = water;
        this.exit = exit;
        this.entrance = entrance;
        this.bees = [];
    }
    Place.prototype.getExit = function () { return this.exit; };
    Place.prototype.setEntrance = function (place) { this.entrance = place; };
    /**
     * Determines if tunnel is full of water.
     * @returns True or False
     */
    Place.prototype.isWater = function () { return this.water; };
    Place.prototype.getAnt = function () {
        if (this.guard)
            return this.guard;
        else
            return this.ant;
    };
    Place.prototype.getGuardedAnt = function () {
        return this.ant;
    };
    Place.prototype.getBees = function () { return this.bees; };
    /**
     * Returns Bee closest to location.
     * If no bee is within range returns undefined.
     * @param maxDistance
     * @param minDistance
     * @returns Bee or Undefined.
     */
    Place.prototype.getClosestBee = function (maxDistance, minDistance) {
        if (minDistance === void 0) { minDistance = 0; }
        var p = this;
        for (var dist = 0; p !== undefined && dist <= maxDistance; dist++) {
            if (dist >= minDistance && p.bees.length > 0) {
                return p.bees[0];
            }
            p = p.entrance;
        }
        return undefined;
    };
    /**
     * Sets ant objects at map location.
     * If successful returns True.
     * If ant cannot be placed returns False.
     * @param ant
     * @returns True or False
     */
    Place.prototype.addAnt = function (ant) {
        if (ant instanceof ants_1.GuardAnt) {
            if (this.guard === undefined) {
                this.guard = ant;
                this.guard.setPlace(this);
                return true;
            }
        }
        else if (this.ant === undefined) {
            this.ant = ant;
            this.ant.setPlace(this);
            return true;
        }
        return false;
    };
    /**
     * Removes ant from map location.
     * @returns ant or guard ant
     */
    Place.prototype.removeAnt = function () {
        if (this.guard !== undefined) {
            var guard = this.guard;
            this.guard = undefined;
            return guard;
        }
        else {
            var ant = this.ant;
            this.ant = undefined;
            return ant;
        }
    };
    /**
     * Places bee at map location.
     * @param bee
     */
    Place.prototype.addBee = function (bee) {
        this.bees.push(bee);
        bee.setPlace(this);
    };
    /**
     * Removes bee from map location.
     * @param bee
     */
    Place.prototype.removeBee = function (bee) {
        var index = this.bees.indexOf(bee);
        if (index >= 0) {
            this.bees.splice(index, 1);
            bee.setPlace(undefined);
        }
    };
    /**
     * Removes all bees from the map.
     */
    Place.prototype.removeAllBees = function () {
        this.bees.forEach(function (bee) { return bee.setPlace(undefined); });
        this.bees = [];
    };
    /**
     * Removes bee from map location and places them at the nearest exit.
     * @param bee
     */
    Place.prototype.exitBee = function (bee) {
        this.removeBee(bee);
        this.exit.addBee(bee);
    };
    /**
     * Removes both insect types.
     * @param insect
     */
    Place.prototype.removeInsect = function (insect) {
        if (insect instanceof ants_1.Ant) {
            this.removeAnt();
        }
        else if (insect instanceof ants_1.Bee) {
            this.removeBee(insect);
        }
    };
    /**
     * Runs checks on placed insects to determine if removal is needed.
     */
    Place.prototype.act = function () {
        if (this.water) {
            if (this.guard) {
                this.removeAnt();
            }
            if (!(this.ant instanceof ants_1.ScubaAnt)) {
                this.removeAnt();
            }
        }
    };
    return Place;
}());
exports.Place = Place;
/**
 * Methods for creating waves of bees and managing their positioning.
 */
var Hive = /** @class */ (function (_super) {
    __extends(Hive, _super);
    function Hive(beeArmor, beeDamage) {
        var _this = _super.call(this, 'Hive') || this;
        _this.beeArmor = beeArmor;
        _this.beeDamage = beeDamage;
        _this.waves = {};
        return _this;
    }
    /**
     * Creates a new wave of Bee enemies, depending on how many are currently in the Hive.
     * @param attackTurn
     * @param numBees
     * @returns wave
     */
    Hive.prototype.addWave = function (attackTurn, numBees) {
        var wave = [];
        for (var i = 0; i < numBees; i++) {
            var bee = new ants_1.Bee(this.beeArmor, this.beeDamage, this);
            this.addBee(bee);
            wave.push(bee);
        }
        this.waves[attackTurn] = wave;
        return this;
    };
    /**
     * Places exsisting wave of Bees at ant colony entrances.
     * If there are no avaliable waves returns void.
     * @param colony
     * @param currentTurn
     * @returns wave or void
     */
    Hive.prototype.invade = function (colony, currentTurn) {
        var _this = this;
        if (this.waves[currentTurn] !== undefined) {
            this.waves[currentTurn].forEach(function (bee) {
                _this.removeBee(bee);
                var entrances = colony.getEntrances();
                var randEntrance = Math.floor(Math.random() * entrances.length);
                entrances[randEntrance].addBee(bee);
            });
            return this.waves[currentTurn];
        }
        else {
            return [];
        }
    };
    return Hive;
}(Place));
exports.Hive = Hive;
/**
 * Deals with ant resources such as food and boosts.
 * Also contains method initialzing Ant Colony's starting conditions.
 */
var AntColony = /** @class */ (function () {
    /**
     * Generates the starting conditions of the Ant Colony including moat, Ant Queen, and bee entrance locations.
     * @param startingFood
     * @param numTunnels
     * @param tunnelLength
     * @param moatFrequency
     */
    function AntColony(startingFood, numTunnels, tunnelLength, moatFrequency) {
        if (moatFrequency === void 0) { moatFrequency = 0; }
        this.places = [];
        this.beeEntrances = [];
        this.queenPlace = new Place('Ant Queen');
        this.boosts = { 'FlyingLeaf': 1, 'StickyLeaf': 1, 'IcyLeaf': 1, 'BugSpray': 0 };
        this.food = startingFood;
        var prev;
        for (var tunnel = 0; tunnel < numTunnels; tunnel++) {
            var curr = this.queenPlace;
            this.places[tunnel] = [];
            for (var step = 0; step < tunnelLength; step++) {
                var typeName = 'tunnel';
                if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) {
                    typeName = 'water';
                }
                prev = curr;
                var locationId = tunnel + ',' + step;
                curr = new Place(typeName + '[' + locationId + ']', typeName == 'water', prev);
                prev.setEntrance(curr);
                this.places[tunnel][step] = curr;
            }
            this.beeEntrances.push(curr);
        }
    }
    AntColony.prototype.getFood = function () { return this.food; };
    /**
     * Increases food by set amount.
     * @param amount
     */
    AntColony.prototype.increaseFood = function (amount) { this.food += amount; };
    AntColony.prototype.getPlaces = function () { return this.places; };
    AntColony.prototype.getEntrances = function () { return this.beeEntrances; };
    AntColony.prototype.getQueenPlace = function () { return this.queenPlace; };
    /**
     * Checks Queen Ant's map location for Bees.
     * @returns True or False
     */
    AntColony.prototype.queenHasBees = function () { return this.queenPlace.getBees().length > 0; };
    AntColony.prototype.getBoosts = function () { return this.boosts; };
    /**
     * Gives player a boost to use in game.
     * @param boost
     */
    AntColony.prototype.addBoost = function (boost) {
        if (this.boosts[boost] === undefined) {
            this.boosts[boost] = 0;
        }
        this.boosts[boost] = this.boosts[boost] + 1;
        console.log('Found a ' + boost + '!');
    };
    /**
     * Checks player's avaliable food and occupation of selected tunnel before placing ant.
     * @param ant
     * @param place
     * @returns message if tunnel is occupied or if player does not have enough food to place ant
     */
    AntColony.prototype.deployAnt = function (ant, place) {
        if (this.food >= ant.getFoodCost()) {
            var success = place.addAnt(ant);
            if (success) {
                this.food -= ant.getFoodCost();
                return undefined;
            }
            return 'tunnel already occupied';
        }
        return 'not enough food';
    };
    /**
     * Removes ant from map location.
     * @param place
     */
    AntColony.prototype.removeAnt = function (place) {
        place.removeAnt();
    };
    /**
     * Checks player's boosts and validates ant loaction before assigning boost.
     * @param boost
     * @param place
     * @returns message if player has no boosts, or tries to give boost to non-exsisting ant.
     */
    AntColony.prototype.applyBoost = function (boost, place) {
        if (this.boosts[boost] === undefined || this.boosts[boost] < 1) {
            return 'no such boost';
        }
        var ant = place.getAnt();
        if (!ant) {
            return 'no Ant at location';
        }
        ant.setBoost(boost);
        return undefined;
    };
    /**
     * Checks each ant location and removes those that cannot survive in water.
     */
    AntColony.prototype.antsAct = function () {
        var _this = this;
        this.getAllAnts().forEach(function (ant) {
            if (ant instanceof ants_1.GuardAnt) {
                var guarded = ant.getGuarded();
                if (guarded)
                    guarded.act(_this);
            }
            ant.act(_this);
        });
    };
    /**
     * Checks each bee location for water, if present removes bee.
     */
    AntColony.prototype.beesAct = function () {
        this.getAllBees().forEach(function (bee) {
            bee.act();
        });
    };
    /**
     * Checks each location for water.
     */
    AntColony.prototype.placesAct = function () {
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                this.places[i][j].act();
            }
        }
    };
    /**
     * Displays all ant locations.
     * @returns ants
     */
    AntColony.prototype.getAllAnts = function () {
        var ants = [];
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                if (this.places[i][j].getAnt() !== undefined) {
                    ants.push(this.places[i][j].getAnt());
                }
            }
        }
        return ants;
    };
    /**
     * Displays all bee locations.
     * @returns bees
     */
    AntColony.prototype.getAllBees = function () {
        var bees = [];
        for (var i = 0; i < this.places.length; i++) {
            for (var j = 0; j < this.places[i].length; j++) {
                bees = bees.concat(this.places[i][j].getBees());
            }
        }
        return bees;
    };
    return AntColony;
}());
exports.AntColony = AntColony;
/**
 * Deals with player turn. Assigns ant locations and boosts.
 * Also has method that determines if player has won the game.
 */
var AntGame = /** @class */ (function () {
    function AntGame(colony, hive) {
        this.colony = colony;
        this.hive = hive;
        this.turn = 0;
    }
    /**
     * Both sides take their actions
     */
    AntGame.prototype.takeTurn = function () {
        console.log('');
        this.colony.antsAct();
        this.colony.beesAct();
        this.colony.placesAct();
        this.hive.invade(this.colony, this.turn);
        this.turn++;
        console.log('');
    };
    AntGame.prototype.getTurn = function () { return this.turn; };
    /**
     * Determines is player has defeated all of the bees, thus winning the game.
     * @returns True, False, or Undefined
     */
    AntGame.prototype.gameIsWon = function () {
        if (this.colony.queenHasBees()) {
            return false;
        }
        else if (this.colony.getAllBees().length + this.hive.getBees().length === 0) {
            return true;
        }
        return undefined;
    };
    /**
     * Deploys given ant type to given map loaction.
     * @param antType
     * @param placeCoordinates
     * @returns message if ant type is unknown, or the coordinates were invalid.
     */
    AntGame.prototype.deployAnt = function (antType, placeCoordinates) {
        var ant;
        switch (antType.toLowerCase()) {
            case "grower":
                ant = new ants_1.GrowerAnt();
                break;
            case "thrower":
                ant = new ants_1.ThrowerAnt();
                break;
            case "eater":
                ant = new ants_1.EaterAnt();
                break;
            case "scuba":
                ant = new ants_1.ScubaAnt();
                break;
            case "guard":
                ant = new ants_1.GuardAnt();
                break;
            default:
                return 'unknown ant type';
        }
        try {
            var coords = placeCoordinates.split(',');
            var place = this.colony.getPlaces()[coords[0]][coords[1]];
            return this.colony.deployAnt(ant, place);
        }
        catch (e) {
            return 'illegal location';
        }
    };
    /**
     * Removes ant from given location.
     * @param placeCoordinates
     * @returns message if coordinates are invalid.
     */
    AntGame.prototype.removeAnt = function (placeCoordinates) {
        try {
            var coords = placeCoordinates.split(',');
            var place = this.colony.getPlaces()[coords[0]][coords[1]];
            place.removeAnt();
            return undefined;
        }
        catch (e) {
            return 'illegal location';
        }
    };
    /**
     * Grants given boost to ant at given coordinates.
     * @param boostType
     * @param placeCoordinates
     * @returns message if coordinates are invalid.
     */
    AntGame.prototype.boostAnt = function (boostType, placeCoordinates) {
        try {
            var coords = placeCoordinates.split(',');
            var place = this.colony.getPlaces()[coords[0]][coords[1]];
            return this.colony.applyBoost(boostType, place);
        }
        catch (e) {
            return 'illegal location';
        }
    };
    AntGame.prototype.getPlaces = function () { return this.colony.getPlaces(); };
    AntGame.prototype.getFood = function () { return this.colony.getFood(); };
    AntGame.prototype.getHiveBeesCount = function () { return this.hive.getBees().length; };
    AntGame.prototype.getBoostNames = function () {
        var boosts = this.colony.getBoosts();
        return Object.keys(boosts).filter(function (boost) {
            return boosts[boost] > 0;
        });
    };
    return AntGame;
}());
exports.AntGame = AntGame;
