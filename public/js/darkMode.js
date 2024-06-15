var content = document.getElementsByTagName('body')[0]
var h1 = document.getElementsByTagName('h1')[0]
var darkMode = document.getElementById('Dark-mode')
darkMode.addEventListener('click', function(){
    content.classList.toggle('night')
    h1.classList.toggle('night')
})
