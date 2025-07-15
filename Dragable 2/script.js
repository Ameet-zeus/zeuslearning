class Draggable {
    constructor() {
        this.parent1 = document.createElement('div');
        document.body.appendChild(this.parent1);
        this.parent1.classList.add('parent');
        this.parent1.classList.add('p1');

        this.parent2 = document.createElement('div');
        document.body.appendChild(this.parent2);
        this.parent2.classList.add('parent');
        this.parent2.classList.add('p2');

        this.child = document.createElement('div');
        this.currentParent = this.parent1;
        this.currentParent.appendChild(this.child);
        this.child.classList.add('child');
        this.child.classList.add('2');

        this.dragging = false;
    }

    drag() {
        let newLeft, newTop;
        let offsetX = 0;
        let offsetY = 0;
        let oldLeft = null;
        let oldTop = null;
        let tempParent = null;

        this.child.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.dragging = true;
            const childRect = this.child.getBoundingClientRect();
            offsetX = e.clientX - childRect.left;
            offsetY = e.clientY - childRect.top;
        });

        document.addEventListener('pointermove', (e) => {
            if (!this.dragging) return;
            e.preventDefault();

            const parent1 = this.parent1.getBoundingClientRect();
            const parent2 = this.parent2.getBoundingClientRect();
            const child = this.child.getBoundingClientRect();

            if (e.clientX >= parent1.left && e.clientX <= parent1.right && e.clientY >= parent1.top && e.clientY <= parent1.bottom) {
                tempParent = null;
                newLeft = e.clientX - offsetX - parent1.left;
                newTop = e.clientY - offsetY - parent1.top;

                newLeft = Math.max(0, Math.min(newLeft, parent1.width - child.width));
                newTop = Math.max(0, Math.min(newTop, parent1.height - child.height));

                if (this.currentParent !== this.parent1 || this.child.parentNode !== this.parent1) {
                    this.parent1.appendChild(this.child);
                    this.currentParent = this.parent1;
                }

                this.child.style.left = `${newLeft}px`;
                this.child.style.top = `${newTop}px`;
            }
            else if (e.clientX >= parent2.left && e.clientX <= parent2.right && e.clientY >= parent2.top && e.clientY <= parent2.bottom) {
                tempParent = null;
                newLeft = e.clientX - offsetX - parent2.left;
                newTop = e.clientY - offsetY - parent2.top;

                newLeft = Math.max(0, Math.min(newLeft, parent2.width - child.width));
                newTop = Math.max(0, Math.min(newTop, parent2.height - child.height));

                if (this.currentParent !== this.parent2 || this.child.parentNode !== this.parent2) {
                    this.parent2.appendChild(this.child);
                    this.currentParent = this.parent2;
                }

                this.child.style.left = `${newLeft}px`;
                this.child.style.top = `${newTop}px`;
            }
            else {
                if (tempParent !== document.body) {
                    oldLeft = this.child.style.left || 0;
                    oldTop = this.child.style.top || 0;
                    tempParent = document.body;
                    document.body.appendChild(this.child);
                }

                let tempLeft = e.clientX - offsetX;
                let tempTop = e.clientY - offsetY;

                this.child.style.left = `${tempLeft}px`;
                this.child.style.top = `${tempTop}px`;
            }
        });

        document.addEventListener('pointerup', (e) => {
            if (!this.dragging) return;
            e.preventDefault();

            if (tempParent == document.body) {
                const parentRect = this.currentParent.getBoundingClientRect();
                const newLeft = e.clientX - offsetX - parentRect.left;
                const newTop = e.clientY - offsetY - parentRect.top;

                this.currentParent.appendChild(this.child);
                this.child.style.left = `${Math.max(0, Math.min(newLeft, parentRect.width - this.child.offsetWidth))}px`;
                this.child.style.top = `${Math.max(0, Math.min(newTop, parentRect.height - this.child.offsetHeight))}px`;

                tempParent = null;
                oldLeft = null;
                oldTop = null;
            }

            this.dragging = false;
        });
    }
}

let draggable = new Draggable();
draggable.drag();