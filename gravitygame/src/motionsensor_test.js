document.addEventListener("DOMContentLoaded", function () {
    const switchOn = document.querySelector(".SwitchOn");
    const alphaBlock = document.querySelector(".LevelNumbers-alpha");
    const betaBlock = document.querySelector(".LevelNumbers-beta");
    const gammaBlock = document.querySelector(".LevelNumbers-gamma");

    switchOn.addEventListener("click", startMeasurement);
    function startMeasurement() {
        switchOn.classList.add("is-hidden");
        initOrientationSensor();
    }

    function initOrientationSensor() {
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            console.log("DeviceOrientationEvent.requestPermission() is supported");
            // Handle iOS 13+ devices.
            DeviceOrientationEvent.requestPermission()
                .then((state) => {
                    if (state === "granted") {
                        window.addEventListener(
                            "deviceorientation",
                            handleOrientation,
                            true
                        );
                    } else {
                        console.error("Request to access the orientation was rejected");
                    }
                })
                .catch(console.error);
        } else {
            // Handle regular non iOS 13+ devices.
            window.addEventListener("deviceorientation", handleOrientation, true);
        }
    }


    function handleOrientation(event) {
        const alpha = event.alpha.toFixed(2);
        const beta = event.beta.toFixed(2);
        const gamma = event.gamma.toFixed(2);

        const levelOffset = -(event.gamma / 90 / 2).toFixed(2);

        alphaBlock.innerHTML = alpha;
        betaBlock.innerHTML = beta;
        gammaBlock.innerHTML = gamma;
        document.documentElement.style.cssText = `--offset-x: ${levelOffset};`;
    }
});
