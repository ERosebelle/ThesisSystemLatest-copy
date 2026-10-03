document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "https://thesissystemlatest.onrender.com/analyze";

    fetch(API_URL, {
        method: "HEAD"
    }).catch(() => {});


    const passwordInput = document.getElementById("passwordInput");
    const togglePassword = document.getElementById("togglePassword");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClosed = document.getElementById("eyeClosed");
    const scanButton = document.getElementById("scanButton");

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword ? "text" : "password";

            if (eyeOpen) {
                eyeOpen.style.display =
                    isPassword ? "none" : "block";
            }

            if (eyeClosed) {
                eyeClosed.style.display =
                    isPassword ? "block" : "none";
            }
        });
    }


    const infoButton = document.getElementById("infoButton");
    const infoPanel = document.getElementById("infoPanel");
    const closeInfo = document.getElementById("closeInfo");
    const infoTitle = document.getElementById("infoTitle");
    const infoContent = document.getElementById("infoContent");

    const infoMenu =
        document.querySelector(".info-menu");

    const infoItems =
        document.querySelectorAll(".info-item");


    const information = {

        about: {
            title: "About the System",
            content: `
                <p>
                    The Password Vulnerability Classification System
                    analyzes user-generated passwords and identifies
                    their dominant vulnerability type.
                </p>

                <p>
                    The system classifies passwords into
                    <strong>Brute-Force</strong>,
                    <strong>Dictionary-Based</strong>, or
                    <strong>Rule-Based</strong> vulnerability.
                </p>

                <p>
                    It also provides a risk level, explanation,
                    decision-tree path, and recommendations.
                </p>
            `
        },

        how: {
            title: "How It Works",
            content: `
                <p>
                    The system first extracts structural
                    characteristics from the password.
                </p>

                <p>
                    These characteristics are converted into
                    a feature vector and processed by the
                    trained CART Decision Tree model.
                </p>

                <p>
                    The system then follows the decision path
                    to determine the dominant vulnerability
                    classification and corresponding risk level.
                </p>
            `
        },

        analysis: {
            title: "Password Analysis",
            content: `
                <p>
                    The system analyzes characteristics such as
                    password length, character classes, dictionary
                    words, leetspeak, numeric placement, sequences,
                    repetitions, and recognizable patterns.
                </p>

                <p>
                    The analysis focuses on password characteristics
                    rather than attempting to reveal or crack the
                    password.
                </p>
            `
        },

        cracking: {
            title: "Cracking Methods",
            content: `
                <p>
                    <strong>Brute-Force</strong> refers to systematically
                    trying possible combinations of characters.
                </p>

                <p>
                    <strong>Dictionary-Based</strong> attacks use known
                    words or commonly used terms as password guesses.
                </p>

                <p>
                    <strong>Rule-Based</strong> attacks apply predictable
                    transformations, substitutions, sequences,
                    repetitions, or common password patterns.
                </p>
            `
        },

        decision: {
            title: "Decision Tree",
            content: `
                <p>
                    The system uses a CART Decision Tree to classify
                    password vulnerability.
                </p>

                <p>
                    Each decision node evaluates a password feature
                    and determines which branch should be followed.
                </p>

                <p>
                    The resulting path provides an explanation of
                    how the classification was reached.
                </p>
            `
        },

        tutorial: {
            title: "Tutorial",
            content: `
                <div class="tutorial-slider">

                    <div class="tutorial-images">

                        <div class="tutorial-slide active">
                            <img src="../assets/images/tut1.png" alt="Tutorial Step 1">
                        </div>

                        <div class="tutorial-slide">
                            <img src="../assets/images/tut2.png" alt="Tutorial Step 2">
                        </div>

                        <div class="tutorial-slide">
                            <img src="../assets/images/tut3.png" alt="Tutorial Step 3">
                        </div>

                        <div class="tutorial-slide">
                            <img src="../assets/images/tut4.png" alt="Tutorial Step 4">
                        </div>

                        <div class="tutorial-slide">
                            <img src="../assets/images/tut5.png" alt="Tutorial Step 5">
                        </div>

                        <div class="tutorial-slide">
                            <img src="../assets/images/tut6.png" alt="Tutorial Step 6">
                        </div>

                        <div class="tutorial-slide">
                            <img src="../assets/images/tut7.png" alt="Tutorial Step 7">
                        </div>

                    </div>

                    <div class="tutorial-dots">
                        <span class="tutorial-dot active" data-slide="0"></span>
                        <span class="tutorial-dot" data-slide="1"></span>
                        <span class="tutorial-dot" data-slide="2"></span>
                        <span class="tutorial-dot" data-slide="3"></span>
                        <span class="tutorial-dot" data-slide="4"></span>
                        <span class="tutorial-dot" data-slide="5"></span>
                        <span class="tutorial-dot" data-slide="6"></span>
                    </div>

                </div>
            `
        }
    };


    function updateInfoMenuArrow() {

        if (!infoMenu) {
            return;
        }

        const hasOverflow =
            infoMenu.scrollWidth > infoMenu.clientWidth + 5;

        const atEnd =
            infoMenu.scrollLeft +
            infoMenu.clientWidth >=
            infoMenu.scrollWidth - 5;

        infoMenu.classList.toggle("has-overflow", hasOverflow);
        infoMenu.classList.toggle("at-end", atEnd);
    }


    function initializeInfoMenuScroll() {

        if (!infoMenu) {
            return;
        }

        infoMenu.addEventListener(
            "scroll",
            updateInfoMenuArrow,
            { passive: true }
        );

        updateInfoMenuArrow();
    }


    function scrollToInfo() {

        if (!infoPanel) {
            return;
        }

        if (window.innerWidth <= 768) {

            setTimeout(() => {

                infoPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);
        }
    }


    function openInfoPanel(type) {

        if (
            !infoPanel ||
            !infoTitle ||
            !infoContent
        ) {
            return;
        }

        const data = information[type];

        if (!data) {
            return;
        }

        infoTitle.textContent = data.title;
        infoContent.innerHTML = data.content;

        infoPanel.classList.add("active");

        infoItems.forEach(item => {
            item.classList.remove("active");

            if (item.dataset.info === type) {
                item.classList.add("active");
            }
        });

        if (infoMenu) {
            infoMenu.scrollLeft = 0;
        }

        updateInfoMenuArrow();

        initializeImageZoom();
        initializeTutorialSlider();

        scrollToInfo();
    }


    function closeInfoPanel() {

        if (!infoPanel) {
            return;
        }

        infoPanel.classList.remove("active");

        infoItems.forEach(item => {
            item.classList.remove("active");
        });

        if (window.innerWidth <= 768) {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }


    if (infoItems.length) {

        infoItems.forEach(item => {

            item.addEventListener("click", () => {
                openInfoPanel(item.dataset.info);
            });
        });
    }


    if (infoButton) {

        infoButton.addEventListener("click", () => {

            if (infoMenu) {
                infoMenu.scrollLeft = 0;
            }

            scrollToInfo();

            setTimeout(updateInfoMenuArrow, 250);
        });
    }


    if (closeInfo) {
        closeInfo.addEventListener("click", closeInfoPanel);
    }


    function createImageZoomOverlay(image) {

        if (!image) {
            return;
        }

        const existing =
            document.querySelector(".image-zoom-overlay");

        if (existing) {
            existing.remove();
        }

        const overlay =
            document.createElement("div");

        overlay.className = "image-zoom-overlay";

        const preview =
            document.createElement("img");

        preview.src = image.src;
        preview.alt = image.alt || "";

        const closeButton =
            document.createElement("button");

        closeButton.className = "image-zoom-close";
        closeButton.innerHTML = "&times;";

        overlay.appendChild(preview);
        overlay.appendChild(closeButton);

        document.body.appendChild(overlay);

        preview.style.left = "50%";
        preview.style.top = "50%";
        preview.style.transform = "translate(-50%, -50%)";

        overlay.addEventListener("click", () => {
            overlay.remove();
        });

        closeButton.addEventListener("click", event => {
            event.stopPropagation();
            overlay.remove();
        });

        preview.addEventListener("click", event => {
            event.stopPropagation();
        });
    }


    function initializeImageZoom() {

        if (!infoContent) {
            return;
        }

        const images =
            infoContent.querySelectorAll(".tutorial-slide img");

        images.forEach(image => {

            if (image.dataset.zoomInitialized) {
                return;
            }

            image.dataset.zoomInitialized = "true";

            image.addEventListener("click", event => {

                event.stopPropagation();

                if (window.innerWidth <= 768) {

                    scrollToInfo();

                    setTimeout(() => {
                        createImageZoomOverlay(image);
                    }, 150);

                } else {
                    createImageZoomOverlay(image);
                }
            });
        });
    }


    let currentSlide = 0;


    function showTutorialSlide(index) {

        const slides =
            infoContent?.querySelectorAll(".tutorial-slide");

        const dots =
            infoContent?.querySelectorAll(".tutorial-dot");

        if (!slides || !slides.length) {
            return;
        }

        if (index < 0 || index >= slides.length) {
            return;
        }

        currentSlide = index;

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentSlide);
        });

        if (dots) {
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === currentSlide);
            });
        }

        scrollToInfo();

        initializeImageZoom();
    }


    function initializeTutorialSlider() {

        if (!infoContent) {
            return;
        }

        const slides =
            infoContent.querySelectorAll(".tutorial-slide");

        const dots =
            infoContent.querySelectorAll(".tutorial-dot");

        if (!slides.length) {
            return;
        }

        currentSlide = 0;

        slides.forEach(slide => {

            slide.onclick = event => {

                const target = event.target;

                if (target && target.tagName === "IMG") {
                    return;
                }

                const rect = slide.getBoundingClientRect();
                const clickX = event.clientX - rect.left;

                if (clickX < rect.width / 2) {

                    if (currentSlide > 0) {
                        showTutorialSlide(currentSlide - 1);
                    }

                } else if (currentSlide < slides.length - 1) {
                    showTutorialSlide(currentSlide + 1);
                }
            };
        });

        dots.forEach(dot => {

            dot.onclick = event => {

                event.stopPropagation();

                showTutorialSlide(Number(dot.dataset.slide));

                scrollToInfo();
            };
        });

        showTutorialSlide(0);
    }


    function clearAnalysisData() {

        sessionStorage.removeItem("analysisResult");
        localStorage.removeItem("analyzedPassword");
        localStorage.removeItem("comparisonResult");
        localStorage.removeItem("originalAnalysisResult");
    }


    function resetAnalyzeForm() {

        if (passwordInput) {
            passwordInput.value = "";
        }

        if (scanButton) {
            scanButton.disabled = false;
            scanButton.textContent = "ANALYZE PASSWORD";
        }
    }


    if (passwordInput && scanButton) {

        passwordInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                event.preventDefault();
                scanButton.click();
            }
        });
    }


    if (scanButton && passwordInput) {

        scanButton.addEventListener("click", async () => {

            const password = passwordInput.value.trim();

            if (password === "") {

                passwordInput.focus();

                passwordInput.style.boxShadow =
                    "0 0 25px rgba(239,68,68,.8)";

                setTimeout(() => {
                    passwordInput.style.boxShadow = "";
                }, 1000);

                return;
            }

            const originalText = scanButton.textContent;

            scanButton.disabled = true;
            scanButton.textContent = "ANALYZING...";

            try {

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        password: password
                    })
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const analysisResult = await response.json();

                sessionStorage.setItem(
                    "analysisResult",
                    JSON.stringify(analysisResult)
                );

                localStorage.setItem(
                    "analyzedPassword",
                    password
                );

                sessionStorage.setItem(
                    "showResultTutorial",
                    "true"
                );

                window.location.href = "result.html";

            } catch (error) {

                console.error("Analysis error:", error);

                alert(
                    "Unable to connect to the analysis server. Please try again."
                );

                scanButton.disabled = false;
                scanButton.textContent = originalText;
            }
        });
    }


    clearAnalysisData();
    resetAnalyzeForm();


    history.replaceState(null, "", window.location.href);
    history.pushState(null, "", window.location.href);


    window.addEventListener("popstate", () => {

        clearAnalysisData();
        resetAnalyzeForm();

        history.pushState(null, "", window.location.href);
    });


    window.addEventListener("pageshow", event => {

        if (event.persisted) {
            clearAnalysisData();
            resetAnalyzeForm();
        }
    });


    initializeInfoMenuScroll();

    window.addEventListener("resize", updateInfoMenuArrow);


    let secretSequence = [];

    const secretCode = [
        "blue",
        "Enter",
        "red",
        "Enter",
        "red",
        "Enter"
    ];

    document.addEventListener("keydown", event => {

        secretSequence.push(event.key);

        if (secretSequence.length > secretCode.length) {
            secretSequence.shift();
        }

        const matches =
            secretSequence.length === secretCode.length &&
            secretSequence.every(
                (key, index) => key === secretCode[index]
            );

        if (matches) {

            window.location.href =
                "../secrett/secretInitial.html";

            secretSequence = [];
        }
    });

});