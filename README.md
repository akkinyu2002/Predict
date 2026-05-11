# Predict - Question Paper Prediction System

A smart system that analyzes previous question papers and predicts likely questions for upcoming exams based on patterns and topic frequencies.

## Features

- 📤 **Upload Question Papers** - Upload previous exam papers (PDF or TXT format)
- 📋 **Upload Syllabus** - Add course syllabus for better topic identification
- 🎓 **Semester Selection** - Choose specific semester for targeted predictions
- 🔮 **Intelligent Prediction** - Analyze patterns across papers to predict high-probability questions
- 📊 **Analytics Dashboard** - View detailed analysis of uploaded papers
- 🏆 **Topic Frequency Analysis** - Understand which topics are most frequently asked

## Project Structure

```
Predict/
├── backend/
│   ├── app.py                 # Flask backend application
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── style.css              # Styling
│   └── script.js              # Frontend logic
├── data/
│   └── uploads/               # Uploaded files storage
│   └── analysis/              # Analysis results
└── README.md
```

## Installation

### Prerequisites
- Python 3.7+
- pip
- Modern web browser

### Setup

1. **Clone/Navigate to the project:**
```bash
cd Predict
```

2. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. **Run the backend:**
```bash
cd backend
python app.py
```

4. **Open the frontend:**
- Open `frontend/index.html` in your web browser
- Or access via: `http://localhost:5000`

## Usage

### 1. Upload Question Papers
- Navigate to "Upload Papers" tab
- Fill in:
  - Subject name (e.g., Mathematics)
  - Semester (1-8)
  - Year (exam year)
  - Upload the PDF or TXT file
- Click "Upload Question Paper"
- The system will analyze and extract questions and topics

### 2. Upload Syllabus (Optional)
- Go to "Upload Papers" tab
- Fill in subject and semester
- Upload your syllabus PDF or TXT
- System will extract topics for better prediction

### 3. Generate Predictions
- Navigate to "Predict Questions" tab
- Select subject and semester
- Click "Generate Predictions"
- View results in 4 categories:
  - 🔴 **High Probability** - Very likely to appear
  - 🟡 **Medium Probability** - Possibly will appear
  - 🟢 **Low Probability** - Less likely to appear
  - ⭐ **Frequently Asked** - Topics that appear often

### 4. View Analytics
- Go to "Analysis" tab
- See statistics on uploaded papers
- View detailed information about each paper

## How Predictions Work

The system uses topic frequency analysis:

1. **Text Extraction** - Extracts text from PDF/TXT files
2. **Question Parsing** - Identifies individual questions
3. **Topic Extraction** - Identifies topics/chapters mentioned
4. **Frequency Analysis** - Counts how many times each topic appears
5. **Probability Calculation** - Calculates likelihood based on frequency across all papers
6. **Ranking** - Ranks topics by probability of appearing in next exam

## API Endpoints

### Backend Routes

- `GET /` - Serve frontend
- `POST /api/upload-paper` - Upload question paper
- `POST /api/upload-syllabus` - Upload syllabus
- `POST /api/predict` - Generate predictions
- `GET /api/papers` - Get all uploaded papers
- `GET /api/subjects` - Get all subjects

## Technical Stack

### Backend
- **Flask** - Python web framework
- **PyPDF2** - PDF parsing
- **Flask-CORS** - Cross-origin requests handling

### Frontend
- **HTML5** - Structure
- **CSS3** - Responsive styling
- **Vanilla JavaScript** - Interactivity

## File Formats Supported

- **PDF** (.pdf) - PDF documents
- **Text** (.txt) - Plain text files

## Data Storage

- Uploaded files: `data/uploads/`
- Analysis results: `data/analysis/` (JSON format)

## Example Data

You can test the system with:
- Sample question papers from previous years
- Course syllabus documents
- Any text-based documents with topics

## Future Enhancements

- [ ] Machine learning for better prediction accuracy
- [ ] Subject-specific prediction models
- [ ] Historical exam data integration
- [ ] Question difficulty level analysis
- [ ] Student performance analytics
- [ ] Recommendation engine for study materials
- [ ] Support for more file formats
- [ ] Database integration for scalability

## Configuration

### Backend Settings (in `app.py`)
- `MAX_CONTENT_LENGTH` - Maximum file upload size (default: 50MB)
- `PORT` - Flask server port (default: 5000)

### Frontend
- Styling can be customized in `style.css`
- Colors defined in CSS variables (`:root` section)

## Troubleshooting

### Issue: No predictions generated
- Upload at least 2-3 papers for better predictions
- Ensure papers have consistent topic naming
- Check that the subject names match

### Issue: Backend not starting
- Ensure Python 3.7+ is installed
- Install all requirements: `pip install -r requirements.txt`
- Check that port 5000 is available

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Author

Created with ❤️ for students and educators.

## Support

For issues, suggestions, or contributions, please reach out.

---

**Last Updated:** May 2026
