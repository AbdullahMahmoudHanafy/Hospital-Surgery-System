let addHistoryOverlay = document.querySelector(".add-history-overlay")
let addHistoryButton = document.getElementById("medical-histpry-add-button")

addHistoryButton.addEventListener('click', function(){
    addHistoryOverlay.style.display = "flex"
})

var cancelAddingHistory = document.querySelector(".cancel-adding-history")

cancelAddingHistory.addEventListener('click', function(){
    addHistoryOverlay.style.display = "none";
})