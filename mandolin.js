import {calculateDistance, getNoteRelative} from './mandolin-math.js'

function getShortNoteForNote (note, {isSharpMode}) {
  const hasModifer = note.indexOf(':') !== -1
  const shortNote = !hasModifer ? note : (isSharpMode ? note.substr(3, 2) : note.substr(0, 2))
  return shortNote
}

async function getDetectedChords (data) {
  try {
    const response = await fetch("/rest/chord-detection", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error(error)
    return error
  }
}

function renderFretboard ({
  strings,
  fretCount,
  isSharpMode,
  fretboardMatrix,
}) {
  let fretBoard = ''

  // Construct fretboard
  for (let fretIndex = 0; fretIndex < fretCount; fretIndex++) {
    fretBoard = fretBoard + `<tr data-fret-index=${fretIndex}" class="${fretIndex===0?'nut':'fret'}">
      ${strings.map((s, sIndex) => {
        const {shouldUseSelectedClass} = fretboardMatrix[sIndex][fretIndex]
        const note = getNoteRelative(s, fretIndex)
        const shortNote = getShortNoteForNote(note, {isSharpMode})
        // TODO: "selected" needs to be span within td due to how border-radius works
        return `<td class="fret-string ${shouldUseSelectedClass?'selected':''}" data-string-index="${sIndex}" data-fret-index="${fretIndex}"><span class="note">${shortNote}</span></td>`
      }).join('')}
    </tr>`;
  }

  return fretBoard
}

function renderCaption ({
  isSharpMode,
  toggleSharpMode,
  tableElement
}) {
  const IS_SHARP_MODE_k = 'isSharpMode'

  // Use button to toggle whether sharps or flats are shown
  tableElement.caption.innerHTML = `<button data-toggle="${IS_SHARP_MODE_k}">${isSharpMode?'Flat':'Sharp'} Mode</button>`
  const buttonElement = document.querySelector(`button[data-toggle="${IS_SHARP_MODE_k}"]`)
  buttonElement.onclick = toggleSharpMode
}

function render (_props = {}) {
  // https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
  const props = { ..._props.tableElement.dataset, ..._props }
  const {
    isSharpMode = false,
    tuning,
    tuningDelimiter,
    fretCount,
    fretboardMatrix,
    resetKeyUpListener,
  } = props
  const tableElement = _props.tableElement

  // Could pass in `strings` from above if desired
  const strings = tuning.split(tuningDelimiter) 

  function toggleSharpMode () {
    render({
      ...props,
      isSharpMode: !isSharpMode,
    })
  }

  function didSelectCellFor (sIndex, fretIndex) {
    fretboardMatrix[sIndex][fretIndex].shouldUseSelectedClass = !fretboardMatrix[sIndex][fretIndex].shouldUseSelectedClass
  }

  const lastTableBodyElement = tableElement.tBodies.item(0)
  // Hack to reset event listeners on tbody
  const tableBodyElement = lastTableBodyElement.cloneNode()
  tableElement.removeChild(lastTableBodyElement)
  tableElement.appendChild(tableBodyElement)
  // (Re)inject body of the table containing mandolin fretboard & button
  tableBodyElement.innerHTML = renderFretboard({strings, fretCount, ...props})

  const chordNotes = []
  for (let sIndex = 0; sIndex < strings.length; sIndex++) {
    let alreadyFoundFretString = false
    for (let fretIndex = 0; fretIndex < fretCount && !alreadyFoundFretString; fretIndex++) {
      const {shouldUseSelectedClass} = fretboardMatrix[sIndex][fretIndex]
      alreadyFoundFretString = shouldUseSelectedClass

      if (alreadyFoundFretString) {
        const note = getNoteRelative(strings[sIndex], fretIndex)
        const shortNote = getShortNoteForNote(note, {isSharpMode})
        chordNotes.push(shortNote)
      }
    }
  }

  const defaultChordText = chordNotes.length > 1 ? `(${chordNotes.join(' ')})? Beats me!` : ''
  getDetectedChords(chordNotes)
    .then(detectedChords => 
      document.querySelector('#chord-detection').innerText = detectedChords.length ? detectedChords : defaultChordText)
    .catch(() =>
      document.querySelector('#chord-detection').innerText = defaultChordText)

  // pointer down event handler for the fretboard
  tableBodyElement.onpointerdown = function(event) {
    const pointerX = event.clientX // X-coordinate of the pointer down event
    const pointerY = event.clientY // Y-coordinate of the pointer down event

    // Get all the child cells (frets+strings combos) within the fretboard
    const childCells = tableElement.querySelectorAll('td.fret-string')

    let closestChildCell = null
    let minDistance = Infinity

    // Loop through all the child cells to find the closest one to the pointer down event
    childCells.forEach(function (childCell) {
      const rect = childCell.getBoundingClientRect() // Get the bounding rectangle of the child cell
      const centerX = rect.left + rect.width / 2     // X-coordinate of the center of the child cell
      const centerY = rect.top + rect.height / 2     // Y-coordinate of the center of the child cell

      // Calculate the distance between the click coordinates and the center of the child cell
      const distance = calculateDistance(pointerX, pointerY, centerX, centerY)

      // Update the closestChildCell & minDistance if the current child cell is closer
      if (distance < minDistance) {
        closestChildCell = childCell
        minDistance = distance
      }
    })

    const { stringIndex, fretIndex } = closestChildCell.dataset
    didSelectCellFor(stringIndex, fretIndex)
    render(props)
  }

  renderCaption({ ...props, toggleSharpMode })

  // Enable key 't' to toggle whether sharps or flats are shown
  resetKeyUpListener(function (e) {
    if (e.key === 't')
      toggleSharpMode()
  })
}

export {render}