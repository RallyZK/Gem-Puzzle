const body = document.querySelector('body');

const header = document.createElement('header');
body.appendChild(header);

const headerdivWrapper = document.createElement('div');
headerdivWrapper.className = 'wrapper';
header.appendChild(headerdivWrapper);

const h1 = document.createElement('h1');
h1.innerHTML = 'Gem Puzzle';
headerdivWrapper.appendChild(h1);

const headerH2 = document.createElement('h2');
headerH2.innerHTML = `Gem Puzzle is the classic game as for kids as for adults.<br/>Game goal is to arrange moving numbered tiles by order. You have to do it moving as less tiles as
        possible and as quick as you can.`;
headerdivWrapper.appendChild(headerH2);

// окно выйгрыша

const transparentList = document.createElement('div');
transparentList.className = 'transparent-list display-none';
headerdivWrapper.appendChild(transparentList);

const alertWindow = document.createElement('div');
alertWindow.className = 'alert display-none';
headerdivWrapper.appendChild(alertWindow);

const alertH2 = document.createElement('h2');
alertH2.innerHTML = 'Hooray! You solved the puzzle in ##:## and N moves!';
alertWindow.appendChild(alertH2);

const restart = document.createElement('button');
restart.className = 'buttons__item';
restart.innerHTML = 'Restart';
alertWindow.appendChild(restart);

// кнопки управления

const main = document.createElement('main');
body.appendChild(main);

const buttonsWrapper = document.createElement('div');
buttonsWrapper.className = 'buttons';
main.appendChild(buttonsWrapper);

// const stopGame = document.createElement('button');
// stopGame.className = 'buttons__item';
// stopGame.innerHTML = 'Stop';
// buttonsWrapper.appendChild(stopGame);

const saveGame = document.createElement('button');
saveGame.className = 'buttons__item';
saveGame.innerHTML = 'Save';
buttonsWrapper.appendChild(saveGame);

const startGame = document.createElement('button');
startGame.className = 'buttons__item orange-btn';
startGame.innerHTML = 'Suffle and start';
buttonsWrapper.appendChild(startGame);

const results = document.createElement('button');
results.className = 'buttons__item';
results.innerHTML = 'Results';
buttonsWrapper.appendChild(results);

// статистика игры

const gameStatsWrapper = document.createElement('div');
gameStatsWrapper.className = 'game-stats';
main.appendChild(gameStatsWrapper);

const movesText = document.createElement('h3');
movesText.style.width = '100px'
movesText.innerHTML = 'Moves: 0';
gameStatsWrapper.appendChild(movesText);
let moves = 0;

const timeText = document.createElement('h3');
timeText.style.width = '120px'
timeText.innerHTML = 'Time: 00:00';
gameStatsWrapper.appendChild(timeText);

// таймер
let sec = 0, min = 0, timer = null;

function startTimer() {
    if (timer !== null) return;
    timer = setInterval(() => {
        sec = sec + 1;
        if (sec > 59) {
            min = min + 1
            sec = 0
        }
        timeText.innerHTML = fillTimeText(sec);
    }, 1000);
}

// вывод текущего времени игры
function fillTimeText(sec) {
    if (sec < 10) {
        if (min < 10) return `Time: 0${min}:0${sec}`
        else return `Time: ${min}:0${sec}`        
    } else {
        if (min < 10) return `Time: 0${min}:${sec}`
        else return `Time: ${min}:${sec}`        
    }
}

// звук

const sound = document.createElement('button');
sound.className = 'sound';
//sound.innerHTML = '&#128266;'
gameStatsWrapper.appendChild(sound);

let moveAudio = null, winAudio, isSoundOn = true;

// загрузка звука щелчка
async function loadAudio() {
    moveAudio = new Audio('./assets/click.mp3');
    winAudio = new Audio('./assets/winsound.mp3')
}
loadAudio()

// вкл и выкл звука щелчка
sound.addEventListener('click', () => {
    if (isSoundOn) isSoundOn = false
    else isSoundOn = true
    soundOnOff()    
})

function soundOnOff() {
    sound.classList.toggle('sound-off')
    if (isSoundOn) loadAudio()
    else moveAudio = null;
}

// игровое поле

const gameWrapper = document.createElement('div');
gameWrapper.className = 'game';
main.appendChild(gameWrapper);

// кнопки для выбора размера игрового поля

const sizesWrapper = document.createElement('div');
sizesWrapper.className = 'sizes';
buttonsWrapper.after(sizesWrapper);


for (let i = 3; i < 9; i++) {
    const size = document.createElement('button');
    if (i === 4) {
        size.className = 'sizes__item checked';
    } else size.className = 'sizes__item';
    size.innerHTML = `${i} &#215; ${i}`;
    sizesWrapper.appendChild(size);
}

let size = 4; // размер поля по умолчанию
let blankNumber = size ** 2; // пустой квадратик
let itemNodes, countItems, shuffledArr = [], matrix;

// создание игрового поля
function createItems() {
    itemNodes = [];
    countItems = size ** 2;
    let values = new Array(size ** 2).fill(0).map((el, index) => index + 1);

    for (let i = 0; i < size ** 2; i++) {
        const item = document.createElement('button');
        item.className = 'game__item hidden';
        item.style.width = 100 / size + '%';
        item.style.height = 100 / size + '%';
        item.innerHTML = `${values[i]}`
        item.setAttribute('data-matrix-id', `${values[i]}`);
        itemNodes.push(item)
        gameWrapper.appendChild(item);
    }
    changeFontSize()
}
createItems()

// обновление игрвого поля при смене размера и рестарте игры
function update() {
    matrix = getMatrix(itemNodes.map((item) => Number(item.dataset.matrixId)))
    itemNodes[countItems - 1].style.display = 'none'
    setPositionItems(matrix)
}
update()

startGame.addEventListener('click', () => {
    // isGameStarted = true;           
    initGame()
})

let maxShuffleCount = size ** 3
let timerForSwipes;

// начало игры
function initGame() {
    let shuffleCount = 0;
    clearInterval(timerForSwipes);

    if (shuffleCount === 0) {
        timerForSwipes = setInterval(() => {
           // console.log('matrix in initGame', matrix)
            randomSwap(matrix)
            setPositionItems(matrix)
            shuffleCount = shuffleCount + 1

            if (shuffleCount >= maxShuffleCount) {
                clearInterval(timerForSwipes)
                moves = 0;
                sec = 0;
            }
        }, 5)
    }

    for (let i = 0; i < itemNodes.length; i++) {
        itemNodes[i].classList.remove('hidden')
    }

    updateStatistics()
    if (size === 6 || size === 7 || size === 8) {
        setTimeout(startTimer, 5000)
    } else {
        setTimeout(startTimer, 500)
    }

}

// рандомный шаффл
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// перемешивание
let blockedCoords = null; // координаты квадратика, который уже был сдвинут
function randomSwap(matrix) {
    const blankCoords = findCoordsByNumber(blankNumber, matrix)
    const validCoords = findValidCoords({ blankCoords, matrix, blockedCoords })
    const swapCoords = validCoords[Math.floor(Math.random() * validCoords.length)]
    swipeForShuffle(blankCoords, swapCoords, matrix)
    blockedCoords = blankCoords;
    // console.log('validCoords:', validCoords)
    //console.log('swapCoords:', swapCoords)
}

function findValidCoords({ blankCoords, matrix, blockedCoords }) {
    const validCoords = [];
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (isValidForSwipe({ x, y }, blankCoords)) {
                if (blockedCoords === null || !(blockedCoords.x === x && blockedCoords.y === y)) {
                    validCoords.push({ x, y })
                }
            }
        }
    }
    return validCoords
}

function setPositionItems(matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const value = matrix[y][x];
            const node = itemNodes[value - 1]
            setNodeStyle(node, x, y)
        }
    }
}

function setNodeStyle(node, x, y) {    
    node.style.transform = `translate3D(${x * 100}%, ${y * 100}%, 0)`
}

function getMatrix(arr) {    
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix.push([])
    }
    let y = 0;
    let x = 0;
    for (let i = 0; i < arr.length; i++) {
        if (x >= size) {
            y++
            x = 0
        }
        matrix[y][x] = arr[i]
        x++
    }
    return matrix
}

function updateStatistics() {
    sec = 0;
    min = 0;
    timeText.innerHTML = fillTimeText(sec);
    moves = 0;
    movesText.innerHTML = `Moves: ${moves}`;
}

// определение по какому квадратику произошел клик
gameWrapper.addEventListener('click', event => {

    const buttonNode = event.target.closest('button');  //кнопка по которой кликнули
    if (!buttonNode) return
    //console.log(buttonNode)

    const buttonNumber = Number(buttonNode.dataset.matrixId) // номер кпопки
    //console.log(Number(buttonNode.dataset.matrixId))

    const buttonCoords = findCoordsByNumber(buttonNumber, matrix) // координаты кнопки
    const blankCoords = findCoordsByNumber(blankNumber, matrix) // координаты пустоты
    //console.log(buttonCoords)
    //console.log(blankCoords)

    const isValid = isValidForSwipe(buttonCoords, blankCoords) // возможна ли замена
    //console.log(isValid)

    if (isValid) {
        swipe(buttonCoords, blankCoords, matrix)
        setPositionItems(matrix)
    }
})

function findCoordsByNumber(number, matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (number === matrix[y][x]) {
                return { x, y }
            }
        }
    }
    return null
}

function isValidForSwipe(coords1, coords2) {
    const diffX = Math.abs(coords1.x - coords2.x)
    const diffY = Math.abs(coords1.y - coords2.y)
    return (diffX === 1 || diffY === 1) && (coords1.x === coords2.x || coords1.y === coords2.y)
}

// если поле не перемешано, то свайп не происходит
//let isGameStarted = false;

function swipeForShuffle(coords1, coords2, matrix) {
    const coords1Number = matrix[coords1.y][coords1.x]
    matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x]
    matrix[coords2.y][coords2.x] = coords1Number
    //console.log('matrix in swipeforShuffle', matrix)
}

function swipe(coords1, coords2, matrix) {

    //if (isGameStarted) {
    const coords1Number = matrix[coords1.y][coords1.x]
    matrix[coords1.y][coords1.x] = matrix[coords2.y][coords2.x]
    matrix[coords2.y][coords2.x] = coords1Number
    if (isSoundOn) moveAudio.play();
    moves++
    movesText.innerHTML = `Moves: ${moves}`;
   // console.log('matrix in swipe', matrix)
    if (checkWin(matrix)) {
        if (isSoundOn) winAudio.play()
        setTimeout(() => { itemNodes.forEach(el => el.classList.add('green')) }, 300)
        setTimeout(gameoverScreen, 2000)
        setTimeout(() => { itemNodes.forEach(el => el.classList.remove('green')) }, 1000)
    }
    // else alert('Click "Shuffle and Start" to start the game')
}

function checkWin(matrix) {
    const winArr = new Array(size ** 2).fill(0).map((el, index) => index + 1);
    const flatMatrix = matrix.flat()

    for (let i = 0; i < flatMatrix.length; i++) {
        if (flatMatrix[i] !== winArr[i]) {
            return false
        }
    }
    return true
}

function gameoverScreen() {
    transparentList.classList.remove('display-none')
    alertWindow.classList.remove('display-none')
    alertH2.innerHTML = `Hooray! You solved the puzzle in ${min}:${sec} and ${moves} moves!`
}

restart.addEventListener('click', () => {
    transparentList.classList.add('display-none');
    alertWindow.classList.add('display-none');
    updateResults()
    addResultsToPage()
    updateStatistics()
    startTimer()
    update()
    initGame()
})


// кнопки выбора размера поля
const sizes = document.querySelectorAll('.sizes__item')

for (let i = 0; i < sizes.length; i++) {
    sizes[i].onclick = function () {

        // if (isGameStarted) {
        //     isGameStarted = false
        // }

        for (let j = 0; j < sizes.length; j++) {
            if (i !== j) sizes[j].classList.remove('checked')
            else sizes[i].classList.add('checked')
        }

        if (i === 0) {
            size = 3
            maxShuffleCount = size ** 6
        }
        else if (i === 1) size = 4
        else if (i === 2) {
            size = 5
            maxShuffleCount = size ** 4
        } else if (i === 3) size = 6
        else if (i === 4) size = 7
        else if (i === 5) size = 8

        blankNumber = size ** 2; //номер пустоты
        maxShuffleCount = size ** 3  //max кол-во свайпов при перемешивании

        if (document.querySelector('.game__item')) deletePreviousItems()
        createItems()
        update()
        updateStatistics()
        clearInterval(timer);
        timer = null;
    }
}

function changeFontSize() {
    let buttons = document.querySelectorAll('.game__item')
    if (size === 3) buttons.forEach(el => el.style.fontSize = '2.8rem')
    if (size === 4) buttons.forEach(el => el.style.fontSize = '2.3rem')
    if (size === 5) buttons.forEach(el => el.style.fontSize = '2rem')
    if (size === 8) buttons.forEach(el => el.style.fontSize = '1.2rem')
}
changeFontSize()

function deletePreviousItems() {
    const lastItems = document.querySelectorAll('.game__item')
    for (let i = 0; i < lastItems.length; i++) {
        lastItems[i].remove()
    }
}


// результаты
const resultsWrapper = document.createElement('div');
resultsWrapper.className = 'results display-none';
main.appendChild(resultsWrapper);

const closeResultsButton = document.createElement('button');
closeResultsButton.className = 'results__close_button';
closeResultsButton.innerHTML = '&#10006;'
resultsWrapper.appendChild(closeResultsButton);

const resultsTitle = document.createElement('h2');
resultsTitle.innerHTML = 'Top 10 Results'
resultsWrapper.appendChild(resultsTitle);

const resultsList = document.createElement('ol');
resultsList.className = 'results__list';
resultsWrapper.appendChild(resultsList);

results.addEventListener('click', () => {
    resultsWrapper.classList.remove('display-none')
    transparentList.classList.remove('display-none')
})

// transparentList.addEventListener('click', () => {
//     resultsWrapper.classList.add('display-none')
//     transparentList.classList.add('display-none')
// })

closeResultsButton.addEventListener('click', () => {
    resultsWrapper.classList.add('display-none')
    transparentList.classList.add('display-none')
})

let resultsArr = [];
const maxResCount = 10;

// запись результатов по кнопке restart

function updateResults() {
    const date = new Date().toLocaleDateString()
    const res = { 'moves': moves, 'time': `${min}:${sec}`, 'size': `${size} &#215; ${size}`, 'date': date }
    resultsArr.push(res)
    resultsArr.sort((a, b) => a.moves > b.moves ? 1 : -1);
    if (resultsArr.length > maxResCount) resultsArr.pop()
    saveToLS()
    console.log('resultsArr:', resultsArr)
}

function addResultsToPage() {
    if (resultsList.querySelector('li')) {
        const prevList = resultsList.querySelectorAll('li')
        prevList.forEach(el => el.remove())
    }
    resultsArr.forEach(el => {
        const resultsItem = document.createElement('li');
        resultsItem.innerHTML = `Moves: ${el.moves} Time:${el.time} Size: ${el.size} (${el.date})`
        resultsList.appendChild(resultsItem);
    })
}

// сохранение игры

let savedMatrix = []
let isGameSaves = false
let savedSec, savedMin, savedMoves, savedSize

saveGame.addEventListener('click', () => {
    if (isGameSaves === false) {
        isGameSaves = true
        saveGame.innerHTML = 'Continue saved game'
        // savedMatrix = matrix
        // savedSec = sec
        // savedMin = min
        // savedMoves = moves
        // savedSize = size
    } else {
        isGameSaves = false
        saveGame.innerHTML = 'Save'
        // matrix = savedMatrix
        // sec = savedSec
        // min = savedMin
        // moves = savedMoves
        // size = savedSize
        // createItems()
        // setPositionItems(matrix)
        
        // updateStatistics()
    }
    //saveGame.classList.toggle('blue-btn')   
    //console.log(' savedMatrix:',  savedMatrix);
})

// Local Storage
function saveToLS() {
    localStorage.setItem("Results", JSON.stringify(resultsArr));
}
//console.log('Лучшие результаты из Local Storage:', localStorage.getItem('Results'));
if (localStorage.getItem("Results")) {
    resultsArr = JSON.parse(localStorage.getItem("Results"));
    addResultsToPage()
}