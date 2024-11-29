console.log('This site was developed by CertifiKate https://github.com/CertifiKate');

const darkMode = "dark";
const lightMode = "light";
const autoColorMode = "autoMode";
const defaultMode = lightMode;

const colorSchemeStorageKey = "colorScheme";


// Get user prefered scheme
const colorSchemeQueryList = window.matchMedia('(prefers-color-scheme: dark)');


function getIcon(){
    var container = document.getElementById("colorSchemeButton");
    if (container) {
        return container.querySelector("svg");
    }
    return null;
}

function getCurrentColorScheme(){

    var current = document.documentElement.getAttribute("color-mode");
    if (current == darkMode) return darkMode;

    return lightMode;
}

function setColorScheme() {
    var desiredMode = autoColorMode;
    var colorSchemeToSet = lightMode;

    if (localStorage.getItem(colorSchemeStorageKey)){
        // User has been set
        desiredMode = localStorage.getItem(colorSchemeStorageKey);

        if (desiredMode != autoColorMode){
            colorSchemeToSet = desiredMode;
        }
    }else {
        desiredMode = autoColorMode;
    }

    if (desiredMode == autoColorMode && colorSchemeQueryList) {
        // An overwrite is not set (or is set to auto), so pull from browser
        // Attempt to match the user prefered browser theme
        colorSchemeToSet = colorSchemeQueryList.matches ? darkMode : lightMode;
    } else {
        colorSchemeToSet = colorSchemeToSet;
    }

    if (colorSchemeToSet == darkMode){
        document.documentElement.setAttribute("color-mode", "dark");
    }else {
        document.documentElement.setAttribute("color-mode", "light");
    }

    updateColorSchemeIcon(colorSchemeToSet);
}
setColorScheme(colorSchemeQueryList);

function setUserColorScheme(){
    var current = getCurrentColorScheme();


    localStorage.setItem(colorSchemeStorageKey, current == lightMode ? darkMode : lightMode);

    setColorScheme();
}

function updateColorSchemeIcon(current){
    var icon = getIcon();
    if (!icon) return;
    
    if (current == darkMode){
        icon.setAttribute("data-feather", "eye-off");
    }else {
        icon.setAttribute("data-feather", "eye");
    }
    feather.replace();
}
