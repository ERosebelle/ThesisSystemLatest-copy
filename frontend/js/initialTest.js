// PASSWORD VISIBILITY TOGGLE
const passwordInput = document.getElementById("passwordInput");
const togglePassword = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

if (passwordInput && togglePassword && eyeOpen && eyeClosed) {
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeOpen.classList.add("hidden");
            eyeClosed.classList.remove("hidden");
        }
        else {
            passwordInput.type = "password";
            eyeClosed.classList.add("hidden");
            eyeOpen.classList.remove("hidden");
        }
    });
}

// INFORMATION PANEL
const scene = document.querySelector(".scene");
const infoButton = document.getElementById("infoButton");
const closeInfo = document.getElementById("closeInfo");

if (scene && infoButton) {
    infoButton.addEventListener("click", () => {
        scene.classList.toggle("show-info");
    });
}

if (scene && closeInfo) {
    closeInfo.addEventListener("click", () => {
        scene.classList.remove("show-info");
    });
}

// INFORMATION CONTENT
const infoButtons = document.querySelectorAll(".info-option");
const infoTitle = document.getElementById("infoTitle");
const infoContent = document.getElementById("infoContent");

// TUTORIAL IMAGE ZOOM
let zoomImages = [];
let zoomCurrentIndex = -1;
let zoomIsSlider = false;

function initializeImageZoom() {
    const tutorialImages = document.querySelectorAll(
        ".tutorial-container img"
    );

    if (tutorialImages.length === 0) {
        return;
    }

    tutorialImages.forEach(image => {
        image.onclick = event => {
            event.stopPropagation();

            const isStep3Image =
                image.classList.contains("tutorial-slide");

            if (isStep3Image) {
                zoomImages = Array.from(
                    document.querySelectorAll(".tutorial-slide")
                );

                zoomCurrentIndex = zoomImages.indexOf(image);
                zoomIsSlider = true;

                openImageZoom(
                    image.src,
                    image.alt || ""
                );
            }
            else {
                zoomImages = [];
                zoomCurrentIndex = -1;
                zoomIsSlider = false;

                openImageZoom(
                    image.src,
                    image.alt || ""
                );
            }
        };
    });
}

function createImageZoomOverlay() {
    let overlay = document.getElementById("imageZoomOverlay");

    if (overlay) {
        return overlay;
    }

    overlay = document.createElement("div");
    overlay.id = "imageZoomOverlay";
    overlay.className = "image-zoom-overlay";

    overlay.innerHTML = `
        <button
            type="button"
            class="image-zoom-close"
            id="imageZoomClose"
            aria-label="Close enlarged image"
        >
            ×
        </button>

        <button
            type="button"
            class="image-zoom-prev"
            id="imageZoomPrev"
            aria-label="Previous image"
        >
            &#10094;
        </button>

        <img
            class="image-zoom-preview"
            id="imageZoomPreview"
            alt=""
        >

        <button
            type="button"
            class="image-zoom-next"
            id="imageZoomNext"
            aria-label="Next image"
        >
            &#10095;
        </button>
    `;

    document.body.appendChild(overlay);

    const closeButton =
        document.getElementById("imageZoomClose");

    const previousButton =
        document.getElementById("imageZoomPrev");

    const nextButton =
        document.getElementById("imageZoomNext");

    closeButton.addEventListener(
        "click",
        closeImageZoom
    );

    previousButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            showZoomImage(zoomCurrentIndex - 1);
        }
    );

    nextButton.addEventListener(
        "click",
        event => {
            event.stopPropagation();
            showZoomImage(zoomCurrentIndex + 1);
        }
    );

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeImageZoom();
        }
    });

    return overlay;
}

function openImageZoom(imageSrc, imageAlt) {
    const overlay = createImageZoomOverlay();

    const preview =
        document.getElementById("imageZoomPreview");

    preview.src = imageSrc;
    preview.alt = imageAlt;

    updateZoomNavigation();

    overlay.classList.add("active");

    document.body.classList.add("image-zoom-open");
}

function showZoomImage(index) {
    if (!zoomIsSlider || zoomImages.length === 0) {
        return;
    }

    if (index >= zoomImages.length) {
        index = 0;
    }

    if (index < 0) {
        index = zoomImages.length - 1;
    }

    zoomCurrentIndex = index;

    const image = zoomImages[zoomCurrentIndex];

    const preview =
        document.getElementById("imageZoomPreview");

    if (!preview) {
        return;
    }

    preview.src = image.src;
    preview.alt = image.alt || "";

    updateZoomNavigation();
}

function updateZoomNavigation() {
    const previousButton =
        document.getElementById("imageZoomPrev");

    const nextButton =
        document.getElementById("imageZoomNext");

    if (!previousButton || !nextButton) {
        return;
    }

    if (zoomIsSlider && zoomImages.length > 1) {
        previousButton.classList.add("visible");
        nextButton.classList.add("visible");
    }
    else {
        previousButton.classList.remove("visible");
        nextButton.classList.remove("visible");
    }
}

function closeImageZoom() {
    const overlay =
        document.getElementById("imageZoomOverlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("active");

    document.body.classList.remove(
        "image-zoom-open"
    );

    zoomImages = [];
    zoomCurrentIndex = -1;
    zoomIsSlider = false;
}

document.addEventListener("keydown", event => {

    const overlay =
        document.getElementById("imageZoomOverlay");

    if (
        !overlay ||
        !overlay.classList.contains("active")
    ) {
        return;
    }

    if (event.key === "Escape") {
        closeImageZoom();
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        showZoomImage(zoomCurrentIndex + 1);
        return;
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        showZoomImage(zoomCurrentIndex - 1);
        return;
    }
});

// TUTORIAL IMAGE SLIDER
function initializeTutorialSlider() {

    const slides =
        document.querySelectorAll(".tutorial-slide");

    const dots =
        document.querySelectorAll(".dot");

    const slider =
        document.querySelector(".tutorial-slider");

    if (
        slides.length === 0 ||
        dots.length === 0 ||
        !slider
    ) {
        initializeImageZoom();
        return;
    }

    let currentIndex = 0;

    function showSlide(index) {

        if (index >= slides.length) {
            currentIndex = 0;
        }
        else if (index < 0) {
            currentIndex = slides.length - 1;
        }
        else {
            currentIndex = index;
        }

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        dots.forEach(dot => {
            dot.classList.remove("active");
        });

        slides[currentIndex].classList.add("active");
        dots[currentIndex].classList.add("active");
    }

    dots.forEach((dot, index) => {

        dot.onclick = event => {
            event.stopPropagation();

            showSlide(index);
        };

    });

    slider.addEventListener("click", event => {

        if (
            event.target.classList.contains(
                "tutorial-slide"
            )
        ) {

            zoomImages = Array.from(
                document.querySelectorAll(
                    ".tutorial-slide"
                )
            );

            zoomCurrentIndex =
                zoomImages.indexOf(
                    event.target
                );

            zoomIsSlider = true;

            openImageZoom(
                event.target.src,
                event.target.alt || ""
            );

            return;
        }

        const box =
            slider.getBoundingClientRect();

        const clickX =
            event.clientX - box.left;

        const middle =
            box.width / 2;

        if (clickX > middle) {
            showSlide(currentIndex + 1);
        }
        else {
            showSlide(currentIndex - 1);
        }
    });

    initializeImageZoom();
}

const informationData = {

    about: {
        title: "About the System",
        content: `
        <h3>Password Vulnerability Classification</h3>

        <p>
        This system analyzes user-generated passwords
        to identify possible vulnerabilities against
        common password cracking strategies.
        </p>

        <p>
        Unlike traditional password meters that only
        provide strength scores, this system determines
        what type of attack strategy may become effective
        against the password.
        </p>

        <p>
        The system uses extracted password characteristics
        and applies a Decision Tree classification model
        to identify possible vulnerability patterns.
        </p>
        `
    },

    process: {
        title: "How The System Works",
        content: `
        <h3>Password Processing Flow</h3>

        <ol>
            <li>User enters a password for analysis.</li>
            <li>The system extracts password characteristics.</li>
            <li>The original password is removed after extraction.</li>
            <li>Only the generated password representation is retained for analysis.</li>
            <li>Extracted features are evaluated by the classification model.</li>
            <li>The Decision Tree identifies the possible cracking method.</li>
            <li>The system displays the vulnerability result and recommended improvements.</li>
        </ol>
        `
    },

    analysis: {
        title: "Password Characteristics Analyzed",
        content: `
        <h3>Features Examined</h3>

        <p>
        The system checks password structures and patterns
        without storing the original password.
        </p>

        <ul>
            <li>Password Length</li>
            <li>Presence of Lowercase Letters</li>
            <li>Presence of Uppercase Letters</li>
            <li>Presence of Numbers</li>
            <li>Presence of Symbols</li>
            <li>Dictionary Word Detection</li>
            <li>Leetspeak Usage</li>
            <li>Numeric Suffix Patterns</li>
            <li>Sequential Patterns</li>
            <li>Repeated Characters or Patterns</li>
            <li>Rule-Based Pattern Detection</li>
        </ul>

        <p>
        Character class count is also generated internally
        for system classification purposes.
        </p>
        `
    },

    methods: {
        title: "Password Cracking Methods",
        content: `
        <h3>Possible Attack Strategies</h3>

        <p>
        The system classifies password vulnerability
        according to three common cracking approaches.
        </p>

        <ul>
            <li>
                <strong>Dictionary Attack</strong>
                <br>
                Attempts commonly used words, phrases, and known password patterns.
            </li>

            <li>
                <strong>Brute Force Attack</strong>
                <br>
                Attempts possible character combinations until the password is discovered.
            </li>

            <li>
                <strong>Rule-Based Attack</strong>
                <br>
                Applies transformation rules such as adding numbers, replacing characters,
                or modifying common password formats.
            </li>
        </ul>
        `
    },

    decision: {
        title: "Decision Tree Classification",
        content: `
        <h3>Machine Learning Classification</h3>

        <p>
        The system uses a supervised Decision Tree model
        to classify password vulnerability.
        </p>

        <p>
        The extracted password characteristics serve
        as input values that allow the model to determine
        the most likely cracking method.
        </p>

        <p>
        The classification result helps users understand
        what security weakness should be improved.
        </p>
        `
    },

    tutorial: {
        title: "System Tutorial",
        content: `
        <h3>How To Use The System</h3>

        <p>Follow these steps to analyze your password.</p>

        <div class="tutorial-container">
            <p>Step 1: Enter your password in the input field.</p>
            <img src="../assets/images/step1.png">
        </div>

        <div class="tutorial-container">
            <p>Step 2: Click Analyze Password to begin feature extraction.</p>
            <img src="../assets/images/step2.png">
        </div>

        <div class="tutorial-container">
            <p>Step 3: Review the vulnerability result and recommendations.</p>
            <p>Click an image to view the next step.</p>

            <div class="tutorial-slider">

                <img
                    class="tutorial-slide active"
                    src="../assets/images/step3%20(1).png"
                >

                <img
                    class="tutorial-slide"
                    src="../assets/images/step3%20(2).png"
                >

                <img
                    class="tutorial-slide"
                    src="../assets/images/step3%20(3).png"
                >

                <img
                    class="tutorial-slide"
                    src="../assets/images/step3%20(4).png"
                >

                <img
                    class="tutorial-slide"
                    src="../assets/images/step3%20(5).png"
                >

                <img
                    class="tutorial-slide"
                    src="../assets/images/step3%20(6).png"
                >

                <img
                    class="tutorial-slide"
                    src="../assets/images/step3%20(7).png"
                >

            </div>

            <div class="tutorial-dots">

                <span class="dot active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>

            </div>
        </div>
        `
    }

};

infoButtons.forEach(button => {

    button.addEventListener("click", () => {

        const section =
            button.dataset.section;

        const selected =
            informationData[section];

        if (selected) {

            infoTitle.textContent =
                selected.title;

            infoContent.innerHTML =
                selected.content;

            if (section === "tutorial") {
                initializeTutorialSlider();
            }
        }

        infoButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

    });

});

// PASSWORD ANALYSIS BUTTON
const scanButton =
    document.getElementById("scanButton");

if (passwordInput && scanButton) {

    passwordInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                scanButton.click();

            }

        }
    );

}

if (scanButton && passwordInput) {

    scanButton.addEventListener(
        "click",
        async () => {

            const password =
                passwordInput.value.trim();

            if (password === "") {

                passwordInput.focus();

                passwordInput.style.boxShadow =
                    "0 0 25px rgba(239,68,68,.8)";

                setTimeout(() => {

                    passwordInput.style.boxShadow =
                        "";

                }, 1000);

                return;

            }

            scanButton.disabled = true;

            scanButton.textContent =
                "Analyzing...";

            try {

                const response =
                    await fetch(
                        "http://localhost:3000/analyze",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                password: password
                            })
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Server Error"
                    );
                }

                const result =
                    await response.json();

                sessionStorage.setItem(
                    "analysisResult",
                    JSON.stringify(result)
                );

                localStorage.setItem(
                    "analyzedPassword",
                    password
                );

                sessionStorage.setItem(
                    "showResultTutorial",
                    "true"
                );

                window.location.href =
                    "result.html";

            }
            catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to the analysis server."
                );

                scanButton.disabled = false;

                scanButton.textContent =
                    "Analyze Password";

            }

        }
    );

}

// INITIAL PAGE RESET
sessionStorage.removeItem(
    "analysisResult"
);

localStorage.removeItem(
    "analyzedPassword"
);

localStorage.removeItem(
    "comparisonResult"
);

localStorage.removeItem(
    "originalAnalysisResult"
);

if (passwordInput) {
    passwordInput.value = "";
}

if (scanButton) {

    scanButton.disabled = false;

    scanButton.textContent =
        "Analyze Password";

}

history.replaceState(
    null,
    "",
    window.location.href
);

history.pushState(
    null,
    "",
    window.location.href
);

window.addEventListener(
    "popstate",
    () => {

        sessionStorage.removeItem(
            "analysisResult"
        );

        localStorage.removeItem(
            "analyzedPassword"
        );

        localStorage.removeItem(
            "comparisonResult"
        );

        localStorage.removeItem(
            "originalAnalysisResult"
        );

        if (passwordInput) {
            passwordInput.value = "";
        }

        if (scanButton) {

            scanButton.disabled = false;

            scanButton.textContent =
                "Analyze Password";

        }

        history.pushState(
            null,
            "",
            window.location.href
        );

    }
);

window.addEventListener(
    "pageshow",
    event => {

        if (event.persisted) {

            sessionStorage.removeItem(
                "analysisResult"
            );

            localStorage.removeItem(
                "analyzedPassword"
            );

            localStorage.removeItem(
                "comparisonResult"
            );

            localStorage.removeItem(
                "originalAnalysisResult"
            );

            if (passwordInput) {
                passwordInput.value = "";
            }

            if (scanButton) {

                scanButton.disabled = false;

                scanButton.textContent =
                    "Analyze Password";

            }

        }

    }
);

window.addEventListener(
    "unload",
    function () {}
);