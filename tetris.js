const fs = require('fs')

const COLUMN_COUNT = 10
const SHAPES = {
	Q: [
		[1, 1],
		[1, 1]
	],
	Z: [
		[1, 1, 0],
		[0, 1, 1],
	],
	S: [
		[0, 1, 1],
		[1, 1, 0],
	],
	T: [
		[1, 1, 1],
		[0, 1, 0],
	],
	I: [
		[1, 1, 1, 1],
	],
	L: [
		[1, 0],
		[1, 0],
		[1, 1],
	],
	J: [
		[0, 1],
		[0, 1],
		[1, 1],
	],
}

function generateShapeMatrix(shapeStr) {
	const [shapeName, posStr] = shapeStr.split('')
	const position = parseInt(posStr)

	
	const shape = SHAPES[shapeName]	

	const shapeMatrix = shape.reduce((acc, shapeRow) => {
		const left = Array(position).fill(0)
		const right = Array(COLUMN_COUNT - position - shapeRow.length).fill(0)

		const row = [...left, ...shapeRow, ...right]

		acc.push(row)
		return acc
	}, [])

	return shapeMatrix
}

function deepCopy(arr) {
	return JSON.parse(JSON.stringify(arr))
}

function addRows(arr, before, after=0) {
	const beforeRows = Array(before).fill(Array(COLUMN_COUNT).fill(0))
	const afterRows = Array(after).fill(Array(COLUMN_COUNT).fill(0))

	return [...beforeRows, ...arr, ...afterRows]
}

function isRowFilled(row) {
	return row.every(elem => elem === row[0])
}

function merge(board, shapeMatrix) {
	let newBoard = deepCopy(board)

	for (let i = 0; i < newBoard.length; i++) {
		for (let j = 0; j < newBoard[i].length; j++) {
			newBoard[i][j] += shapeMatrix[i][j]
		}
	}

	return newBoard
}

function canBeMerged(board) {
	return JSON.stringify(board).indexOf('2') === -1
}

function displayMatrix(matrix) {
	matrix.forEach(row => {
		console.log(row.join(''))
	})
}

function getNextBoard(board, shapeMatrix) {
	if (board.length === 0) {
		return shapeMatrix
	}

	const newBoard = addRows(board, shapeMatrix.length - 1)

	let nextBoard

	for (let afterRowCount = newBoard.length - shapeMatrix.length; afterRowCount >= 0; afterRowCount--) {
		const beforeRowCount = newBoard.length - shapeMatrix.length - afterRowCount
		const newShapeMatrix = addRows(shapeMatrix, beforeRowCount, afterRowCount)
		const merged = merge(newBoard, newShapeMatrix)

		if (canBeMerged(merged)) {
			nextBoard = merged.filter(row => !isRowFilled(row))
		} else {
			break
		}
	}

	return nextBoard || shapeMatrix.concat(board)
}

function getTetrisResult(shapes) {
	let board = []

	shapes.forEach(shape => {
		board = getNextBoard(board, generateShapeMatrix(shape))
	})

	return board.length
}

if (process.argv.length < 4) {
	console.log('Please provide input and output file names')
	console.log('	Usage: node tetris.js {input filename} {output filename}')
	process.exit(1)
}

const inputFilename = process.argv[2]
const outputFilename = process.argv[3]

fs.readFile(inputFilename, 'utf8', (err, data) => {
  if (err) {
  	console.log('Failed to open file')
  	process.exit(1)
  }

  const inputs =
  	data
  		.split('\n')
  		.filter(elem => !!elem)
  		.map(elem => elem.replace(/\s/g, '').split(','))

  const outputs = inputs.reduce((acc, input) => {
  	const output = getTetrisResult(input)
  	acc.push(input.join(', '))
  	acc.push('\n')
  	acc.push(output)
  	acc.push('\n\n')
  	return acc
  }, [])

  fs.writeFile(outputFilename, outputs.join(''), (err) => {
	  if (err) {
	  	console.log(err)
	  }
	})
})
