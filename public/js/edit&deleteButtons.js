//select overlay pages 
let editOverlay = document.querySelector('.edit-overlay');
// let deleteOverlay = document.querySelector('.delete-overlay')

//select cancel buttons in edit and delete overlay
// var cancelDeletion = document.querySelector('.cancel-deletion')
// var cancelEdit = document.querySelector('.cancel-edit')

//make overlays dissapears when cancel buttons are been clicked
// cancelDeletion.addEventListener('click',function(){
//     deleteOverlay.style.display = 'none'
// })
// cancelEdit.addEventListener('click',function(){
//     editOverlay.style.display = 'none'
// })

// select all delete and edit buttons in all 3Dots menus
let editButtons  = document.querySelectorAll('.edit-btn')
// let deleteButtons = document.querySelectorAll('.delete-btn')

// make them open edit or delete overlay pages when be clicked
editButtons.forEach((editButton)=>{
    editButton.addEventListener('click',function(){
        editOverlay.style.display = 'flex'
    })
})
// deleteButtons.forEach((deleteButton)=>{
//     deleteButton.addEventListener('click',function(){
//         deleteOverlay.style.display = 'flex'
//     })
// })