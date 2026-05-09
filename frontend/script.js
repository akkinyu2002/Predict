// API Base URL
const API_BASE = 'http://localhost:5000/api';

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// File Upload Elements
const paperFileInput = document.getElementById('paper-file');
const syllabusFileInput = document.getElementById('syllabus-file');
const paperFileLabel = document.querySelector('label[for="paper-file"]');
const syllabusFileLabel = document.querySelector('label[for="syllabus-file"]');

// Form Elements
const subjectInput = document.getElementById('subject');
const semesterSelect = document.getElementById('semester');
const yearInput = document.getElementById('year');
const syllabusSubjectInput = document.getElementById('syllabus-subject');
const syllabusSemesterSelect = document.getElementById('syllabus-semester');

// Button Elements
const uploadPaperBtn = document.getElementById('upload-paper-btn');
const uploadSyllabusBtn = document.getElementById('upload-syllabus-btn');
const predictBtn = document.getElementById('predict-btn');

// Status Elements
const paperUploadStatus = document.getElementById('paper-upload-status');
const syllabusUploadStatus = document.getElementById('syllabus-upload-status');
const predictStatus = document.getElementById('predict-status');

// Predict Form Elements
const predictSubjectSelect = document.getElementById('predict-subject');
const predictSemesterSelect = document.getElementById('predict-semester');

// Results Elements
const predictionsContainer = document.getElementById('predictions-container');
const papersStatContainer = document.getElementById('papers-stats');
const papersListContainer = document.getElementById('papers-list');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    setupFileUpload();
    setupEventListeners();
    loadSubjects();
});

/**
 * Setup Tab Navigation
 */
function setupTabNavigation() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

function showTab(tabName) {
    // Hide all tabs
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Load data if needed
    if (tabName === 'analysis') {
        loadPapersAnalysis();
    }
}

/**
 * Setup File Upload
 */
function setupFileUpload() {
    // Paper file upload
    paperFileLabel.addEventListener('click', () => paperFileInput.click());
    paperFileInput.addEventListener('change', handlePaperFileSelect);
    setupDragAndDrop(paperFileLabel, paperFileInput);

    // Syllabus file upload
    syllabusFileLabel.addEventListener('click', () => syllabusFileInput.click());
    syllabusFileInput.addEventListener('change', handleSyllabusFileSelect);
    setupDragAndDrop(syllabusFileLabel, syllabusFileInput);
}

function setupDragAndDrop(label, input) {
    label.addEventListener('dragover', (e) => {
        e.preventDefault();
        label.style.background = 'rgba(99, 102, 241, 0.15)';
    });

    label.addEventListener('dragleave', () => {
        label.style.background = 'rgba(99, 102, 241, 0.05)';
    });

    label.addEventListener('drop', (e) => {
        e.preventDefault();
        label.style.background = 'rgba(99, 102, 241, 0.05)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

function handlePaperFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const fileName = file.name;
        paperFileLabel.querySelector('.upload-text').textContent = `Selected: ${fileName}`;
    }
}

function handleSyllabusFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        const fileName = file.name;
        syllabusFileLabel.querySelector('.upload-text').textContent = `Selected: ${fileName}`;
    }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    uploadPaperBtn.addEventListener('click', uploadPaper);
    uploadSyllabusBtn.addEventListener('click', uploadSyllabus);
    predictBtn.addEventListener('click', predictQuestions);
}

/**
 * Upload Question Paper
 */
async function uploadPaper() {
    const file = paperFileInput.files[0];
    const subject = subjectInput.value;
    const semester = semesterSelect.value;
    const year = yearInput.value;

    if (!file) {
        showStatus(paperUploadStatus, 'Please select a file', 'error');
        return;
    }

    if (!subject) {
        showStatus(paperUploadStatus, 'Please enter subject name', 'error');
        return;
    }

    if (!semester) {
        showStatus(paperUploadStatus, 'Please select semester', 'error');
        return;
    }

    showStatus(paperUploadStatus, 'Uploading and analyzing paper...', 'loading');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('year', year);

        const response = await fetch(`${API_BASE}/upload-paper`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showStatus(paperUploadStatus, data.message, 'success');
            // Reset form
            paperFileInput.value = '';
            subjectInput.value = '';
            semesterSelect.value = '';
            yearInput.value = new Date().getFullYear();
            paperFileLabel.querySelector('.upload-text').textContent = 'Drop PDF or TXT file here or click to select';
            loadSubjects();
        } else {
            showStatus(paperUploadStatus, data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        showStatus(paperUploadStatus, 'Error: ' + error.message, 'error');
    }
}

/**
 * Upload Syllabus
 */
async function uploadSyllabus() {
    const file = syllabusFileInput.files[0];
    const subject = syllabusSubjectInput.value;
    const semester = syllabusSemesterSelect.value;

    if (!file) {
        showStatus(syllabusUploadStatus, 'Please select a file', 'error');
        return;
    }

    if (!subject) {
        showStatus(syllabusUploadStatus, 'Please enter subject name', 'error');
        return;
    }

    if (!semester) {
        showStatus(syllabusUploadStatus, 'Please select semester', 'error');
        return;
    }

    showStatus(syllabusUploadStatus, 'Uploading and analyzing syllabus...', 'loading');

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', subject);
        formData.append('semester', semester);

        const response = await fetch(`${API_BASE}/upload-syllabus`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showStatus(syllabusUploadStatus, data.message, 'success');
            // Reset form
            syllabusFileInput.value = '';
            syllabusSubjectInput.value = '';
            syllabusSemesterSelect.value = '';
            syllabusFileLabel.querySelector('.upload-text').textContent = 'Drop PDF or TXT file here or click to select';
        } else {
            showStatus(syllabusUploadStatus, data.error || 'Upload failed', 'error');
        }
    } catch (error) {
        showStatus(syllabusUploadStatus, 'Error: ' + error.message, 'error');
    }
}

/**
 * Load Subjects from Backend
 */
async function loadSubjects() {
    try {
        const response = await fetch(`${API_BASE}/subjects`);
        const data = await response.json();

        if (data.success && data.subjects) {
            // Populate predict subject dropdown
            predictSubjectSelect.innerHTML = '<option value="">-- Choose Subject --</option>';
            data.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                predictSubjectSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}

/**
 * Predict Questions
 */
async function predictQuestions() {
    const subject = predictSubjectSelect.value;
    const semester = predictSemesterSelect.value;

    if (!subject) {
        showStatus(predictStatus, 'Please select a subject', 'error');
        return;
    }

    if (!semester) {
        showStatus(predictStatus, 'Please select a semester', 'error');
        return;
    }

    showStatus(predictStatus, 'Generating predictions...', 'loading');

    try {
        const response = await fetch(`${API_BASE}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: subject,
                semester: semester
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showStatus(predictStatus, `Analysis complete! Analyzed ${data.papers_analyzed} papers.`, 'success');
            displayPredictions(data.predictions);
        } else {
            showStatus(predictStatus, data.error || 'Prediction failed', 'error');
        }
    } catch (error) {
        showStatus(predictStatus, 'Error: ' + error.message, 'error');
    }
}

/**
 * Display Predictions
 */
function displayPredictions(predictions) {
    predictionsContainer.style.display = 'grid';

    // Display high probability
    const highProbList = document.getElementById('high-prob-list');
    highProbList.innerHTML = predictions.high_probability.length > 0
        ? predictions.high_probability.map(item => `
            <div class="topic-item">
                <strong>${item.topic}</strong>
                <small>Probability: ${item.probability}% | Frequency: ${item.frequency}</small>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary);">No high probability topics found</p>';

    // Display medium probability
    const mediumProbList = document.getElementById('medium-prob-list');
    mediumProbList.innerHTML = predictions.medium_probability.length > 0
        ? predictions.medium_probability.map(item => `
            <div class="topic-item">
                <strong>${item.topic}</strong>
                <small>Probability: ${item.probability}% | Frequency: ${item.frequency}</small>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary);">No medium probability topics found</p>';

    // Display low probability
    const lowProbList = document.getElementById('low-prob-list');
    lowProbList.innerHTML = predictions.low_probability.length > 0
        ? predictions.low_probability.map(item => `
            <div class="topic-item">
                <strong>${item.topic}</strong>
                <small>Probability: ${item.probability}% | Frequency: ${item.frequency}</small>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary);">No low probability topics found</p>';

    // Display frequently asked
    const frequentlyList = document.getElementById('frequently-list');
    frequentlyList.innerHTML = predictions.frequently_asked.length > 0
        ? predictions.frequently_asked.map(item => `
            <div class="topic-item">
                <strong>${item.topic}</strong>
                <small>Appeared in: ${item.appeared_in} papers</small>
            </div>
        `).join('')
        : '<p style="color: var(--text-secondary);">No frequently asked topics found</p>';
}

/**
 * Load Papers Analysis
 */
async function loadPapersAnalysis() {
    try {
        const response = await fetch(`${API_BASE}/papers`);
        const data = await response.json();

        if (data.success && data.papers) {
            // Calculate stats
            const totalPapers = data.papers.length;
            const subjects = new Set(data.papers.map(p => p.subject));
            const totalQuestions = data.papers.reduce((sum, p) => sum + p.question_count, 0);

            // Display stats
            papersStatContainer.innerHTML = `
                <div class="stat-card">
                    <h3>${totalPapers}</h3>
                    <p>Total Papers Uploaded</p>
                </div>
                <div class="stat-card">
                    <h3>${subjects.size}</h3>
                    <p>Unique Subjects</p>
                </div>
                <div class="stat-card">
                    <h3>${totalQuestions}</h3>
                    <p>Total Questions Analyzed</p>
                </div>
            `;

            // Display papers
            papersListContainer.innerHTML = data.papers.map(paper => `
                <div class="paper-card">
                    <h4>${paper.subject}</h4>
                    <p><strong>Semester:</strong> ${paper.semester}</p>
                    <p><strong>Year:</strong> ${paper.year}</p>
                    <p><strong>Questions:</strong> ${paper.question_count}</p>
                    <p><strong>Topics:</strong> ${paper.topic_count}</p>
                    <p><strong>Uploaded:</strong> ${new Date(paper.uploaded_at).toLocaleDateString()}</p>
                    <div>
                        <span class="badge">📄 ${paper.original_filename.split('.').pop().toUpperCase()}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading papers:', error);
        papersListContainer.innerHTML = '<p>Error loading papers</p>';
    }
}

/**
 * Show Status Message
 */
function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;

    if (type !== 'loading') {
        setTimeout(() => {
            element.className = 'status-message';
        }, 5000);
    }
}
