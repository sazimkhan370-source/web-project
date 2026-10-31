
let students = JSON.parse(
    localStorage.getItem("students")
) || [];

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");
const marksInput = document.getElementById("marks");
const editIndex = document.getElementById("editIndex");

const table = document.getElementById("studentTable");
const searchInput = document.getElementById("search");
const totalStudents = document.getElementById("totalStudents");
const averageMarks = document.getElementById("averageMarks");
const emptyMessage = document.getElementById("emptyMessage");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

// Calculate student grade
function getGrade(marks) {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B";
    if (marks >= 60) return "C";
    if (marks >= 40) return "D";
    return "F";
}

// Save data in browser
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
}

// Add or update a student
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();
    const course = courseInput.value.trim();
    const marks = Number(marksInput.value);
    const currentIndex = Number(editIndex.value);

    if (!name || !roll || !course || marksInput.value === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
        alert("Marks must be between 0 and 100.");
        return;
    }

    // Prevent duplicate roll numbers
    const duplicate = students.some(function(student, index) {
        return student.roll.toLowerCase() === roll.toLowerCase()
            && index !== currentIndex;
    });

    if (duplicate) {
        alert("This roll number already exists.");
        return;
    }

    const student = {
        name: name,
        roll: roll,
        course: course,
        marks: marks
    };

    if (currentIndex === -1) {
        students.push(student);
        alert("Student added successfully!");
    } else {
        students[currentIndex] = student;
        alert("Student updated successfully!");
    }

    saveData();
    form.reset();
    resetForm();
    displayStudents();
});

// Display student records
function displayStudents() {
    table.innerHTML = "";

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredStudents = students
        .map(function(student, index) {
            return { ...student, originalIndex: index };
        })
        .filter(function(student) {
            return student.name.toLowerCase().includes(searchText)
                || student.roll.toLowerCase().includes(searchText);
        });

    filteredStudents.forEach(function(student) {
        const row = document.createElement("tr");

        [
            student.roll,
            student.name,
            student.course,
            student.marks,
            getGrade(student.marks)
        ].forEach(function(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", function() {
            editStudent(student.originalIndex);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", function() {
            deleteStudent(student.originalIndex);
        });

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        table.appendChild(row);
    });

    emptyMessage.hidden = filteredStudents.length > 0;

    // Update dashboard information
    totalStudents.textContent = students.length;

    const totalMarks = students.reduce(function(sum, student) {
        return sum + student.marks;
    }, 0);

    averageMarks.textContent = students.length
        ? (totalMarks / students.length).toFixed(2)
        : "0";
}

// Edit a student
function editStudent(index) {
    const student = students[index];

    nameInput.value = student.name;
    rollInput.value = student.roll;
    courseInput.value = student.course;
    marksInput.value = student.marks;
    editIndex.value = index;

    document.getElementById("formTitle").textContent = "Edit Student";
    saveButton.textContent = "Update Student";
    cancelButton.hidden = false;

    document.getElementById("formTitle").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Delete a student
function deleteStudent(index) {
    if (confirm("Are you sure you want to delete this student?")) {
        students.splice(index, 1);
        saveData();
        resetForm();
        displayStudents();
    }
}

// Reset editing mode
function resetForm() {
    editIndex.value = -1;
    document.getElementById("formTitle").textContent = "Add New Student";
    saveButton.textContent = "Add Student";
    cancelButton.hidden = true;
}

// Cancel editing
cancelButton.addEventListener("click", function() {
    form.reset();
    resetForm();
});

// Search students
searchInput.addEventListener("input", displayStudents);

// Show saved records when the page opens
displayStudents();
