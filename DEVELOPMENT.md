# Development Guide

## Project Overview

Predict is a question paper prediction system that helps students prepare for exams by analyzing previous papers and predicting likely questions.

## Architecture

### Backend (Flask)
- **QuestionAnalyzer Class** - Core analysis engine
  - `extract_text_from_pdf()` - PDF text extraction
  - `extract_text_from_txt()` - Text file reading
  - `parse_questions()` - Question identification
  - `extract_topics()` - Topic extraction
  - `calculate_frequency()` - Frequency analysis
  - `predict_questions()` - Prediction algorithm

### Frontend (Vanilla JavaScript)
- Tab-based interface for better UX
- File upload with drag-and-drop
- Real-time status updates
- Dynamic result rendering

## Getting Started with Development

### 1. Setup Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 2. Start Backend
```bash
cd backend
python app.py
```

### 3. Open Frontend
```bash
# Open in browser: file:///path/to/Predict/frontend/index.html
# Or: http://localhost:5000
```

## Key Components

### Backend API Endpoints

**Upload Paper**
- Route: `POST /api/upload-paper`
- Form Data: `file`, `subject`, `semester`, `year`
- Returns: Paper analysis data

**Upload Syllabus**
- Route: `POST /api/upload-syllabus`
- Form Data: `file`, `subject`, `semester`
- Returns: Syllabus topics

**Generate Predictions**
- Route: `POST /api/predict`
- JSON Body: `{ subject, semester }`
- Returns: High/Medium/Low probability topics

**Get Papers**
- Route: `GET /api/papers`
- Returns: All uploaded papers

**Get Subjects**
- Route: `GET /api/subjects`
- Returns: List of all subjects

### Frontend Components

**Tabs:**
1. Upload Papers - File upload interface
2. Predict Questions - Prediction generator
3. Analysis - Dashboard with stats

**Features:**
- Responsive grid layout
- Status message handling
- File upload with validation
- Dynamic content rendering

## File Structure Details

```
backend/
  app.py                 # Main Flask application
  requirements.txt       # Dependencies
  
frontend/
  index.html            # HTML structure
  style.css             # Styling
  script.js             # JavaScript logic
  
data/
  uploads/              # Stores uploaded files
  analysis/             # Stores JSON analysis results
```

## Data Flow

1. User uploads paper/syllabus → 
2. Flask saves file → 
3. Text extraction (PDF/TXT) → 
4. Question/topic parsing → 
5. Frequency analysis → 
6. JSON storage → 
7. Frontend displays results

## Prediction Algorithm

```
For each topic:
  frequency = count in all papers
  probability = frequency / total_papers
  
Classify by probability:
  >= 70% = High Probability
  >= 40% = Medium Probability
  < 40% = Low Probability
```

## Testing

### Manual Testing Steps

1. **Upload Paper Test**
   - Upload a sample PDF/TXT
   - Verify questions are extracted
   - Check topics are identified

2. **Prediction Test**
   - Upload 3+ papers for same subject
   - Generate prediction
   - Verify topic rankings

3. **UI Test**
   - Test file drag-and-drop
   - Check tab switching
   - Verify responsive design

## Code Style

- Python: PEP 8 guidelines
- JavaScript: Camel case for variables/functions
- CSS: BEM methodology for classes
- HTML: Semantic tags, proper nesting

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Flask-CORS is enabled. Check if backend is running.

### Issue: File Not Uploading
**Solution:** Check file size and format (PDF/TXT only)

### Issue: No Predictions
**Solution:** Upload multiple papers first (minimum 2-3 recommended)

## Future Development

### Phase 2
- [ ] User authentication
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Historical tracking of predictions vs actual
- [ ] Subject-specific models

### Phase 3
- [ ] ML-based classification
- [ ] Advanced NLP for better topic extraction
- [ ] User accounts and saved predictions
- [ ] API documentation (Swagger)

### Phase 4
- [ ] Mobile app
- [ ] Real-time collaboration
- [ ] AI-powered study suggestions
- [ ] Question difficulty assessment

## Dependencies

### Python
- Flask 2.3.3 - Web framework
- Flask-CORS 4.0.0 - CORS handling
- PyPDF2 3.0.1 - PDF processing
- Python-dotenv 1.0.0 - Environment variables
- Gunicorn 21.2.0 - Production server

### Frontend
- No external dependencies (vanilla JS/CSS)
- Modern browser with ES6 support

## Debugging

### Enable Flask Debug Mode
In `app.py`, set `debug=True` (already enabled)

### Check File Extraction
- Test PDFs with `python backend/app.py` in debug mode
- Check `data/analysis/` for JSON results

### Browser Console
- Open DevTools (F12)
- Check Network tab for API calls
- Monitor Console for JavaScript errors

## Performance Tips

- Optimize PDF extraction for large files
- Consider caching frequently accessed data
- Limit file upload size (default: 50MB)
- Use pagination for large result sets

## Deployment

### Local Development
```bash
python backend/app.py
```

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables
Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create PR

## Support & Questions

For questions or issues:
1. Check README.md
2. Review code comments
3. Test with sample data
4. Check browser console for errors
