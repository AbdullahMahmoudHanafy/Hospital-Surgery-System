deleteButton = document.querySelectorAll(".deleteButton")

deleteButton.forEach((button) => {
    button.addEventListener('click', deleteField)
})

function deleteField(event) {
    let parent = event.target.parentElement
    parent.remove()
    event.preventDefault();
    console.log(event.target)
}

function addField(event) {
    event.preventDefault();
    var parent = event.target.parentElement
    console.log(parent)
    var container = parent.querySelector("#fieldContainer");
    console.log(container)
    var newField = document.createElement("div");
    var input = document.createElement("input");
    var newButton = document.createElement("button");
    input.placeholder = "ادخل الرقم التسلسلي للجهاز"
    newButton.innerText = "حذف";
    newButton.classList.add("deleteButton");
    newButton.onclick = deleteField
    newField.appendChild(input);
    newField.appendChild(newButton);
    newField.classList.add("newField")
    input.type = "text";
    input.name = "multiValueField";
    container.appendChild(newField);
}

addButtons = document.querySelectorAll("#add-field-but")

addButtons.forEach(addButton=>{
    addButton.addEventListener('click', addField)
})
