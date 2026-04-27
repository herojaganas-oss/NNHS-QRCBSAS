"""
WSGI entry point for production deployment
Used by gunicorn on Railway
"""
import os
from app import app

if __name__ == "__main__":
    app.run()
