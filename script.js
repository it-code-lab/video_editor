//SM-Note-Run server
//(venv) C:\0.data\4.SM-WSpace\6B.Python\1.Create_Video_From_Readernook_Story\application>python server.py

// 🔹 Dummy Caption Data for Preview
let dummyCaptionsData = [
    { "word": "This", "start": 0.0, "end": 0.22 },
    { "word": "is", "start": 0.22, "end": 0.36 },
    { "word": "a", "start": 0.36, "end": 0.48 },
    { "word": "caption", "start": 0.48, "end": 0.72 },
    { "word": "preview", "start": 0.72, "end": 1.12 }
];

const textColors = [
    "#222222",
    "#9f2f16",
    "#85540d",
    "#46850d",
    "#0d5a85",
    "#5f0d85"
];

const bgColors = [
    "#e9d7f2",
    "#d7eaf2",
    "#adf3e2",
    "#d2f3ad",
    "#f3efad",
    "#f3c7ad"
];

const fontSizes = ["1.9em", "1.8em", "2em", "2.5em", "2.3em"];
const angles = ["angle1", "angle2", "angle3", "angle4", "angle5", "angle6"];

const wordEditor = document.getElementById("word-editor");
const notebookEditor = document.getElementById("notebooklm-editor");
const notebooklmText = document.getElementById("notebooklmText");

let markedSections = JSON.parse(localStorage.getItem("markedSections")) || [];
let currentSection = {};

const saveWordChanges = document.getElementById("save-word-changes");
let wordTimestamps = [];


let overlayData = [];
let currentOverlayText = "";

let currentStayingHeading = "";
let stayingListItems = [];


const audioEffect = new Audio();

// 🔹 Load Sound Effects Data
const headingSound = "sounds/heading_whoosh.wav";  // Example sound for headings
const listItemSound = "sounds/list_item_pop.wav";  // Example sound for list items


//let currentCaptionIndex = 0;  // Track the index of the caption being displayed
let captionsData = [];
let currentCaption = "";

let captionWordLimit = 5;  // Default number of words per block
let currentBlockStart = 0; // Track where the current caption block starts
let lastSpokenWordIndex = -1; // Last word index processed
let lastCaptionUpdateTime = 0; // Time when captions were last updated

let previewTime = 0.0;
let previewInterval;

// 🔹 Track Played Sounds
let playedSounds = new Set();

const bgMusicSelect = document.getElementById("bgMusicSelect");
const previewMusicBtn = document.getElementById("previewMusic");
const stopPreviewBtn = document.getElementById("stopPreview");

const videoVolumeSlider = document.getElementById("videoVolume");
const bgMusicVolume = document.getElementById("bgMusicVolume");
const effectVolume = document.getElementById("effectVolume");

const audioBackground = new Audio();

const videoContainer = document.getElementById("video-container");
const videoOrientation = document.getElementById("videoOrientation");

// Load structured_output.json (for headings & list items)
//fetch('temp/structured_output.json')
fetch("http://localhost:5000/get_structured_output")
    .then(response => response.json())
    .then(data => {
        overlayData = data;

    })
    .catch(error => console.error("Error loading overlay data:", error));

// Load full_text and word_timestamps (for captions)
//fetch('temp/word_timestamps.json')
fetch("http://localhost:5000/get_word_timestamps")
    .then(response => response.json())
    .then(data => {
        captionsData = data;
        wordTimestamps = data;
        renderWordEditor();
    })
    .catch(error => console.error("Error loading captions data:", error));

const video = document.getElementById("video");
const playPauseBtn = document.getElementById("playPauseBtn");
const restartBtn = document.getElementById("restartBtn");
const videoTimeDisplay = document.getElementById("video-time");
const timeline = document.getElementById("timeline");
const captionStyleDropdown = document.getElementById("captionStyle");
//const captionPreview = document.getElementById("caption-preview");
let selectedStyle;
const subscribeGif = document.getElementById("subscribe-gif");
const disableSubscribeFlag = document.getElementById("disableSubscribe");

video.volume = 1.0;  // Set default volume to max

// 🔹 Hide Default Video Controls
video.removeAttribute("controls");

// 🔹 Play/Pause Button Functionality
playPauseBtn.addEventListener("click", () => {
    if (video.paused) {
        video.play();
        const selectedMusic = bgMusicSelect.value;
        if (selectedMusic !== "none") {
            audioBackground.src = `sounds/${selectedMusic}`;
            audioBackground.loop = true;
            audioBackground.volume = bgMusicVolume.value; // Keep it subtle
            audioBackground.play();
        }
        playPauseBtn.innerHTML = "⏸ Pause";
    } else {
        video.pause();
        audioBackground.pause();
        playPauseBtn.innerHTML = "▶ Play";
    }
});

// 🔹 Restart Button Functionality
restartBtn.addEventListener("click", () => {
    video.currentTime = 0;
    video.play();
    const selectedMusic = bgMusicSelect.value;
    if (selectedMusic !== "none") {
        audioBackground.src = `sounds/${selectedMusic}`;
        audioBackground.loop = true;
        audioBackground.volume = 0.3; // Keep it subtle
        audioBackground.play();
    }
    playPauseBtn.innerHTML = "⏸ Pause";  // Change button to "Pause" when restarted

    //currentCaptionIndex = 0;  // Reset caption tracking
    captions.innerHTML = "";  // Clear previous captions
    currentBlockStart = 0
});

// 🔹 Format Time Function (Convert Seconds to mm:ss)
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// // 🔹 Update Time Display
// video.addEventListener("timeupdate", () => {
//     videoTimeDisplay.innerHTML = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
// });

// 🔹 Update Total Duration When Metadata Loads
video.addEventListener("loadedmetadata", () => {
    console.log("🔹 Video Duration:", video.duration);
    timeline.max = video.duration;
    videoTimeDisplay.innerHTML = `00:00 / ${formatTime(video.duration)}`;
});

function updateProperties() {
    // Update properties based on user input
    captionWordLimit = parseInt(captionInput.value, 10) || 5; // Default to 5 if input is empty
    console.log("captionInput.value:", captionInput.value);
    console.log("Caption word limit:", captionWordLimit);
    selectedStyle = captionStyleDropdown.value;
    // Remove old styles
    captions.className = "captions-text";
    //captionPreview.className = "preview-captions-text";

    // Apply new style
    captions.classList.add(selectedStyle);
    console.log("captionStyleDropdown.value:", captionStyleDropdown.value);
    updateVideoOrientation(); // Update video orientation based on user selection
}
const overlay = document.getElementById("overlayText");


const overlayContainer = document.getElementById("overlayContainer");
const stayingHeading = document.createElement("div"); // Element for staying headings
stayingHeading.classList.add("staying-heading");
overlayContainer.appendChild(stayingHeading);

const stayingListContainer = document.createElement("div"); // Container for staying list items
stayingListContainer.classList.add("staying-list-container");
overlayContainer.appendChild(stayingListContainer);


const captions = document.getElementById("captions");

const captionInput = document.getElementById("captionLength");

// Update caption word limit dynamically from user input
captionInput.addEventListener("input", () => {
    captionWordLimit = parseInt(captionInput.value, 10) || 5;
});

selectedStyle = "style1";  // Default caption style
// Change Caption Style Based on Selection
captionStyleDropdown.addEventListener("change", () => {
    selectedStyle = captionStyleDropdown.value;

    // Remove old styles
    captions.className = "captions-text";
    //captionPreview.className = "preview-captions-text";

    // Apply new style
    captions.classList.add(selectedStyle);
    //captionPreview.classList.add(selectedStyle);
});

// Update caption word limit dynamically from user input
captionInput.addEventListener("input", () => {
    captionWordLimit = parseInt(captionInput.value, 10) || 5;
});

let videoDuration = video.duration;
//let blockWordStyles = [];
// Listen for video time updates
video.addEventListener("timeupdate", () => {
    updateOverlayAndCaptions();
});

function updateOverlayAndCaptions() {
    let currentTime = video.currentTime;


    // Find the current word being spoken
    let currentWordIndex = wordTimestamps.findIndex(word =>
        currentTime >= word.start && currentTime <= word.end
    );

    if (currentWordIndex !== -1) {
        // Highlight only the current word
        document.querySelectorAll(".word-editor-box").forEach((box, index) => {
            if (index === currentWordIndex) {
                box.classList.add("current");
            } else {
                box.classList.remove("current");
            }
        });

        // 🔹 Scroll the word editor smoothly without affecting the video view
        let wordEditor = document.getElementById("word-editor-wrapper");
        let currentWordBox = document.querySelectorAll(".word-editor-box")[currentWordIndex];

        if (currentWordBox) {
            let wordOffset = currentWordBox.offsetLeft - wordEditor.offsetWidth / 2 + currentWordBox.offsetWidth / 2;
            wordEditor.scrollLeft = wordOffset;
        }
    }

    let selectedOrientation = videoOrientation.value;

    if ((selectedOrientation === "portrait") || (disableSubscribeFlag.value === "yes")) {
        // Hide GIF in portrait mode or if subscribe is disabled
        subscribeGif.classList.add("hidden");
        subscribeGif.classList.remove("show-gif");
    } else {
        if (currentTime >= 30 && currentTime <= 35) {
            // Show GIF 30 seconds after start (for 5 seconds)
            subscribeGif.classList.add("show-gif");
            subscribeGif.classList.remove("hidden");
        } else if (videoDuration - currentTime <= 30 && videoDuration - currentTime >= 25) {
            // Show GIF 30 seconds before end (for 5 seconds)
            subscribeGif.classList.add("show-gif");
            subscribeGif.classList.remove("hidden");
        } else {
            // Hide otherwise
            subscribeGif.classList.remove("show-gif");
            subscribeGif.classList.add("hidden");
        }
    }
    /** 🔹 1. Show Headings & List Items **/
    const activeOverlay = overlayData.find(item =>
        currentTime >= item.start_word_start_timing && currentTime <= item.end_word_end_timing
    );

    if (activeOverlay) {
        if (activeOverlay.type === "staying-heading") {
            // Clear previous staying headings & list items when a new staying heading appears
            if (activeOverlay.text !== currentStayingHeading) {
                stayingHeading.innerText = activeOverlay.text;
                currentStayingHeading = activeOverlay.text;

                // 🔹 Reset animation (remove & re-add class)
                stayingHeading.classList.remove("fade-in-slide-down");
                void stayingHeading.offsetWidth;  // Trigger reflow to restart animation
                stayingHeading.classList.add("fade-in-slide-down");

                stayingListItems = []; // Reset list items
                stayingListContainer.innerHTML = ""; // Clear previous list items
            }

            if ((audioEffect.src !== headingSound) && !playedSounds.has(activeOverlay.text)) {
                audioEffect.src = headingSound;
                audioEffect.volume = effectVolume.value;
                audioEffect.play();
                playedSounds.add(activeOverlay.text);
            }
        }
        else if (activeOverlay.type === "staying-list-item") {
            // Ensure list item is not duplicated
            if (!stayingListItems.includes(activeOverlay.text)) {
                stayingListItems.push(activeOverlay.text);
                const listItem = document.createElement("div");
                listItem.classList.add("staying-list-item");
                listItem.innerText = activeOverlay.text;
                stayingListContainer.appendChild(listItem);
            }

            if ((audioEffect.src !== listItemSound) && !playedSounds.has(activeOverlay.text)) {
                audioEffect.src = listItemSound;
                audioEffect.volume = effectVolume.value;
                audioEffect.play();
                playedSounds.add(activeOverlay.text);
            }
        }
        else {
            // Handle regular headings & list items (disappear after time)
            if (activeOverlay.text !== currentOverlayText) {

                stayingHeading.innerText = "";
                currentStayingHeading = "";
                stayingListItems = []; // Reset list items
                stayingListContainer.innerHTML = ""; // Clear previous list items

                overlay.innerText = activeOverlay.text;
                overlay.classList.remove("heading", "list-item");
                overlay.classList.add(activeOverlay.type === "heading" ? "heading" : "list-item");
                overlay.classList.add("show");
                overlay.classList.remove("hide");
                currentOverlayText = activeOverlay.text;
                //hide onscreen captions when overlay is shown
                let selectedOrientation = videoOrientation.value;
                if (selectedOrientation === "portrait") {
                    captions.classList.add("none");
                }

            }

            if ((audioEffect.src !== headingSound) && !playedSounds.has(activeOverlay.text)) {
                audioEffect.src = headingSound;
                audioEffect.volume = effectVolume.value;
                audioEffect.play();
                playedSounds.add(activeOverlay.text);
            }
        }
    } else {
        // Hide normal headings & list items (not staying)
        if (currentOverlayText !== "") {
            overlay.classList.add("hide");
            setTimeout(() => overlay.classList.remove("show"), 500);
            currentOverlayText = "";
            captions.classList.remove("none");
        }

        playedSounds.clear();
    }

    timeline.value = video.currentTime;
    /** 🔹 2. Display Captions in Blocks & Maintain Them During Pauses **/
    timeline.max = video.duration;
    videoTimeDisplay.innerHTML = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

    let currentIndex = captionsData.findIndex(word => currentTime >= word.start && currentTime <= word.end);

    if (currentIndex !== -1) {
        // Only update if we reach the last word of the current block
        if (currentIndex >= currentBlockStart + captionWordLimit) {
            currentBlockStart = currentIndex; // Move to the next block
            lastCaptionUpdateTime = currentTime; // Update last update time

            // Store styles for this block only once
            blockWordStyles = captionsData.slice(currentBlockStart, Math.min(currentBlockStart + captionWordLimit, captionsData.length)).map(wordObj => ({
                textColor: textColors[Math.floor(Math.random() * textColors.length)],
                bgColor: bgColors[Math.floor(Math.random() * bgColors.length)],
                fontSize: fontSizes[Math.floor(Math.random() * fontSizes.length)],
                angle: angles[Math.floor(Math.random() * angles.length)]
            }));
        } else if (currentIndex < currentBlockStart) {
            // 🔹 Handling backward seeking (reset block start)
            currentBlockStart = Math.max(0, currentIndex - Math.floor(captionWordLimit / 2));
            lastCaptionUpdateTime = currentTime;

            // Recalculate styles for this block when seeking backward
            blockWordStyles = captionsData.slice(currentBlockStart, Math.min(currentBlockStart + captionWordLimit, captionsData.length)).map(wordObj => ({
                textColor: textColors[Math.floor(Math.random() * textColors.length)],
                bgColor: bgColors[Math.floor(Math.random() * bgColors.length)],
                fontSize: fontSizes[Math.floor(Math.random() * fontSizes.length)],
                angle: angles[Math.floor(Math.random() * angles.length)]
            }));
        }

        let endIdx = Math.min(currentBlockStart + captionWordLimit, captionsData.length);
        let currentBlockWords = captionsData.slice(currentBlockStart, endIdx);
        let displayedWords = "";

        if (selectedStyle !== "block-style") {
            displayedWords = currentBlockWords.map((wordObj) => {
                return (currentTime >= wordObj.start && currentTime <= wordObj.end)
                    ? `<span class="current-word">${wordObj.word}</span>` // Highlight spoken word
                    : wordObj.word;
            });
        } else {
            displayedWords = currentBlockWords.map((wordObj, index) => {
                let span = document.createElement("span");
                span.innerText = wordObj.word;

                // Retrieve previously stored styles for this block
                let style = blockWordStyles[index] || {};

                span.style.color = style.textColor || "#FFF";
                span.style.backgroundColor = style.bgColor || "#000";
                span.style.fontSize = style.fontSize || "1em";
                //span.classList.add(style.angle || "angle1"); // Apply stored angle
                span.classList.add("word-box"); // Applies bold block style

                // 🔹 Highlight spoken word
                if (currentTime >= wordObj.start && currentTime <= wordObj.end) {
                    span.classList.add("current-word");
                    span.classList.add(style.angle || "angle1");
                }

                return span.outerHTML;
            });
        }

        const newCaption = displayedWords.join(" ");

        if (newCaption !== captions.innerHTML) {
            captions.innerHTML = newCaption;
            captions.classList.add("show-caption");
            captions.classList.remove("hide-caption");
        }
    } else if (currentTime - lastCaptionUpdateTime < 4) {
        // 🔹 If there’s a pause, keep the last caption visible for 4 seconds
        captions.classList.add("show-caption");
        captions.classList.remove("hide-caption");
    } else if (captions.innerHTML !== "") {
        // 🔹 After the pause, fade out the caption
        captions.classList.add("hide-caption");
        setTimeout(() => captions.classList.remove("show-caption"), 300);
    }
}
// 🔹 Seek Video when Timeline is Clicked or Dragged
timeline.addEventListener("input", () => {
    video.currentTime = timeline.value;
    updateOverlayAndCaptions();
});

// 🔹 Simulate Caption Animation in Preview Section
function startPreviewAnimation_Not_in_use() {
    clearInterval(previewInterval); // Reset animation if already running
    previewTime = 0.0;

    previewInterval = setInterval(() => {
        previewTime += 0.1; // Move forward in time

        let currentIndex = dummyCaptionsData.findIndex(word => previewTime >= word.start && previewTime <= word.end);

        if (currentIndex !== -1) {
            let displayedWords = dummyCaptionsData.map((wordObj, index) => {
                return index === currentIndex
                    ? `<span class="current-word">${wordObj.word}</span>` // Highlight current word
                    : wordObj.word;
            });

            captionPreview.innerHTML = displayedWords.join(" ");
        }

        if (previewTime >= 2.0) {
            previewTime = 0.0; // Restart the animation loop
        }
    }, 100);
}

// Start the caption animation loop on page load
//startPreviewAnimation();

function renderWordEditor() {
    wordEditor.innerHTML = ""; // Clear previous content

    let captionstext = "";

    wordTimestamps.forEach((wordObj, index) => {
        let wordDiv = document.createElement("div");
        wordDiv.classList.add("word-editor-box");

        // Editable input field
        let input = document.createElement("input");
        input.type = "text";
        input.value = wordObj.word;
        input.dataset.index = index;

        // Delete button
        let deleteBtn = document.createElement("span");
        deleteBtn.innerHTML = "❌";
        deleteBtn.classList.add("delete-word");
        deleteBtn.dataset.index = index;

        // View Details Button
        let detailsBtn = document.createElement("span");
        detailsBtn.innerHTML = "ℹ️";  // Info icon
        detailsBtn.classList.add("view-details");
        detailsBtn.dataset.index = index;

        wordDiv.appendChild(input);
        wordDiv.appendChild(detailsBtn);
        wordDiv.appendChild(deleteBtn);
        wordEditor.appendChild(wordDiv);

        let notebookWordDiv = document.createElement("div");
        notebookWordDiv.classList.add("word-editor-box");

        // Editable input field
        let textDiv = document.createElement("div");
        textDiv.innerHTML = wordObj.word;
        textDiv.classList.add("view-noteword-details");
        textDiv.dataset.index = index;

        captionstext += wordObj.word + " "; // Collect caption text

        // View Details Button
        // let notebookWorddetailsBtn = document.createElement("span");
        // notebookWorddetailsBtn.innerHTML = "ℹ️";  // Info icon
        // notebookWorddetailsBtn.classList.add("view-noteword-details");
        // notebookWorddetailsBtn.dataset.index = index;

        notebookWordDiv.appendChild(textDiv);
        // notebookWordDiv.appendChild(notebookWorddetailsBtn);
        notebookWordDiv.appendChild(deleteBtn);
        notebookEditor.appendChild(notebookWordDiv); // Clone for notebook editor
    });
    notebooklmText.innerHTML = captionstext ; // Set the full text in notebooklmText

}

function copyData() {
    const textToCopy = notebooklmText.innerText;
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            console.log("Text copied to clipboard successfully!");
            // alert("Text copied to clipboard successfully!");
        })
        .catch(err => {
            console.error("Failed to copy text: ", err);
            // alert("Failed to copy text. Please try again.");
    });
}
// 🔹 Handle Editing
wordEditor.addEventListener("input", (event) => {
    if (event.target.tagName === "INPUT") {
        let index = event.target.dataset.index;
        wordTimestamps[index].word = event.target.value.trim();
    }
});

function autoSetStart(index) {
    currentSection = {
        startIndex: index,
        startTime: parseFloat(wordTimestamps[index].start)
    };
    highlightWord(index, "start");
}

document.body.addEventListener("change", (e) => {
    const index = parseInt(e.target.dataset.index);

    // START checkbox logic
    if (e.target.classList.contains("start-checkbox")) {
        if (e.target.checked) {
            currentSection = {
                startIndex: index,
                startTime: parseFloat(wordTimestamps[index].start)
            };
            highlightWord(index, "start");
        } else {
            // Uncheck = clear current start
            if (currentSection.startIndex == index) {
                currentSection = {};
                highlightWord(index, null);
            }
        }
    }

    // END checkbox logic
    if (e.target.classList.contains("end-checkbox")) {
        if (e.target.checked && currentSection.startIndex !== undefined) {
            const endTime = parseFloat(wordTimestamps[index].end);
            const section = {
                startIndex: currentSection.startIndex,
                startTime: currentSection.startTime,
                endIndex: index,
                endTime,
                duration: (endTime - currentSection.startTime).toFixed(2)
            };

            // Prevent duplicate startIndex entries
            markedSections = markedSections.filter(s => s.startIndex !== section.startIndex);
            markedSections.push(section);
            localStorage.setItem("markedSections", JSON.stringify(markedSections));

            highlightWord(index, "end");

            const nextStartIndex = index + 1;
            if (nextStartIndex < wordTimestamps.length) {
                currentSection = {
                    startIndex: nextStartIndex,
                    startTime: parseFloat(wordTimestamps[nextStartIndex].start)
                };
                highlightWord(nextStartIndex, "start");
            } else {
                currentSection = {};
            }

            //renderSectionList();
        } else if (!e.target.checked) {
            // Remove that section
            markedSections = markedSections.filter(s => s.endIndex !== index);
            localStorage.setItem("markedSections", JSON.stringify(markedSections));
            highlightWord(index, null);
            //renderSectionList();
        }
    }
});

// On page load, set first word as start
window.addEventListener("load", () => {  

    setTimeout(() => {
        if (markedSections.length === 0) autoSetStart(0); // first word

        markedSections.forEach(section => {
            highlightWord(section.startIndex, "start");
            highlightWord(section.endIndex, "end");
        });
    }, timeout = 1000); // wait for UI to load


    //renderSectionList(); // optional UI
});

function renderSectionList() {
    const list = document.getElementById("sectionList");
    list.innerHTML = markedSections.map((s, i) => `
        <div>
            Image ${i + 1}: ${s.startTime}s → ${s.endTime}s (${s.duration}s)
            <button onclick="removeSection(${i})">❌</button>
        </div>
    `).join("");
}

function removeSection(i) {
    markedSections.splice(i, 1);
    localStorage.setItem("markedSections", JSON.stringify(markedSections));
    //renderSectionList();
    location.reload(); // Refresh to re-highlight correctly
}


// Mark End Logic
document.body.addEventListener("click", (e) => {
    if (e.target.classList.contains("mark-start")) {
        const i = e.target.dataset.index;
        currentSection = {
            startIndex: i,
            startTime: wordTimestamps[i].start
        };
        highlightWord(i, "start");
    }
    if (e.target.classList.contains("mark-end")) {
        const i = parseInt(e.target.dataset.index);
        if (currentSection.startIndex !== undefined) {
            const section = {
                startIndex: currentSection.startIndex,
                startTime: currentSection.startTime,
                endIndex: i,
                endTime: parseFloat(wordTimestamps[i].end),
                duration: (parseFloat(wordTimestamps[i].end) - currentSection.startTime).toFixed(2)
            };

            markedSections.push(section);
            localStorage.setItem("markedSections", JSON.stringify(markedSections));
            highlightWord(i, "end");

            // Smart: pick next word as next start
            const nextStartIndex = i + 1;
            if (nextStartIndex < wordTimestamps.length) {
                autoSetStart(nextStartIndex);
            } else {
                currentSection = {}; // no more words
            }

            //renderSectionList();
        }
    }
});

function highlightWord(index, type) {
    const wordDiv = notebookEditor.querySelector(`[data-index="${index}"]`);
    if (wordDiv) {
        if (type === "start") {
            wordDiv.style.backgroundColor = "#d1e7dd"; // green
        } else if (type === "end") {
            wordDiv.style.backgroundColor = "#f8d7da"; // red
        } else {
            wordDiv.style.backgroundColor = ""; // reset
        }
    }
}



// Function to create the floating tooltip for word properties
function showWordDetails(index, event) {
    let wordObj = wordTimestamps[index];

    // Remove existing tooltip
    let existingTooltip = document.querySelector(".word-tooltip");
    if (existingTooltip) existingTooltip.remove();

    // Create tooltip div
    let tooltip = document.createElement("div");
    tooltip.classList.add("word-tooltip");
    tooltip.innerHTML = `
        <strong>📖 Word:</strong> ${wordObj.word} <br>
        <strong>⏳ Start:</strong> <span class="copy-text">${wordObj.start}</span> <button class="copy-btn" data-text="${wordObj.start}">📋</button><br>
        <strong>⏳ End:</strong> <span class="copy-text">${wordObj.end}</span> <button class="copy-btn" data-text="${wordObj.end}">📋</button>
    `;

    // Position tooltip near the clicked button
    tooltip.style.position = "absolute";
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;

    document.body.appendChild(tooltip);
}


function showNoteWordDetails(index, event) {
    let wordObj = wordTimestamps[index];

    // Remove any previous tooltip
    let existingTooltip = document.querySelector(".word-tooltip");
    if (existingTooltip) existingTooltip.remove();

    const isStart = currentSection.startIndex == index;
    const isEnd = markedSections.some(s => s.endIndex == index);
    const existingEnd = markedSections.find(s => s.endIndex == index);

    let tooltip = document.createElement("div");
    tooltip.classList.add("word-tooltip");
    tooltip.innerHTML = `
        <strong>📖 Word:</strong> ${wordObj.word} <br>
        <strong>⏳ Start:</strong> ${wordObj.start.toFixed(2)}<br>
        <strong>⏳ End:</strong> ${wordObj.end.toFixed(2)}<br>
        ${isEnd ? `<strong>⏱ Duration:</strong> ${existingEnd.duration}s<br>` : ''}
        <label><input type="checkbox" class="start-checkbox" data-index="${index}" ${isStart ? 'checked' : ''}> Mark Start</label><br>
        <label><input type="checkbox" class="end-checkbox" data-index="${index}" ${isEnd ? 'checked' : ''}> Mark End</label>
        <button class="close-parent-btn" onClick="closeParent(event)">Close</button>
    `;
    tooltip.style.position = "absolute";
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;

    document.body.appendChild(tooltip);
}


// Event listener for copying times to clipboard
document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("copy-btn")) {
        let textToCopy = event.target.dataset.text;
        navigator.clipboard.writeText(textToCopy).then(() => {
            event.target.innerText = "✅";  // Show checkmark after copying
            setTimeout(() => event.target.innerText = "📋", 1000);
        });
    }
});

// Event listener for showing details
wordEditor.addEventListener("click", (event) => {
    if (event.target.classList.contains("view-details")) {
        let index = event.target.dataset.index;
        showWordDetails(index, event);
    }
});

// Event listener for showing details
notebookEditor.addEventListener("click", (event) => {
    if (event.target.classList.contains("view-noteword-details")) {
        let index = event.target.dataset.index;
        showNoteWordDetails(index, event);
    }
    // if (event.target.classList.contains("close-parent-btn")) {
    //     // Close the tooltip when the close button is clicked
    //     let tooltip = event.target.closest(".word-tooltip");
    //     if (tooltip) {
    //         tooltip.remove();
    //     }
    // }
});


function closeParent(event) {
    // Close the tooltip when the close button is clicked
    let tooltip = event.target.closest(".word-tooltip");
    if (tooltip) {
        tooltip.remove();
    }
}

// 🔹 Handle Deletion
wordEditor.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-word")) {
        let index = event.target.dataset.index;
        wordTimestamps.splice(index, 1);
        renderWordEditor(); // Re-render after deletion
    }
});

// 🔹 Save Updated Words to `word_timestamps.json`
// 🔹 Save Updated Words to `word_timestamps.json` via Python server
saveWordChanges.addEventListener("click", () => {
    fetch("http://localhost:5000/save_word_timestamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wordTimestamps)
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error("Error saving word timestamps:", error));
});

// 🔹 Play Selected Background Music for Preview
previewMusicBtn.addEventListener("click", () => {
    const selectedMusic = bgMusicSelect.value;
    if (selectedMusic !== "none") {
        audioBackground.src = `sounds/${selectedMusic}`;
        audioBackground.loop = true;
        audioBackground.volume = bgMusicVolume.value;
        audioBackground.play();
    }
});

// 🔹 Stop Preview Music
stopPreviewBtn.addEventListener("click", () => {
    audioBackground.pause();
    audioBackground.currentTime = 0;
});

// 🔹 Adjust Background Music Volume Dynamically
bgMusicVolume.addEventListener("input", () => {
    audioBackground.volume = bgMusicVolume.value;
});

// 🔹 Adjust Sound Effect Volume Dynamically
effectVolume.addEventListener("input", () => {
    audioEffect.volume = effectVolume.value;
});

// 🔹 Adjust Main Video Volume Dynamically
videoVolumeSlider.addEventListener("input", () => {
    video.volume = videoVolumeSlider.value;
});

// 🔹 Function to Update Video Orientation
function updateVideoOrientation() {
    const selectedOrientation = videoOrientation.value;

    if (selectedOrientation === "portrait") {
        document.body.classList.add("portrait");
        // video.width = 720;
        // video.height = 1280;
    } else {
        document.body.classList.remove("portrait");
        // video.width = 1280;
        // video.height = 720;
    }
}

// 🔹 Listen for Orientation Change
videoOrientation.addEventListener("change", updateVideoOrientation);

// 🔹 Set Initial Orientation on Page Load
updateVideoOrientation();

// 🔹 Render Editable Words
function renderWordEditor_old() {
    wordEditor.innerHTML = ""; // Clear previous content

    wordTimestamps.forEach((wordObj, index) => {
        let wordDiv = document.createElement("div");
        wordDiv.classList.add("word-editor-box");

        // Editable input field
        let input = document.createElement("input");
        input.type = "text";
        input.value = wordObj.word;
        input.dataset.index = index;

        // Delete button
        let deleteBtn = document.createElement("span");
        deleteBtn.innerHTML = "❌";
        deleteBtn.classList.add("delete-word");
        deleteBtn.dataset.index = index;

        // View Details Button
        let detailsBtn = document.createElement("span");
        detailsBtn.innerHTML = "ℹ️";  // Info icon
        detailsBtn.classList.add("view-details");
        detailsBtn.dataset.index = index;

        wordDiv.appendChild(input);
        wordDiv.appendChild(detailsBtn); // Add details button
        wordDiv.appendChild(deleteBtn);
        wordEditor.appendChild(wordDiv);
        notebookEditor.appendChild(wordDiv.cloneNode(true)); // Clone for notebook editor
    });
}