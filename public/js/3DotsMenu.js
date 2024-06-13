let threeDotsList = document.querySelectorAll(".threeDots");

for (let i = 0;i<threeDotsList.length;i++){
    threeDotsList[i].addEventListener("click",displayMenu);
}

document.addEventListener("click",hideMenu);

function displayMenu(event){
    let parentDiv = event.target.parentElement;
    let menu = parentDiv.querySelector(".content");
    let stauts = menu.classList.contains("content-display");
    let openedMenu = document.querySelectorAll('.content-display');
    for(let i = 0;i<openedMenu.length;i++)
        openedMenu[i].classList.remove('content-display');
    if(!stauts)
        menu.classList.add("content-display");
}


function hideMenu(event){
    if(!event.target.classList.contains("threeDots")){
        let openedMenu = document.querySelectorAll('.content-display');
        for(let i = 0;i<openedMenu.length;i++)
            openedMenu[i].classList.remove('content-display');
    }
}
