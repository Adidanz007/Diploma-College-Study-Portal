// menu toggle 
var nav_links = document.getElementById("nav-links");

function showMenu() {
    nav_links.style.right = "0"
}

function hideMenu() {
    nav_links.style.right = "-200px"
}

// back top btn 

document.addEventListener('DOMContentLoaded', function() {
    var backToTopButton = document.getElementById('back-to-top-btn');

    // Show or hide the button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 100) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    // Smooth scroll to top when button is clicked
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});


// chatbot

document.getElementById('openChatbot').addEventListener('click', function() {
    document.getElementById('chatbot').style.left = '20px';
});

document.getElementById('closeChatbot').addEventListener('click', function() {
    document.getElementById('chatbot').style.left = '-440px';
});


// loader