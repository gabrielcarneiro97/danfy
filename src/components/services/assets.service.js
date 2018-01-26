export function cursorCarregando () {
  document.getElementsByTagName('body')[0].style.cursor = 'wait'
}

export function cursorNormal () {
  document.getElementsByTagName('body')[0].style.cursor = 'auto'
}
