// JavaScript implementation of popup.ts

document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('popup');
    const icon = document.getElementById('icon');

    icon.addEventListener('click', function () {
        popup.style.display = 'block';
    });

    document.addEventListener('click', function (event) {
        if (!popup.contains(event.target) && event.target !== icon) {
            popup.style.display = 'none';
        }
    });
});

// Add your CSS styles for the popup here
const style = document.createElement('style');
style.innerHTML = `
    #popup {
        display: none;
        position: absolute;
        top: 50px;
        right: 50px;
        width: 200px;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 10px;
        z-index: 1000;
    }
    #icon {
        cursor: pointer;
    }
`;
document.head.appendChild(style);
