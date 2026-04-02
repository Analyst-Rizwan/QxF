# HF Spaces requires port 7860
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY main.py code_runner.py ./

# HF Spaces runs as a non-root user — ensure /app is writable
RUN chmod -R 777 /app

# HF Spaces requires the app to listen on port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
