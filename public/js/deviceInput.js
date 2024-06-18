deleteButton = document.querySelectorAll(".deleteButton")

deleteButton.forEach((button) => {
    button.addEventListener('click', deleteField)
})

function deleteField(event) {
    let parent = event.target.parentElement
    parent.remove()
}

function addField() {
    var container = document.getElementById("fieldContainer");
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
    input.name = "multiValueField[]";
    container.appendChild(newField);
}

addButton = document.getElementById("add-field-but")
addButton.addEventListener('click', addField)