
function addSuccessAlert(firstName, examName, examDate) {
    const alertHtml = `\
        <div class="col-md-12"> \
            <div class="alert alert-success" role="alert"> \
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"> \
                    <span aria-hidden="true">&times;</span> \
                </button> \
                <h4 class="alert-heading">Success!</h4> \
                <p>Congratulations ${firstName}. Your ${examName} exam has been scheduled for ${examDate}</p> \
            </div> \
        </div> \
    `;

    const alerts = document.querySelector('#alerts');

    alerts.innerHTML = alertHtml;
}

function scheduleExam() {
    const postData = {
        candidate: {
            title: document.querySelector('#title').value,
            forename: document.querySelector('#firstName').value,
            surname: document.querySelector('#lastName').value,
            dob: document.querySelector('#dob').value,
        },
        exam: {
            id: document.querySelector('#exam').value,
            date: document.querySelector('#exam-date').value,
        },
    };

    // We will always get an error, because /ScheduleExam doesn't exist
    axios.post('/ScheduleExam', postData)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
        })
        .then(() => {
            // Adding the success message when the form has been submitted
            // This is currently ran everytime, even when the 'POST' request is not successful, as the URL '/ScheduleExam' doesn't exist
            const examName = document.querySelector('#exam').options[document.querySelector('#exam').selectedIndex].text;
            addSuccessAlert(postData.candidate.forename, examName, postData.exam.date);
        });
}

function populateExamOptions(availableExams) {
    // Get exam 'select' element
    const examElement = document.querySelector('#exam');

    let option;

    // Loop through JSON object
    availableExams.availableExams.forEach((item) => {
        // Create new 'option' element
        option = document.createElement('option');
        option.value = item.id;
        option.text = item.name;

        // Add new 'option' element to our 'select' element
        examElement.add(option, null);
    });
}

function getAvailableExams() {
    let availableExams;

    axios.get('/GetAvailableExams')
        .then((response) => {
            availableExams = response.data;
        })
        .catch(() => {
            availableExams = {
                availableExams: [
                    { name: 'Physics', id: 212 },
                    { name: 'Biology', id: 213 },
                    { name: 'Chemistry', id: 214 },
                    { name: 'English', id: 215 },
                ],
            };
        })
        .then(() => {
            // Add the available exams to our dropdown menu
            populateExamOptions(availableExams);
        });

    return availableExams;
}

function validateExamDate() {
    // Get user inputted exam date
    const examDate = document.querySelector('#exam-date');
    // Get today's date as a 'Date' object
    const today = new Date();
    // Turn user inputted exam date into a 'Date' object
    const inputDate = new Date(examDate.value);

    // Calculate difference in days between today and user inputted exam date
    const diffTime = inputDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let examDateValid = true;

    // If the inputted date is not a valid date, or date is not between today or 30 from today
    if (isNaN(inputDate.getTime()) || diffDays < 0 || diffDays > 30) {
        examDateValid = false;
    }

    if (examDateValid) {
        // Exam date is valid
        examDate.setCustomValidity('');
    } else {
        // Exam date is not valid
        examDate.setCustomValidity('Valid dates are between today\'s date and 30 days from today\'s date.');
    }
}

/* End of functions */

const form = document.querySelector('#exam-scheduler-form');

form.addEventListener('submit', (event) => {
    // Stop default form behaviour
    event.preventDefault();
    event.stopPropagation();

    validateExamDate();

    // When the form validation has no errors, submit a POST request
    if (form.checkValidity() === true) {
        scheduleExam();
    }

    form.classList.add('was-validated');
}, false);

// Event listener for exam date validation
const examDate = document.querySelector('#exam-date');
examDate.addEventListener('input', validateExamDate);

getAvailableExams();
