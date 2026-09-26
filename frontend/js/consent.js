const contentArea = document.getElementById("contentArea");
const sections = document.querySelectorAll(".content-area section");
const menuItems = document.querySelectorAll(".section-booklet li");
const energyScroll = document.querySelector(".energy-scroll");
const energyTrack = document.querySelector(".energy-track");
const energyThumb = document.getElementById("energyThumb");

// =========================
// SECTION FOLLOW SYSTEM
// =========================
function updateSection() {
    let current = 0;
    const containerTop = contentArea.getBoundingClientRect().top;

    sections.forEach((section, index) => {
        const sectionTop =
            section.getBoundingClientRect().top - containerTop;

        if (sectionTop <= 180) {
            current = index;
        }
    });

    updateLeft(current);
    updateEnergy(current);
}

// =========================
// LEFT LIGHT
// =========================
function updateLeft(index) {
    menuItems.forEach((item, i) => {
        item.classList.toggle("active", i === index);
    });
}

// =========================
// ENERGY CORE
// =========================
function updateEnergy(index) {
    const total = sections.length - 1;

    if (total <= 0) {
        energyThumb.style.top = "0%";
        return;
    }

    const movement = (index / total) * 80;
    energyThumb.style.top = movement + "%";
}

// =========================
// SCROLL CONTENT
// =========================
contentArea.addEventListener("scroll", updateSection);

// =========================
// CLICK LEFT MENU
// =========================
menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        sections[index].scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});

// =========================
// CLICK ENERGY TRACK
// =========================
energyTrack.addEventListener("click", (event) => {
    if (event.target === energyThumb) return;

    const rect = energyTrack.getBoundingClientRect();

    const clickPosition = event.clientY - rect.top;
    const percentage = clickPosition / rect.height;

    const maxScroll =
        contentArea.scrollHeight - contentArea.clientHeight;

    contentArea.scrollTo({
        top: percentage * maxScroll,
        behavior: "smooth"
    });
});

// =========================
// DRAG ENERGY THUMB
// =========================
let isDragging = false;

energyThumb.addEventListener("mousedown", (event) => {
    isDragging = true;
    event.preventDefault();
});

document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const rect = energyTrack.getBoundingClientRect();

    let position = event.clientY - rect.top;

    const thumbHeight = energyThumb.offsetHeight;

    const minPosition = 0;
    const maxPosition = rect.height - thumbHeight;

    position = Math.max(
        minPosition,
        Math.min(position, maxPosition)
    );

    const percentage = position / maxPosition;

    const maxScroll =
        contentArea.scrollHeight - contentArea.clientHeight;

    contentArea.scrollTop = percentage * maxScroll;
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

// =========================
// FIRST LOAD
// =========================
window.addEventListener("load", updateSection);

// =========================
// CONSENT CHECKBOX
// =========================
const checkbox = document.getElementById("consentCheckbox");
const acceptBtn = document.getElementById("acceptBtn");

if (checkbox && acceptBtn) {
    checkbox.addEventListener("change", () => {
        acceptBtn.disabled = !checkbox.checked;
    });
}

// =========================
// DECLINE MODAL
// =========================
const declineBtn = document.getElementById("declineBtn");
const modal = document.getElementById("declineModal");
const closeModal = document.getElementById("closeModal");

if (declineBtn && modal) {
    declineBtn.onclick = () => {
        modal.style.display = "flex";
    };
}

if (closeModal && modal) {
    closeModal.onclick = () => {
        modal.style.display = "none";
    };
}

// =========================
// ACCEPT
// =========================
if (acceptBtn) {
    acceptBtn.onclick = () => {
        if (!acceptBtn.disabled) {
            localStorage.setItem("consentAccepted", "true");

            document.body.classList.add("page-exit");

            setTimeout(() => {
                window.location.replace("initialTest.html");
            }, 800);
        }
    };
}

// =========================
// DISABLE BF CACHE
// =========================
window.addEventListener("unload", function () {});