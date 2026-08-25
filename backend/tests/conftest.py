import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env.test"))
load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")
