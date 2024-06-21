var addButton1 = document.querySelector('.addButton1')
var addButton2 = document.querySelector('.addButton2')
var addButton3 = document.querySelector('.addButton3')
var addButton4 = document.querySelector('.addButton4')
var addButton5 = document.querySelector('.addButton5')
var addButton6 = document.querySelector('.addButton6')
var overlay1 = document.querySelector('.overlay1')
var overlay2 = document.querySelector('.overlay2')
var overlay3 = document.querySelector('.overlay3')
var overlay4 = document.querySelector('.overlay4')
var overlay5 = document.querySelector('.overlay5')
var overlay6 = document.querySelector('.overlay6')

addButton1.addEventListener('click', function(){
    overlay1.style.display = "flex"
})
addButton2.addEventListener('click', function(){
    overlay2.style.display = "flex"
})
addButton3.addEventListener('click', function(){
    overlay3.style.display = "flex"
})
addButton4.addEventListener('click', function(){
    overlay4.style.display = "flex"
})
addButton5.addEventListener('click', function(){
    overlay5.style.display = "flex"
})
addButton6.addEventListener('click', function(){
    overlay6.style.display = "flex"
})

var cancelAdding = document.querySelectorAll('.cancel')
cancelAdding.forEach((cancelButton) => {
    cancelButton.addEventListener('click', function(){
        overlay1.style.display = "none"
        overlay2.style.display = "none"
        overlay3.style.display = "none"
        overlay4.style.display = "none"
        overlay5.style.display = "none"
        overlay6.style.display = "none"

        let errorMessages = document.querySelectorAll(".errorMessage")
        errorMessages.forEach((errorMessage) => {
            errorMessage.innerHTML = ""
        })
        
        event.preventDefault()
    })
})