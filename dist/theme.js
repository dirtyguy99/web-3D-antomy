// The new palette opens in white/green; subsequent light/dark choices stay in the session.
const themeKey='explorer-theme-nature';
export function readTheme(){try{return sessionStorage.getItem(themeKey)==='dark'}catch{return false}}
export function saveTheme(dark){try{sessionStorage.setItem(themeKey,dark?'dark':'light')}catch{}}
