class Map {
    constructor() {
        $("#joueur1 button,#joueur2 button").hide()
        this.fight = false
        this.numberOfGreyCells = 15 // nombre de cellules grisées dans la carte
        this.numberOfLines = 10 // nombre de lignes dans la carte
        this.numberOfCells = 10 // nombre de cellules par ligne dans la carte
        this.elements = [] // élements de la cartes

        // generation de la carte "création de la carte"
        this.createMap()

        // positionnement des blocks noirs
        for (var i = 0; i < this.numberOfGreyCells; i++) {
            this.positionElement(new Black())
        }

        //creation des joueurs
        this.positionElement(new Player('player1  player armes1', 100));
        this.positionElement(new Player('player2 player armes1_1', 100));

        //creation des armes
        this.positionElement(new Arme('armes2', 15, 'Fusil'));
        this.positionElement(new Arme('armes3', 20, 'Fusil à pompe'));
        this.positionElement(new Arme('armes4', 25, 'Lance-roquette'));

        //Filtre les joueurs present dans le tableau element
        this.players = this.elements.filter(function (element) {
            return element instanceof Player
        })

        this.players[0].ajouteArme(new Arme('armes1', 10, 'Revolver', this.players[0].position))
        $('.sante-p1').html(this.players[0].sante)
        $('.arme-p1').html(this.players[0].arme.name + " " + this.players[0].arme.degat + " degats")

        this.players[1].ajouteArme(new Arme('armes1_1', 10, 'Revolver', this.players[1].position))
        $('.sante-p2').html(this.players[1].sante)
        $('.arme-p2').html(this.players[1].arme.name + " " + this.players[1].arme.degat + " degats")

        //Quel joueur debute la partie
        this.currentPlayer = Math.floor(Math.random() * this.players.length)

        // on affiche dès le début la portée des déplacements du joueur ,pour ca il nous faut la position du joueur
        this.showRange(this.players[this.currentPlayer].position)


        //modal
        $("#info .modal-body").html("Le joueur " + (this.currentPlayer + 1) + " commence")
        $("#info").modal({
            show: true
        })
    }


    // Cette fonction showRange(position) permet d affiche la portée des déplacements un joueur
    showRange(position) {
        let moves = this.getMoves(position);
        moves.forEach(move => { // recupere toute les valeur du tableau
            this.getCell(move).addClass("range");
        });

    }
    //change les armes quand un player marche sur une arme
    switchArmes(newArme, oldArme) {
        this.elements.push(oldArme)
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].classCss == newArme.classCss) {
                this.elements.splice(i, 1)
                break
            }
        }
        this.players[this.currentPlayer].arme = newArme //changement armes
        $(".arme-p" + (this.currentPlayer + 1)).html(newArme.name + " " + newArme.degat + " degats")
        $(this.getCell(oldArme.position)).addClass(oldArme.classCss) // changement armes sur le plateau
    }

    movePlayers(selectedPosition) { // cette fonction gere le déplacement graphique du joueur, et met a jour sa position dans les données du jeu. Elle change également d arme si le joueur marche sur une arme
        let newArme = this.getCellElement(selectedPosition, Arme)
        let selectedCell = this.getCell(selectedPosition) // recupere la cellule cliker
        let armePlayers = this.players[this.currentPlayer].arme

        $(selectedCell).addClass("player player" + (this.currentPlayer + 1) + " " + armePlayers.classCss) // ajoute sur cette cellule les class player (coloris la cases)
        this.getCell(this.players[this.currentPlayer].position).removeClass("player player" + (this.currentPlayer + 1) + " " + armePlayers.classCss) //recupere la cellule du joueur courant et lui retire les classe player(retire la couleur du joueur)
        $(".range").removeClass("range") // retire la couleur des case grise ( n'affiche plus la porte "deplacement joueur")
        this.players[this.currentPlayer].position = selectedPosition // mets a jour a la position du joueur courant
        this.players[this.currentPlayer].arme.position = selectedPosition
        if (newArme) {
            this.switchArmes(newArme, armePlayers)
        }
    }

    createMap() { // créer la carte et gere les actions qui peuvent etre executées sur la carte (click)
        let table = $('<table/>')
        for (let y = 0; y < this.numberOfLines; y++) {
            let tr = $('<tr/>')
            for (let x = 0; x < this.numberOfCells; x++) {
                let td = $('<td/>')

                    .data('x', x)
                    .data('y', y)
                    .click(event => { // fonction fléchée pour ne pas redéfinir la variable this
                        // on récupère la celulle cliquée avec event.target
                        let x = $(event.target).data('x');
                        let y = $(event.target).data('y');

                        // récupères les déplacements possible
                        let moves = this.getMoves(this.players[this.currentPlayer].position);

                        // moves.some permet de vérifer si la celulle cliquée fait parties des déplacements possibles
                        if (moves.some(move => {
                                return move.x === x && move.y === y
                            })) {
                            let selectedPosition = {
                                x: x,
                                y: y
                            }

                            this.movePlayers(selectedPosition)

                            this.getNextPlayer() // change de joueur               
                        }

                    })

                tr.append(td)
            }
            table.append(tr)
        }
        $('#container').append(table)
    }

    /**
     * Fonction/Methode chargée de positionner un élément sur la carte à une position aléatoire
     */
    // position du joueur aleatoire
    positionElement(element) {
        let position = this.getRandomPosition()
        if (element instanceof Player) {
            while (this.getCellElement({
                    x: position.x,
                    y: position.y - 1,
                }, Player) != undefined || this.getCellElement({
                    x: position.x,
                    y: position.y + 1,
                }, Player) != undefined || this.getCellElement({
                    x: position.x - 1,
                    y: position.y,
                }, Player) != undefined || this.getCellElement({
                    x: position.x + 1,
                    y: position.y,
                }, Player) != undefined) {
                position = this.getRandomPosition()
            }
        }
        element.position = position
        this.elements.push(element)

        let cell = this.getCell(position)
        cell.addClass(element.classCss) // ajouter la class(css) className à la cellule

    }


    /**
     * Retourner les coordonnées d'une cellule vide
     */
    getRandomPosition() {
        let randomX = Math.floor(Math.random() * this.numberOfCells) // Calculer une valeur aléatoire entre 0 et this.numberOfCells (exclu)
        let randomY = Math.floor(Math.random() * this.numberOfLines) // Calculer une valeur aléatoire entre 0 et this.numberOfLines (exclu)

        if (this.cellHasElement(randomX, randomY)) {
            return this.getRandomPosition()
        }

        return {
            x: randomX,
            y: randomY,
        }
    }
    /**
     *	Vérifie si une cellule contient un élément ou non
     */
    // doit parcourir les elements présent dans le tableau et vérifier si un autre élément se trouve au coordonnée indiquée
    cellHasElement(X, Y) {
        for (let i = 0; i < this.elements.length; i++) {
            if (
                this.elements[i].position.x === X &&
                this.elements[i].position.y === Y
            ) {
                return true
            }
        }
        return false
    }

    // retourne une cellule a partir d'une position 
    getCell(position) {
        return $('table tr:nth(' + position.y + ') td:nth(' + position.x + ')') //recupere dans la table la cellule au coordonnee position.y position.x
    }

    // change de joueur et vérifie si il y a un gagnant
    getNextPlayer() {

        this.currentPlayer++
        if (this.currentPlayer >= this.players.length) {
            this.currentPlayer = 0
        }

        this.showRange(this.players[this.currentPlayer].position)
    }

    // retourne les positions des cases sur lesquelles le joueur peut se déplacer
    getMoves(position) {
        let moves = [];
        for (let x = position.x - 1; x >= position.x - 3; x--) {
            if (x >= 0) { // si on ne sort pas du plateau de jeu
                let cell = this.getCell({
                    x: x,
                    y: position.y,
                }) // on recupere la cellule qu on analyse
                if ($(cell).hasClass('black') || $(cell).hasClass('player')) break // si la case est occupée, pas besoin de checker les cases plus a gauche: le joueur est bloqué ici, on sort donc du for
                else moves.push({
                    x: x,
                    y: position.y,
                })
            }
        }

        for (let y = position.y - 1; y >= position.y - 3; y--) {
            if (y >= 0) { // si on ne sort pas du plateau de jeu
                let cell = this.getCell({
                    x: position.x,
                    y: y,
                }) // on recupe la cellule qu on analyse
                if ($(cell).hasClass('black') || $(cell).hasClass('player')) break // si la case est occupée, pas besoin de checker les cases plus a gauche: le joueur est bloqué ici, on sort donc du for
                else moves.push({
                    x: position.x,
                    y: y,
                })
            }
        }
        for (let x = position.x + 1; x <= position.x + 3; x++) {
            if (x < this.numberOfCells) { // si on ne sort pas du plateau de jeu
                let cell = this.getCell({
                    x: x,
                    y: position.y,
                }) // on recupe la cellule qu on analyse
                if ($(cell).hasClass('black') || $(cell).hasClass('player')) break // si la case est occupée, pas besoin de checker les cases plus a gauche: le joueur est bloqué ici, on sort donc du for
                else moves.push({
                    x: x,
                    y: position.y,
                })
            }
        }
        for (let y = position.y + 1; y <= position.y + 3; y++) {
            if (y < this.numberOfLines) { // si on ne sort pas du plateau de jeu
                let cell = this.getCell({
                    x: position.x,
                    y: y,
                }) // on recupe la cellule qu on analyse
                if ($(cell).hasClass('black') || $(cell).hasClass('player')) break // si la case est occupée, pas besoin de checker les cases plus a gauche: le joueur est bloqué ici, on sort donc du for
                else moves.push({
                    x: position.x,
                    y: y,
                })
            }
        }
        return moves;
    }

    // renvois l element avec la classe "objet" a la position spécifiée
    getCellElement(position, object) {
        return this.elements.find(function (element) {
            return element instanceof object && position.x == element.position.x && position.y == element.position.y;
        })
    }



}