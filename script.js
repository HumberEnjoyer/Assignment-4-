document.addEventListener('DOMContentLoaded', (event) => {
    // Select the element 
    const earthImage = document.querySelector('.earth-image');

    // Mouse listener
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

document.addEventListener("DOMContentLoaded", function() {
    const filterLinks = document.querySelectorAll("[data-filter]");
    let activeFilter = null;

    filterLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const filter = this.getAttribute("data-filter");

            // Toggle active state
            if (activeFilter === filter) {
                activeFilter = null;
                this.classList.remove("active");
            } else {
                activeFilter = filter;
                filterLinks.forEach(link => link.classList.remove("active"));
                this.classList.add("active");
            }

            // Filter items
            const items = document.querySelectorAll(".product-item");
            items.forEach(item => {
                if (!activeFilter || item.getAttribute("data-category") === activeFilter) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
});