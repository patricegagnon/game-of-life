const canevas = document.getElementById('myCanvas')
const playPauseButton = document.getElementById('playPauseButton')
const generationInput = document.getElementById('generation')

const CANEVAS_WIDTH = 1600
const CANEVAS_HEIGHT = 600
const GRID_COLS = 120

const DARK_MODE = true
const GRID_COLOR = DARK_MODE ? '#808080' : '#cccccc'
const CELL_COLOR = DARK_MODE ? '#84C1FF' : '#93C4FF'
const BACKGROUND_COLOR = DARK_MODE ? '#000000': 'white'

class GameOfLifeBoard {
  constructor(canevas, generationInput, canevasWidth, canevasHeight, gridCols, readOnly = false) {
    this.canevas = canevas
    this.ctx = canevas.getContext('2d')
    this.canevasWidth = canevasWidth
    this.canevasHeight = canevasHeight
    this.gridCols = gridCols
    this.caseSize = canevasWidth / gridCols
    this.gridRows = Math.floor(canevasHeight / this.caseSize)
    this.generation = 1
    this.mouseDrawing = false
    this.mouseCurrentCell = null
    this.mouseDownCell = null
    this.mouseDownActivate = true
    this.initCells()
    if (!readOnly) this.initListeners()
    this.generationInput = generationInput
  }

  initCells = () => {
    this.cells = this.createBlankGrid()
  }
  onClick = (callback) => {
    this.canevas.addEventListener('click', (event) => {
      callback(event)
    })
  }
  initListeners = () => {
    this.canevas.addEventListener('mousemove', (event) => {
      if (this.mouseDrawing) {
        const mousePreviousCell = this.mouseCurrentCell
        this.mouseCurrentCell = this.getMouseEventCell(event)

        if (!this.isSameCell(mousePreviousCell, this.mouseCurrentCell)) {
          this.cells[this.mouseCurrentCell.col][this.mouseCurrentCell.row] = this.mouseDownActivate ? 1 : 0
          this.redrawAll()
        }
      }

    })

    this.canevas.addEventListener('mousedown', (event) => {
      this.mouseCurrentCell = this.getMouseEventCell(event)
      this.mouseDownCell = this.getMouseEventCell(event)
      this.mouseDrawing = true
      //Mode activer ou désactiver les cellules sur mouseMove
      this.mouseDownActivate = !this.cells[this.mouseCurrentCell.col][this.mouseCurrentCell.row]

    })

    this.canevas.addEventListener('mouseout', (event) => {
      this.mouseCurrentCell = null
      this.mouseDownCell = null
      this.mouseDrawing = false
    })

    this.canevas.addEventListener('mouseup', (event) => {
      if (this.mouseDrawing && this.mouseDownCell) {
        this.mouseCurrentCell = this.getMouseEventCell(event)
        if (this.isSameCell(this.mouseCurrentCell, this.mouseDownCell)) {
          this.cells[this.mouseCurrentCell.col][this.mouseCurrentCell.row] = this.cells[this.mouseCurrentCell.col][this.mouseCurrentCell.row] ? 0 : 1
          this.redrawAll()
        }
      }
      this.mouseDrawing = false
      this.mouseCurrentCell = null
      this.mouseDownCell = null
    })
  }
  getMouseEventCell = (event) => {
    const col = Math.floor(event.offsetX / this.caseSize)
    const row = Math.floor(event.offsetY / this.caseSize)
    return {col, row}
  }
  createBlankGrid = () => {
    const result = []
    for (let col = 0; col < this.gridCols; col++) {
      result[col] = []
      for (let row = 0; row < this.gridRows; row++) {
        result[col][row] = 0
      }
    }
    return result
  }
  drawAllCells = () => {
    this.ctx.beginPath()
    this.ctx.fillStyle = CELL_COLOR
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const cellActive = this.cells[col][row]
        if (cellActive) {
          this.ctx.rect(this.xy(col), this.xy(row), this.caseSize, this.caseSize)
        }
      }
    }
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.fillStyle = BACKGROUND_COLOR
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const cellActive = this.cells[col][row]
        if (!cellActive) {
          this.ctx.rect(this.xy(col), this.xy(row), this.caseSize, this.caseSize)
        }
      }
    }
    this.ctx.fill()
    this.ctx.beginPath()
    this.ctx.strokeStyle = GRID_COLOR
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const cellActive = this.cells[col][row]
        if (!cellActive) {
          this.ctx.rect(this.xy(col), this.xy(row), this.caseSize, this.caseSize)
        }
      }
    }
    this.ctx.stroke()
  }
  redrawAll = () => {
    this.drawAllCells()
  }

  nextGeneration = () => {
    const newCells = this.createBlankGrid()
    for (let col = 0; col < this.gridCols; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const neighbourCellCount = this.countActiveNeighbourCells(col, row)
        if (this.cells[col][row]) {
          newCells[col][row] = neighbourCellCount === 2 || neighbourCellCount === 3 ? 1 : 0
        } else {
          newCells[col][row] = neighbourCellCount === 3 ? 1 : 0
        }

      }
    }
    this.cells = newCells
    this.generation++
    this.generationInput.innerHTML = this.generation
    this.redrawAll()
  }

  countActiveNeighbourCells = (col, row) => {
    let count = 0
    for (let i = col - 1; i <= col + 1; i++) {
      for (let j = row - 1; j <= row + 1; j++) {
        if (i >= 0 && j >= 0 && i < this.gridCols && j < this.gridRows && !(i === col && j === row)) {
          if (this.cells[i][j]) count++
        }
      }
    }
    return count
  }
  reset = () => {
    this.generation = 1
    this.initCells()
    this.generationInput.innerHTML = this.generation
    this.redrawAll()
  }
  insertTemplate = (template, col, row) => {
    for (let i = 0; i < template.length; i++) {
      for (let j = 0; j < template[i].length; j++) {
        this.cells[col + i][row + j] = template[i][j]
      }
    }
    this.redrawAll()
  }

  randomizeCells = () => {
    for (let col = 0; col < this.gridCols ; col++) {
      for (let row = 0; row < this.gridRows; row++) {
        const random = Math.floor(Math.random() * 101)
        this.cells[col][row] = random <= 50 ? 1 : 0

      }
    }
    this.redrawAll()
  }
  getMouseEventCell = (event) => {
    const col = Math.floor(event.offsetX / this.caseSize)
    const row = Math.floor(event.offsetY / this.caseSize)
    return {col, row}
  }
  isSameCell = (cell1, cell2) => {
    if (!cell1 || !cell2) return false
    return cell1.col === cell2.col && cell1.row === cell2.row
  }
  xy = (coord) => {
    return coord * this.caseSize
  }
}







const showCells = () => {
  //text.value = JSON.stringify(cells)
  const modal = document.getElementById('debug')
  modal.style.display = 'block'
  modal.style.paddingRight = '17px'
  modal.className = 'modal fade show'
  document.getElementById('debugJson').innerHTML = JSON.stringify(board.cells)
}

const closeModal = () => {
  const modal = document.getElementById('debug')
  modal.style.display = 'none'
  modal.style.paddingRight = '17px'
  modal.className = ''
}


let play = false
let interval = null
const playPause = () => {
  if (!play) {
    play = true
    interval = setInterval(board.nextGeneration, 50)
    playPauseButton.innerText = 'Pause'
  } else {
    play = false
    clearInterval(interval)
    playPauseButton.innerText = 'Play'
  }

}

const reset = () => {
  board.reset()
}

const randomizeCells = () => {
  board.randomizeCells()
}



const board = new GameOfLifeBoard(canevas, generationInput, CANEVAS_WIDTH, CANEVAS_HEIGHT, GRID_COLS)

board.redrawAll()


const templates = {}
//Attention, c'est array[col][row]
templates.plane = [[0, 0, 1], [1, 0, 1], [0, 1, 1]]
templates.doubleCross = [
  [0, 1, 0],[1, 1, 1],[0, 1, 0],[0, 0 ,0],[0, 1, 0],[1, 1, 1],[0, 1, 0],
]
templates.explodingJet = [
  [1,1,0,0,0,1,1],[0,1,1,1,1,1,0],[0,0,1,1,1,0,0],[0,0,0,1,0,0,0]
]

const planeTemplate = new GameOfLifeBoard(document.getElementById("plane"), null , 100, 100, 3, true)
planeTemplate.insertTemplate(templates.plane, 0, 0)
planeTemplate.redrawAll()
planeTemplate.onClick(event => {
  board.insertTemplate(templates.plane, 30, 0)
  board.redrawAll()
})

const doubleCrossTemplate = new GameOfLifeBoard(document.getElementById("doubleCross"), null , 175, 75, 7, true)
doubleCrossTemplate.insertTemplate(templates.doubleCross, 0, 0)
doubleCrossTemplate.redrawAll()
doubleCrossTemplate.onClick(event => {
  board.insertTemplate(templates.doubleCross, 50, 20)
  board.redrawAll()
})

const explodingJetTemplate = new GameOfLifeBoard(document.getElementById("explodingJet"), null , 40, 70, 4, true)
explodingJetTemplate.insertTemplate(templates.explodingJet, 0, 0)
explodingJetTemplate.redrawAll()
explodingJetTemplate.onClick(event => {
  board.insertTemplate(templates.explodingJet, 50, 20)
  board.redrawAll()
})



