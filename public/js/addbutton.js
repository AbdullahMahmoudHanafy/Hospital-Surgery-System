var addButton = document.querySelector('.addButton')
var overlay = document.querySelector('.overlay')

addButton.addEventListener('click', function(){
    overlay.style.display = "flex"
})

var cancelAddButton = document.querySelector('.cancel')

cancelAddButton.addEventListener('click',closeAddition)

function closeAddition(event){
    overlay.style.display = 'none'
    overlay.querySelector(".errorMessage").innerHTML = '';
    event.preventDefault()
}