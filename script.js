const snapAngle = 360 / 26; // Defines the angle each snap step represents

// Normalize angle to be within the range [0, 360)
function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
}

// Calculate the number of angles changed from the original
function getNumberOfAnglesChanged(angle) {
    const normalizedAngle = normalizeAngle(angle);
    return Math.round(normalizedAngle / snapAngle) % 26;
}

// Resize text to fit within its container
function resizeTextToFit() {
    const elements = document.querySelectorAll('.write, .answer, button');
    elements.forEach(el => {
        let fontSize = 16; // Initial font size in pixels
        el.style.fontSize = `${fontSize}px`;

        // Reduce font size until text fits within the element
        while (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
            fontSize--;
            el.style.fontSize = `${fontSize}px`;
        }
    });
}

// Event listeners to resize text on load and window resize
window.addEventListener('resize', resizeTextToFit);
window.addEventListener('load', resizeTextToFit);

// Calculate the angle from (x, y) to the center of (centerX, centerY)
function getAngle(x, y, centerX, centerY) {
    return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
}

// Generalized function for setting up circle rotation and angle input synchronization
function setupCircleAndAngleInput(circleId, angleInputId, angleInfoId) {
    let isDragging = false;
    let startAngle = 0;
    let currentAngle = 0;
    let startX, startY;

    const circle = document.getElementById(circleId);
    const image = circle.querySelector('img');
    const angleInput = document.getElementById(angleInputId);
    const angleInfo = document.getElementById(angleInfoId);

    // Handle start of drag event
    function handleStartEvent(e, clientX, clientY) {
        isDragging = true;
        const rect = image.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        startX = clientX;
        startY = clientY;
        startAngle = getAngle(startX, startY, centerX, centerY) - currentAngle;

        e.preventDefault(); // Prevent default behavior like text selection
    }

    // Handle dragging movement event
    function handleMoveEvent(e, clientX, clientY) {
        if (isDragging) {
            const rect = image.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const newAngle = getAngle(clientX, clientY, centerX, centerY);
            currentAngle = newAngle - startAngle;

            image.style.transform = `rotate(${normalizeAngle(currentAngle)}deg)`;
        }
    }

    // Handle end of drag event
    function handleEndEvent() {
        if (isDragging) {
            isDragging = false;
            const snappedAngle = Math.round(currentAngle / snapAngle) * snapAngle;
            image.style.transform = `rotate(${normalizeAngle(snappedAngle)}deg)`;
            currentAngle = snappedAngle;

            // Update the angle input value based on the snapped angle
            const numberOfAnglesChanged = getNumberOfAnglesChanged(snappedAngle);
            angleInput.value = numberOfAnglesChanged;
        }
    }

    // Event listeners for pointer and touch interactions
    image.addEventListener('pointerdown', (e) => handleStartEvent(e, e.clientX, e.clientY));
    document.addEventListener('pointermove', (e) => handleMoveEvent(e, e.clientX, e.clientY));
    document.addEventListener('pointerup', handleEndEvent);

    image.addEventListener('touchstart', (e) => handleStartEvent(e, e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener('touchmove', (e) => handleMoveEvent(e, e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener('touchend', handleEndEvent);

    // Handle angle input changes to rotate the circle
    angleInput.addEventListener('input', (e) => {
        let inputAngle = parseInt(e.target.value, 10);
        inputAngle = (inputAngle % 26 + 26) % 26; // Ensure value is within 0-25

        angleInput.value = inputAngle;

        const rotationAngle = inputAngle * snapAngle; // Calculate the rotation based on input
        image.style.transform = `rotate(${rotationAngle}deg)`;
    });
}

// Setup circles and their corresponding inputs
setupCircleAndAngleInput('circle1', 'angle-input1', 'angle-info1');
setupCircleAndAngleInput('circle2', 'angle-input2', 'angle-info2');
setupCircleAndAngleInput('circle3', 'angle-input3', 'angle-info3');
setupCircleAndAngleInput('circle4', 'angle-input4', 'angle-info4');
setupCircleAndAngleInput('circle5', 'angle-input5', 'angle-info5');

// Event listeners for cipher and decipher buttons
const userInput = document.getElementById('user-input');
const answerBox = document.querySelector('.answer');
const but1 = document.querySelector('.But1');
const but2 = document.querySelector('.But2');

// Function to get non-empty shift values
function getNonEmptyShifts() {
    const shifts = [
        parseInt(document.getElementById('angle-input1').value, 10) || null,
        parseInt(document.getElementById('angle-input2').value, 10) || null,
        parseInt(document.getElementById('angle-input3').value, 10) || null,
        parseInt(document.getElementById('angle-input4').value, 10) || null,
        parseInt(document.getElementById('angle-input5').value, 10) || null
    ];

    // Filter out null values
    return shifts.filter(shift => shift !== null);
}

// Cipher the text using shift values from the circles
function cipherText() {
    const inputText = userInput.value.toUpperCase();
    const nonEmptyShifts = getNonEmptyShifts();
    let cipheredText = '';

    // Iterate through each letter of the input text
    for (let i = 0; i < inputText.length; i++) {
        const charCode = inputText.charCodeAt(i);

        // Only cipher A-Z characters
        if (charCode >= 65 && charCode <= 90) {
            const shift = nonEmptyShifts[i % nonEmptyShifts.length] || 0; // Use the cycle of non-empty shifts
            const shiftedCode = ((charCode - 65 + shift) % 26) + 65; // Apply the shift
            cipheredText += String.fromCharCode(shiftedCode);
        } else {
            cipheredText += inputText[i]; // Leave non A-Z characters unchanged
        }
    }

    answerBox.textContent = cipheredText; // Display the ciphered text in the answer box
}

// Decipher the text using shift values from the circles
function decipherText() {
    const inputText = userInput.value.toUpperCase();
    const nonEmptyShifts = getNonEmptyShifts();
    let decipheredText = '';

    // Iterate through each letter of the input text
    for (let i = 0; i < inputText.length; i++) {
        const charCode = inputText.charCodeAt(i);

        // Only decipher A-Z characters
        if (charCode >= 65 && charCode <= 90) {
            const shift = nonEmptyShifts[i % nonEmptyShifts.length] || 0; // Use the cycle of non-empty shifts
            const shiftedCode = ((charCode - 65 - shift + 26) % 26) + 65; // Reverse the shift
            decipheredText += String.fromCharCode(shiftedCode);
        } else {
            decipheredText += inputText[i]; // Leave non A-Z characters unchanged
        }
    }

    answerBox.textContent = decipheredText; // Display the deciphered text in the answer box
}

// Attach functions to cipher and decipher buttons
but1.addEventListener('click', () => {
    cipherText(); // Call cipherText with the adjusted shifts
    resizeTextToFit(); // Resize text to fit
});

but2.addEventListener('click', () => {
    decipherText(); // Call decipherText with the adjusted shifts
    resizeTextToFit(); // Resize text to fit
});
