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

    var button = document.getElementById("colorSchemeButton");
    if (button) {
        button.setAttribute("aria-pressed", current == darkMode ? "true" : "false");
    }

    if (current == darkMode){
        icon.setAttribute("data-feather", "eye-off");
    }else {
        icon.setAttribute("data-feather", "eye");
    }
    feather.replace();
}


// Homepage intro: type out the whoami command, then print its output line by line
function typeHomeCommand(){
    var typed = document.querySelector(".terminalTyped");
    if (!typed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var fetch = typed.closest(".homeFetch");
    var lines = fetch ? fetch.querySelectorAll(".faceContainer, .fetchHeading, .fetchRule, .fetchRow, .fetchSummary p, .terminalRepl") : [];
    var text = typed.textContent;
    var i = 0;

    typed.textContent = "";
    typed.classList.add("isTyping");
    lines.forEach(function(line){ line.classList.add("fetchPending"); });

    function printLines(){
        typed.classList.remove("isTyping");
        lines.forEach(function(line, n){
            setTimeout(function(){
                line.classList.remove("fetchPending");
                line.classList.add("fetchPrinted");
                if (n == lines.length - 1){
                    document.dispatchEvent(new Event("terminalReady"));
                }
            }, n * 70);
        });
    }

    function step(){
        typed.textContent = text.slice(0, ++i);
        if (i < text.length){
            setTimeout(step, 50 + Math.random() * 70);
        }else {
            setTimeout(printLines, 250);
        }
    }
    setTimeout(step, 400);
}
document.addEventListener("DOMContentLoaded", typeHomeCommand);


// Homepage terminal: a tiny shell with a handful of commands.
// Sites can extend it from their own js/site.js by listening for the "terminalsetup"
// event; its detail is the terminal API below (add to `commands`, push a function onto
// `handlers` to intercept input, or replace `completions`).
function setupTerminal(){
    var input = document.querySelector(".terminalInput");
    var output = document.querySelector(".terminalOutput");
    var dataEl = document.getElementById("terminalData");
    if (!input || !output || !dataEl) return;

    var data = JSON.parse(dataEl.textContent);
    var history = [];
    var historyIndex = 0;

    // Once someone starts typing, the card keeps its original height and scrolls inside
    // like a real terminal, rather than growing down the page
    var termBody = input.closest(".terminalBody");
    function lockHeight(){
        // Always measure with the whoami card showing, even if `clear` has hidden it
        var cleared = termBody.classList.contains("isCleared");
        termBody.classList.remove("isCleared");
        termBody.style.height = "";
        var height = termBody.offsetHeight - output.offsetHeight;
        if (cleared) termBody.classList.add("isCleared");
        termBody.style.height = height + "px";
        termBody.classList.add("isScrolling");
    }
    window.addEventListener("resize", function(){
        if (termBody.classList.contains("isScrolling")) lockHeight();
    });

    function scrollToBottom(){
        termBody.scrollTop = termBody.scrollHeight;
    }

    function print(text, className){
        var line = document.createElement("div");
        line.className = "terminalLine" + (className ? " " + className : "");
        line.textContent = text;
        output.appendChild(line);
        scrollToBottom();
        return line;
    }

    function printLinks(items){
        items.forEach(function(item){
            var line = print("  ");
            var link = document.createElement("a");
            link.href = item.url;
            link.textContent = item.title;
            line.appendChild(link);
        });
    }

    function go(url){
        print("→ " + url, "terminalMuted");
        setTimeout(function(){ window.location.href = url; }, 300);
    }

    function findLink(name){
        return data.links.filter(function(l){ return l.title.toLowerCase() == name; })[0];
    }

    // Wipe everything, the whoami card included, leaving just the prompt
    function clear(){
        output.textContent = "";
        termBody.classList.add("isCleared");
    }

    // Print a fresh copy of the whoami card, as if the command really ran again
    function printWhoami(){
        var copy = document.createElement("div");
        copy.className = "terminalWhoami";
        termBody.querySelectorAll(":scope > .fetchLayout, :scope > .fetchSummary").forEach(function(el){
            var clone = el.cloneNode(true);
            clone.classList.remove("fetchPending", "fetchPrinted");
            copy.appendChild(clone);
        });
        output.appendChild(copy);
        scrollToBottom();
    }

    var commands = {
        help: function(){
            print("available commands:");
            print("  whoami          who's this?");
            print("  ls              list what's here");
            print("  posts           latest blog posts");
            print("  projects        things I've built");
            print("  cd <dir>        go to blog or about");
            print("  github          open my GitHub");
            print("  linkedin        open my LinkedIn");
            print("  clear           clear the screen");
        },
        whoami: function(args){
            if (args.indexOf("--verbose") != -1 || args.indexOf("-v") != -1) return printWhoami();
            print(data.user + " - but you already scrolled past that ↑");
        },
        ls: function(){ print("blog/  about/  projects/"); },
        posts: function(){ printLinks(data.posts); },
        projects: function(){ printLinks(data.projects); },
        cd: function(args){
            var dir = (args[0] || "~").replace(/\/$/, "");
            if (dir == "blog") return go("/blog/");
            if (dir == "about" || dir == "projects") return go("/about/");
            if (dir == "~" || dir == ".") return;
            print("cd: no such file or directory: " + dir, "terminalError");
        },
        github: function(){ var l = findLink("github"); if (l) go(l.url); },
        linkedin: function(){ var l = findLink("linkedin"); if (l) go(l.url); },
        clear: clear,
        echo: function(args){ print(args.join(" ")); }
    };

    var terminal = {
        data: data,
        input: input,
        output: output,
        commands: commands,
        // Each is called as fn(raw, name, args) before the commands; return true if handled
        handlers: [],
        // Command names offered by tab completion
        completions: function(){ return Object.keys(commands); },
        print: print,
        clear: clear,
        focus: function(){ input.focus({ preventScroll: true }); }
    };

    function run(raw){
        if (!termBody.classList.contains("isScrolling")) lockHeight();

        var line = document.createElement("div");
        line.className = "terminalLine terminalEcho";
        line.innerHTML = input.parentElement.querySelector(".terminalPrompt").outerHTML +
            input.parentElement.querySelector(".terminalSymbol").outerHTML + " ";
        line.appendChild(document.createTextNode(raw));
        output.appendChild(line);

        var args = raw.trim().split(/\s+/);
        var name = args.shift().toLowerCase();
        if (!name) return;

        for (var i = 0; i < terminal.handlers.length; i++){
            if (terminal.handlers[i](raw, name, args)) return;
        }

        if (commands.hasOwnProperty(name)){
            commands[name](args);
        }else {
            print("command not found: " + name + " - try 'help'", "terminalError");
        }
    }

    // Mirror the hidden input next to the blinking cursor
    var typed = document.querySelector(".terminalTypedInput");
    function sync(){
        typed.textContent = input.value;
    }
    input.addEventListener("input", sync);

    input.addEventListener("keydown", function(e){
        if (e.key == "Enter"){
            var value = input.value;
            input.value = "";
            if (value.trim()){
                history.push(value);
            }
            historyIndex = history.length;
            run(value);
            scrollToBottom();
        }else if (e.key == "ArrowUp" && historyIndex > 0){
            e.preventDefault();
            input.value = history[--historyIndex];
        }else if (e.key == "ArrowDown" && historyIndex < history.length){
            e.preventDefault();
            historyIndex++;
            input.value = history[historyIndex] || "";
        }else if (e.key == "Tab"){
            var matches = terminal.completions().filter(function(c){ return input.value && c.indexOf(input.value) == 0; });
            if (matches.length == 1){
                e.preventDefault();
                input.value = matches[0] + " ";
            }
        }
        sync();
    });

    // Let the site add its own commands and behaviour
    document.dispatchEvent(new CustomEvent("terminalsetup", { detail: terminal }));

    // Focus the prompt once the intro has printed, so visitors can just start typing
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches){
        terminal.focus();
    }else {
        document.addEventListener("terminalReady", terminal.focus);
    }
}
document.addEventListener("DOMContentLoaded", setupTerminal);



// Blog code blocks: add a copy button to each
function setupCopyButtons(){
    if (!navigator.clipboard) return;

    document.querySelectorAll(".blogContent pre").forEach(function(pre){
        var wrapper = document.createElement("div");
        wrapper.className = "codeBlock";
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        var button = document.createElement("button");
        button.type = "button";
        button.className = "copyButton";
        button.textContent = "copy";
        button.setAttribute("aria-label", "Copy code to clipboard");
        wrapper.appendChild(button);

        var resetTimer;
        button.addEventListener("click", function(){
            navigator.clipboard.writeText(pre.innerText).then(function(){
                button.textContent = "copied!";
            }, function(){
                button.textContent = "failed :(";
            });
            clearTimeout(resetTimer);
            resetTimer = setTimeout(function(){ button.textContent = "copy"; }, 1500);
        });
    });
}
document.addEventListener("DOMContentLoaded", setupCopyButtons);
