import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database import engine, Base
from backend.scripts.seed_demo_data import seed_database

def reset():
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset complete.")
    seed_database()

if __name__ == "__main__":
    reset()
