class Fakemon{
    constructor(name, ability, move1, move2, move3, move4, hp, atk, def, spa, spd, spe) {
        this.name = name;
        this.ability = ability;
        this.moves = [move1, move2, move3, move4];
        this.evs = [hp, atk, def, spa, spd, spe];
    }
}