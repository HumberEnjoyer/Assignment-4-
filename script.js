document.addEventListener('DOMContentLoaded', (event) => {
    // Select the element 
    const earthImage = document.querySelector('.earth-image');

    //mouse listener
    earthImage.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = earthImage.getBoundingClientRect();
        // Calculate the X and Y position of the mouse
        const x = e.clientX - left - width / 2;
        const y = e.clientY - top - height / 2;
        // Calculate the translation values based on mouse position
        const moveX = (x / width) * 20;
        const moveY = (y / height) * 20;
        // Apply the translation
        earthImage.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    // Add mouseleave event listener to reset the translation
    earthImage.addEventListener('mouseleave', () => {
        earthImage.style.transform = 'translate(0, 0)';
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const fadeUpElements = document.querySelectorAll('.fade-up');

    //fade up part
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    fadeUpElements.forEach(element => {
        observer.observe(element);
    });
});