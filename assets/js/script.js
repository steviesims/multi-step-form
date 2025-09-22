const form = document.querySelector('.form');
const inputs = Array.from(form.querySelectorAll('.form-group input'));

function updateValidity(input) {
    const group = input.closest('.form-group');
    const isEmpty = input.value.trim() === '';
    const isValid = input.checkValidity() && !isEmpty;
    group.classList.toggle('invalid', !isValid);
    return isValid;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstInvalid = null;
    inputs.forEach((input) => {
        if (!updateValidity(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
        firstInvalid.focus();
        return; // stop submit flow
    }

});

form.addEventListener('input', (e) => {
    if (e.target.matches('.form-group input')) {
        updateValidity(e.target);
    }
});

form.addEventListener('blur', (e) => {
    if (e.target.matches('.form-group input')) {
        updateValidity(e.target);
    }
}, true);