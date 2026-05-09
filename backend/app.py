from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import PyPDF2
from datetime import datetime
from collections import Counter
import re

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data', 'uploads')
ANALYSIS_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'data', 'analysis')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ANALYSIS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size


class QuestionAnalyzer:
    """Analyzes question papers and predicts likely questions"""
    
    def __init__(self):
        self.papers = {}
        self.syllabus = {}
        self.predictions = {}
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            return None
    
    def extract_text_from_txt(self, file_path):
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            return None
    
    def parse_questions(self, text):
        """Extract individual questions from paper text"""
        questions = []
        # Split by common patterns (Q1, Q2, 1., 2., etc.)
        patterns = [
            r'(?:Q|Q\.|Question)\s*\d+[.:\s]',
            r'^\d+[.:\s]',
        ]
        
        lines = text.split('\n')
        current_question = ""
        
        for line in lines:
            if re.search(r'^(Q|Question)\s*\d+', line, re.IGNORECASE) or \
               re.search(r'^\d+\s*[.:]', line):
                if current_question.strip():
                    questions.append(current_question.strip())
                current_question = line
            else:
                current_question += " " + line
        
        if current_question.strip():
            questions.append(current_question.strip())
        
        return [q for q in questions if len(q) > 10]
    
    def extract_topics(self, text):
        """Extract topics/chapters mentioned in text"""
        topics = []
        # Look for common topic indicators
        topic_patterns = [
            r'(?:Chapter|Ch\.|Topic|Unit|Section|Module)\s+\d*\s*[:-]?\s*(.+?)(?:\n|$)',
        ]
        
        for pattern in topic_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                topic = match.group(1).strip()
                if topic and len(topic) > 2:
                    topics.append(topic)
        
        return list(set(topics))
    
    def calculate_frequency(self, questions, topics):
        """Calculate frequency of topics in questions"""
        frequency = Counter()
        
        for question in questions:
            question_lower = question.lower()
            for topic in topics:
                if topic.lower() in question_lower:
                    frequency[topic] += 1
        
        return frequency
    
    def predict_questions(self, semester, syllabus_topics, all_papers_data):
        """Predict likely questions based on analysis"""
        predictions = {
            'high_probability': [],
            'medium_probability': [],
            'low_probability': [],
            'frequently_asked': []
        }
        
        topic_frequency = Counter()
        topic_appearance = Counter()
        
        # Analyze all papers
        for paper_data in all_papers_data:
            questions = paper_data.get('questions', [])
            topics = paper_data.get('topics', [])
            
            freq = self.calculate_frequency(questions, topics)
            topic_frequency.update(freq)
            
            for topic in topics:
                topic_appearance[topic] += 1
        
        # Classify topics by probability
        total_papers = len(all_papers_data)
        
        for topic, frequency in topic_frequency.most_common():
            probability = frequency / total_papers if total_papers > 0 else 0
            
            if probability >= 0.7:
                predictions['high_probability'].append({
                    'topic': topic,
                    'frequency': frequency,
                    'probability': round(probability * 100, 2)
                })
            elif probability >= 0.4:
                predictions['medium_probability'].append({
                    'topic': topic,
                    'frequency': frequency,
                    'probability': round(probability * 100, 2)
                })
            else:
                predictions['low_probability'].append({
                    'topic': topic,
                    'frequency': frequency,
                    'probability': round(probability * 100, 2)
                })
        
        # Get frequently asked topics
        for topic, count in topic_appearance.most_common(5):
            predictions['frequently_asked'].append({
                'topic': topic,
                'appeared_in': count
            })
        
        return predictions


analyzer = QuestionAnalyzer()


@app.route('/')
def index():
    """Serve the frontend"""
    return send_file('../frontend/index.html')


@app.route('/api/upload-paper', methods=['POST'])
def upload_paper():
    """Upload a question paper"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        semester = request.form.get('semester', 'Unknown')
        subject = request.form.get('subject', 'General')
        year = request.form.get('year', datetime.now().year)
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        filename = f"{subject}_{semester}_{year}_{datetime.now().timestamp()}"
        if file.filename.endswith('.pdf'):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.pdf")
            file.save(filepath)
            text = analyzer.extract_text_from_pdf(filepath)
        elif file.filename.endswith('.txt'):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.txt")
            file.save(filepath)
            text = analyzer.extract_text_from_txt(filepath)
        else:
            return jsonify({'error': 'Only PDF and TXT files are supported'}), 400
        
        if not text:
            return jsonify({'error': 'Could not extract text from file'}), 400
        
        # Parse questions
        questions = analyzer.parse_questions(text)
        topics = analyzer.extract_topics(text)
        
        # Save analysis
        paper_data = {
            'filename': filename,
            'original_filename': file.filename,
            'semester': semester,
            'subject': subject,
            'year': int(year),
            'uploaded_at': datetime.now().isoformat(),
            'questions': questions,
            'topics': topics,
            'question_count': len(questions),
            'topic_count': len(topics)
        }
        
        analysis_file = os.path.join(ANALYSIS_FOLDER, f"{filename}_analysis.json")
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(paper_data, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'message': f'Paper uploaded successfully. Found {len(questions)} questions and {len(topics)} topics.',
            'data': paper_data
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/upload-syllabus', methods=['POST'])
def upload_syllabus():
    """Upload syllabus"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        semester = request.form.get('semester', 'Unknown')
        subject = request.form.get('subject', 'General')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        filename = f"{subject}_{semester}_syllabus_{datetime.now().timestamp()}"
        if file.filename.endswith('.pdf'):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.pdf")
            file.save(filepath)
            text = analyzer.extract_text_from_pdf(filepath)
        elif file.filename.endswith('.txt'):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.txt")
            file.save(filepath)
            text = analyzer.extract_text_from_txt(filepath)
        else:
            return jsonify({'error': 'Only PDF and TXT files are supported'}), 400
        
        if not text:
            return jsonify({'error': 'Could not extract text from file'}), 400
        
        # Extract topics
        topics = analyzer.extract_topics(text)
        
        # Save syllabus data
        syllabus_data = {
            'filename': filename,
            'original_filename': file.filename,
            'semester': semester,
            'subject': subject,
            'uploaded_at': datetime.now().isoformat(),
            'topics': topics,
            'topic_count': len(topics),
            'raw_text': text[:1000]  # Store first 1000 chars for reference
        }
        
        analysis_file = os.path.join(ANALYSIS_FOLDER, f"{filename}_analysis.json")
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(syllabus_data, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'message': f'Syllabus uploaded successfully. Found {len(topics)} topics.',
            'data': syllabus_data
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict questions for a subject and semester"""
    try:
        data = request.json
        semester = data.get('semester')
        subject = data.get('subject')
        
        if not semester or not subject:
            return jsonify({'error': 'Semester and subject are required'}), 400
        
        # Load all papers for this subject
        all_papers = []
        for filename in os.listdir(ANALYSIS_FOLDER):
            if filename.endswith('_analysis.json'):
                try:
                    with open(os.path.join(ANALYSIS_FOLDER, filename), 'r', encoding='utf-8') as f:
                        paper_data = json.load(f)
                        if paper_data.get('subject') == subject:
                            all_papers.append(paper_data)
                except:
                    continue
        
        if not all_papers:
            return jsonify({
                'error': 'No papers found for this subject. Please upload question papers first.',
                'predictions': None
            }), 400
        
        # Generate predictions
        predictions = analyzer.predict_questions(semester, [], all_papers)
        
        return jsonify({
            'success': True,
            'subject': subject,
            'semester': semester,
            'papers_analyzed': len(all_papers),
            'predictions': predictions
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/papers', methods=['GET'])
def get_papers():
    """Get all uploaded papers"""
    try:
        papers = []
        for filename in os.listdir(ANALYSIS_FOLDER):
            if filename.endswith('_analysis.json') and 'syllabus' not in filename:
                try:
                    with open(os.path.join(ANALYSIS_FOLDER, filename), 'r', encoding='utf-8') as f:
                        paper_data = json.load(f)
                        papers.append(paper_data)
                except:
                    continue
        
        return jsonify({'success': True, 'papers': papers}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get all subjects from uploaded papers"""
    try:
        subjects = set()
        for filename in os.listdir(ANALYSIS_FOLDER):
            if filename.endswith('_analysis.json') and 'syllabus' not in filename:
                try:
                    with open(os.path.join(ANALYSIS_FOLDER, filename), 'r', encoding='utf-8') as f:
                        paper_data = json.load(f)
                        if 'subject' in paper_data:
                            subjects.add(paper_data['subject'])
                except:
                    continue
        
        return jsonify({'success': True, 'subjects': sorted(list(subjects))}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
