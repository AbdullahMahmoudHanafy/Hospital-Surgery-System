var addButton1 = document.querySelector('.addButton1')
var addButton2 = document.querySelector('.addButton2')

addButton1.addEventListener('click', function(){
    overlay1.style.display = "flex"
})
addButton2.addEventListener('click', function(){
    overlay2.style.display = "flex"
})

var cancelAdding = document.querySelectorAll('.cancel')
cancelAdding.forEach((cancelButton) => {
    cancelButton.addEventListener('click', function(){
        overlay1.style.display = "none"
        overlay2.style.display = "none"
    })
})