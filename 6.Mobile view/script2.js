//CLASS OF BACKGROUND
class BackgroundDivClass {
    constructor() {
        this.backgroundDiv = document.createElement('div');
        this.backgroundDiv.classList.add('background-div');
        document.body.appendChild(this.backgroundDiv);
    }

    getBackgroundDiv() {
        return this.backgroundDiv;
    }
}

//CLASS OF BOX
class BoxDivClass {
    constructor(backgroundDiv, boxId) {
        this.backgroundDiv = backgroundDiv;
        this.box = document.createElement('div');
        this.box.classList.add('box-div');
        this.box.setAttribute('id', boxId);
        this.box.style.top = '0px';
        this.box.style.left = '0px';
        backgroundDiv.getBackgroundDiv().appendChild(this.box);

        this.initDrag();
    }

    getBoxDiv() {
        return this.box;
    }

    clampPosition() {
        const bgRect = this.backgroundDiv.getBackgroundDiv().getBoundingClientRect();
        const boxRect = this.box.getBoundingClientRect();

        let left = parseInt(this.box.style.left || '0', 10);
        let top = parseInt(this.box.style.top || '0', 10);

        left = Math.min(left, bgRect.width - boxRect.width);
        top = Math.min(top, bgRect.height - boxRect.height);

        left = Math.max(0, left);
        top = Math.max(0, top);

        this.box.style.left = `${left}px`;
        this.box.style.top = `${top}px`;
    }

    initDrag() {
        const box = this.box;
        const backgroundDiv = this.backgroundDiv;

        box.addEventListener('pointerdown', (event) => {
            event.preventDefault();

            const startX = event.clientX;
            const startY = event.clientY;

            const boxX = parseInt(box.style.left || '0', 10);
            const boxY = parseInt(box.style.top || '0', 10);

            const moveAt = (x, y) => {
                const backgroundDivRect = backgroundDiv.getBackgroundDiv().getBoundingClientRect();
                const boxRect = box.getBoundingClientRect();

                x -= startX;
                x += boxX;
                x = Math.max(0, Math.min(x, backgroundDivRect.width - boxRect.width));
                y -= startY;
                y += boxY;
                y = Math.max(0, Math.min(y, backgroundDivRect.height - boxRect.height));

                box.style.left = `${x}px`;
                box.style.top = `${y}px`;
            };

            const onPointerMove = (event) => {
                moveAt(event.clientX, event.clientY);
            };

            const onPointerUp = () => {
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);
                box.releasePointerCapture(event.pointerId);
            };

            box.setPointerCapture(event.pointerId);
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        });
    }
}

 //INSTANCES OF BOXES
const allBoxes = [];

const backgroundDivs = [];
for (let i = 1; i <= 4; i++) {
    backgroundDivs.push(new BackgroundDivClass());
}

function createBoxesForBackground(background, bgIndex, numBoxes) {
    for (let i = 1; i <= numBoxes; i++) {
        const boxId = `bg${bgIndex}_box${i}`;
        const boxInstance = new BoxDivClass(background, boxId);
        allBoxes.push(boxInstance);
    }
}

backgroundDivs.forEach((bg, index) => {
    createBoxesForBackground(bg, index + 1, 100);
});

window.addEventListener('resize', () => {
    allBoxes.forEach(box => box.clampPosition());
});
