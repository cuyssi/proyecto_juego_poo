const cortinilla = document.querySelector(".cortinilla");
const btn = document.querySelector(".btn");
btn.addEventListener("click", () => {
    cortinilla.style.display = "none";
});


class Game {//en esta parte vamos a generar todos los elementos importantes del juego que heredaran propiedades de otras clases que están fuera de la clase game
    constructor() {//en el constructor añadimos las propiedades y metodos que vamos a utilizar
        this.container = document.getElementById("game-container")
        this.persona = null;
        this.nubes = [];
        this.bloques = [];
        this.puntuacion = 0;
        this.puntos = 5;
        this.gameOver = false;
        this.ganado = false;
        this.crearEscenario();
        this.agregarEventos();
        this.puntosElement = document.getElementById("puntos");
        this.nube = new Audio("./sounds/cogeNube.mp3")
        this.ganar =new Audio("./sounds/gana.mp3")
        this.perder = new Audio("./sounds/pierde.mp3")
    }

    crearEscenario() {//creamos los elementos que apareceran en la escena con sus propiedades heredadadas de las clases que crearemos despues y añadimos un espacio para ellas en el html
        //personaje
        this.personaje = new Personaje();
        this.container.appendChild(this.personaje.element);
        
        
        
        // bloques
        if (this.bloques.length === 0) {//los bloques se crean atraves de la clase bloque y directamente le decimos su altura y donde queremos que aparezcan
            const bloque1 = new Bloque(200, 0, 250); // Altura personalizada para bloque1
            bloque1.element.classList.add("bloque1");

            const bloque2 = new Bloque(500, 150, 250); // Altura personalizada para bloque2
            bloque2.element.classList.add("bloque2");

            this.bloques.push(bloque1, bloque2);//los añadimos al array y creamos su espacio
            this.container.appendChild(bloque1.element);
            this.container.appendChild(bloque2.element);
        }
        
        //nubes
        for(let i = 0; i < 5; i++) {
            const nube = new Nube(this.bloques);
            this.nubes.push(nube);
            this.container.appendChild(nube.element);

            
        }    
    }

    agregarEventos() {//con este metodo escuchamos todo lo que pase en la ventana, como en este caso, que se pulse una tecla
        window.addEventListener("keydown", (e) =>this.personaje.mover(e));
        this.checkColisiones();
    }

    checkColisiones() {//aqui vamos a condicionar lo que pasa cuando el personaje colisiona con los elementos
        const revisarColisiones = () => {
            if (this.gameOver || this.ganado) return;//si se ha perdido el juego o ganado se retorna para que no entre en bucle

            //si el personaje recoge una nube la elimina del array y del html, suena el sonido de nube y actualiza el contador de puntos
            this.nubes.forEach((nube, index) => {
                if (this.personaje.colisionaCon(nube)) {
                    this.container.removeChild(nube.element);
                    this.nubes.splice(index, 1);      
                    this.nube.currentTime = 0;//le indico que resetee el tiempo de reproducir otra vez el sonido para que suene sin esperas en cada nube             
                    this.nube.play();
                    this.actualizarPuntuacion(1); // Actualizamos la puntuación cada vez que se recoge una nube
                    let nuevaNube = new Nube(this.bloques);//aqui creamos una nube nueva en el array por cada una que eliminamos
                    if (!nuevaNube.solapada) {
                        this.nubes.push(nuevaNube);
                        this.container.appendChild(nuevaNube.element);
                    }
                }
            });

            // si alcanzamos 100 puntos ganamos la partida, se activa la alerta y suena la musica, volvemos a la pantalla de inicio
            if (this.puntuacion >= 100 && !this.ganado) {
                this.ganar.play();
                alert("¡Has ganado! 🎉");
                this.gameOver = true;
                setTimeout(() => {//esto es para que el sonido se pueda reproducir antes de que recarge la pagina
                    location.reload();
                }, 2000);
            
                return;
            }

            //si el personaje colisiona con los bloques perdemos la partida, se activa la alerta y suena la musica, volvemos a la pantalla de inicio
            this.bloques.forEach((bloque) => {
                if (this.personaje.colisionaCon(bloque)) {
                    this.gameOver = true; 
                    this.perder.play() // Reproducir sonido al perder                    
                    alert("¡Has perdido! 😞");
                    location.reload();
                }
            });
            requestAnimationFrame(revisarColisiones);//utilice este metodo mejor porque hace que vaya todo mas fluido
        };
        requestAnimationFrame(revisarColisiones);
    }

    actualizarPuntuacion() {//esta es la manera de actualizar los puntos y que aparezcan en pantalla
        this.puntuacion += this.puntos;
        this.puntosElement.innerHTML = `PUNTOS: ${this.puntuacion}`;
    }    
}

class Personaje {//en esta parte vamos a generar todos los elementos importantes del personaje
    constructor() {//generamos las propiedades y metodos principales del personaje y le creamos su lugar en el html
        this.x=50;
        this.y = 300;
        this.width = 50;
        this.height = 50;
        this.velocidad = 10;
        this.saltando = false;
        this.velY = 0; //velocidad vertical
        this.gravedad = 0.5; //gravedad más suave para descenso controlado
        this.impulso = -8; //impulso hacia arriba
        this.maxVelY = 1; //velocidad máxima de caída
        this.saltosRestantes = 20; //para permitir doble salto
        this.element = document.createElement("div");
        this.element.classList.add("personaje");
        this.actualizarPosicion();
        this.animar(); // Inicia el bucle de movimiento
    }

    mover(evento) {//aqui vamos a declarar los eventos de las teclas y lo que debe de suceder con cada una
        if(evento.key === "ArrowRight") {//tambien transformamos la clase de style para que gire dependiendo de la direccion
            this.x += this.velocidad;
            this.element.style.transform = "scaleX(-1)";
        } else if(evento.key === "ArrowLeft") {
            this.x -= this.velocidad;
            this.element.style.transform = "scaleX(1)";
        } else if(evento.key === "ArrowUp") {
            this.saltar();
        } 
        this.actualizarPosicion();//actualizamos la posicion del personaje
    }

    saltar() {
        if (this.saltosRestantes > 0) {//le he metido que pueda hacer varios saltos
            this.velY = this.impulso; //aplica impulso hacia arriba
            this.saltosRestantes--; //reduce el número de saltos permitidos
        }
    }

    animar() {
        setInterval(() => {
            this.velY += this.gravedad; //creo un intervalo para que los movimientos sean mas suaves y pueda hacer el efecto de flappy
            if (this.velY > this.maxVelY) this.velY = this.maxVelY; //limita velocidad de caída
            
            this.y += this.velY; //aplica el movimiento vertical

            //evita que caiga por debajo del suelo
            if (this.y >= 300) {
                this.y = 300;
                this.velY = 0;
                this.saltosRestantes = 40; //resetea los saltos cuando toca el suelo
            }

            this.actualizarPosicion();//actualiza la posicion
        }, 20);
    }

    actualizarPosicion() {//aqui es donde se actualiza la posicion, se le llama desde varias partes del codigo 
        const gameContainer = document.getElementById("game-container");
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    //evitamos que salga por los lados
    if (this.x < 0){
        this.x = 0;
    } 
    if (this.x + this.width > containerWidth) {
        this.x = containerWidth - this.width;
    } 
    
    if (this.y < 0) {
        this.y = 0;//evitamos que suba más allá del techo
    }    
   
    if (this.y >= containerHeight - this.height) { //evitamos que caiga por debajo del suelo
        this.y = containerHeight - this.height;
        this.velY = 0;
        this.saltosRestantes = 40; //resetea los saltos cuando toca el suelo
    }
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
   
    colisionaCon(objeto) {
        return (//estas son las coordenadas para escuchar las colisiones
            this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y
        );
    }    
}

class Nube {//en esta parte vamos a generar todos los elementos importantes de la nube 
    constructor(bloques) {
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("nube");
        //-------------------------esta parte es para que las nubes no salgan encima de los bloques
        this.solapada = true; //verifica si se solapan
        let intentos = 0;
        while (this.solapada && intentos < 50) { //evita bucles infinitos
            this.x = Math.random() * 700 + 50;//generamos las nubes de manera aleatoria, luego comprueba si se solapan
            this.y = Math.random() * 250 + 50;
            this.solapada = bloques.some(bloque =>
                this.x < bloque.x + bloque.width &&
                this.x + this.width > bloque.x &&
                this.y < bloque.y + bloque.height &&
                this.y + this.height > bloque.y
            );
            intentos++;//si se solapan lo vuelve a intentar
        }

        if (!this.solapada) { // solo añade la nube si encontró un buen sitio
            this.actualizarPosicion();
        }
    }

    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

class Bloque {
    constructor(x, y, height = 250) {//generamos las propiedades y metodos principales de las nubes y le creamos su lugar en el html
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = 50;
        this.element = document.createElement("div");
        this.element.className = "bloque";
        this.element.style.left = `${this.x}px`;//estilos con las posiciones
        this.element.style.top = `${this.y}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.width = `${this.width}px`;

        document.getElementById("game-container").appendChild(this.element);

        //esta parte es para ajustar el margen de colision de los bloques
        const containerRect = document.getElementById("game-container").getBoundingClientRect();
        const blockRect = this.element.getBoundingClientRect();

        //ajustar por el borde del contenedor (10px)
        this.absX = blockRect.left - containerRect.left + 10;
        this.absY = blockRect.top - containerRect.top + 10;
    }
}
   


const juego = new Game();