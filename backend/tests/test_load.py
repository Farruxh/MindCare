import random
from locust import HttpUser, task

class TestUser(HttpUser):
    @task
    def login(self):
        self.client.post("/api/v1/users/login", json={
            "email": "farrukh.web2@gmail.com",
            "password": "12345"
        })

    @task
    def signup(self):
        self.client.post("/api/v1/users/register-user", json={
            "name": "Test User",
            "email": f"test{random.randint(1,99999)}@test.com",
            "password": "Test1234!",
            "gender": "test"
        })