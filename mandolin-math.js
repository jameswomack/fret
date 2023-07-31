// Function to calculate the distance between two points (coordinates)
export function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export const notes = [ 
  'A',
  'Bb:A#',
  'B',
  'C',
  'Db:C#',
  'D',
  'Eb:D#',
  'E',
  'F',
  'Gb:F#',
  'G',
  'Ab:G#'
]

export function getNoteRelative (note, indexRelativeToNote) {
  // let retVal = null

  const noteIndex = notes.indexOf(note)
  // (typeof indexRelativeToNote === 'bigint' ? parseInt(indexRelativeToNote) : indexRelativeToNote)
  const index = noteIndex + indexRelativeToNote

  // TODO: something like `notes[(index - (notes.length * Math.floor(index / notes.length)))]`
  // if (index >= notes.length * 3) {
  //   retVal = notes[(index - (notes.length * 3))]
  // }
  // else if (index >= notes.length * 2) {
  //   retVal = notes[(index - (notes.length * 2))]
  // }
  // else if (index >= notes.length) {
  //   retVal = notes[(index - notes.length)]
  // }
  // else if (index < 0) {
  //   retVal = notes[(notes.length+index)]
  // }
  // else {
  //   retVal = notes[index];
  // } 

  // return retVal

  // Infinite / circular indexed access of notes (e.g. below 0 & above 11)
  return notes[(index - (notes.length * Math.floor(index / notes.length)))]
}