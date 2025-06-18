/*jslint es6 */

// CREATING BACKGROUND AND BOX DIV
const backgroundDiv = document.createElement('div');
const box = document.createElement('div');

// ADDING BOTH DIV IN PAGE
document.body.appendChild(backgroundDiv);
backgroundDiv.appendChild(box);

// STYLING THE BACKGROUND DIV
backgroundDiv.style.position = 'relative';
backgroundDiv.style.height = '100vh';
backgroundDiv.style.width = '100vw';
backgroundDiv.style.backgroundColor = 'beige';

// STYLING THE BOX DIV
box.style.position = 'absolute';
box.style.height = '50px';
box.style.width = '50px';
box.style.backgroundColor = 'red';
box.style.touchAction = 'none';
box.style.top = '0';
box.style.left = '0';

// ADDING EVENT LISTENERS FOR TRACKING AND MOVING
box.addEventListener('pointerdown', function(event) {

    // PREVENT DEFAULT BEHAVIOR
    event.preventDefault();

    // STARTING POINT OF THE TOUCH
    const startX = event.clientX;
    const startY = event.clientY;

    // STARTING POINT OF THE BOX
    const boxX = parseInt(box.style.left, 10);
    const boxY = parseInt(box.style.top, 10);

    // FUNCTION TO MOVE BOX WHEN TOUCH IS MOVED
    function moveAt(x, y) {
        //GETTING THE INFO OF THE OUTER BOX
        const backgroundDivRect = backgroundDiv.getBoundingClientRect();
        const boxRect = box.getBoundingClientRect();

        //CALCULATING THE CURRENT X AND Y AND LIMITING IT
        x -= startX;
        x += boxX;
        x = Math.max(0, Math.min(x, backgroundDivRect.width - boxRect.width));
        y -= startY;
        y += boxY;
        y = Math.max(0, Math.min(y, backgroundDivRect.height - boxRect.height));

        //ASSIGNING THE NEW VALUES
        box.style.left = `${x}px`;
        box.style.top = `${y}px`;
    }

    // EVENT LISTENER FUNCTION TO TRIGGER THE MOVING FUNCTION WHEN POINTER IS MOVED
    function onPointerMove(event) {
        moveAt(event.clientX, event.clientY);
    }

    // EVENT LISTENER FUNCTION TO STOP THE MOVING WHEN TOUCH IS RELEASED
    function onPointerUp() {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    }

    // SET POINTER CAPTURE TO KEEP RECEIVING UPDATES EVEN IF POINTER LEAVES THE DIV
    box.setPointerCapture(event.pointerId);

    // ASSIGNING THE EVENT LISTENERS
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
});
