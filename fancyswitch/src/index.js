document.addEventListener("DOMContentLoaded", function () {
    var fancySwitch = document.querySelector(".FancySwitch");

    fancySwitch.addEventListener("keydown", (e) => {
        if (e.keyCode === 13 || e.keyCode === 32) {
            e.preventDefault();
            fancySwitch.click();
        }
    });
});