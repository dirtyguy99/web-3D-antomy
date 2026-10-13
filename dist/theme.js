export function readTheme(){try{return sessionStorage.getItem('explorer-theme')==='dark'}catch{return false}}
export function saveTheme(dark){try{sessionStorage.setItem('explorer-theme',dark?'dark':'light')}catch{}}
