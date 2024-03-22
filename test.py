from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):
    with app.test_client() as client:
     response = client.get("/users")
     html = response.get_data(as_text=True)
