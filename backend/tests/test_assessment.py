import pytest

# ─────────────────────────────────────────
# HELPER FIXTURE — Logged In Client
# ─────────────────────────────────────────

@pytest.fixture
def logged_in_client(client):
    """Signup + login + set cookies"""
    client.post("/api/v1/users/register-user", json={
        "name": "TestUser",
        "email": "testuser@example.com",
        "password": "TestPass99",
        "gender": "male"
    })
    login_response = client.post("/api/v1/users/login", json={
        "email": "testuser@example.com",
        "password": "TestPass99"
    })
    access_token = login_response.cookies.get("access_token")
    refresh_token = login_response.cookies.get("refresh_token")
    client.cookies.set("access_token", access_token)
    client.cookies.set("refresh_token", refresh_token)
    return client


# ─────────────────────────────────────────
# CREATE ASSESSMENT TESTS
# ─────────────────────────────────────────

def test_create_assessment_success(logged_in_client):
    response = logged_in_client.post("/api/v1/assessments/create", json={
        "anxiety_score": 10,
        "anxiety_severity": "moderate",
        "depression_score": 8,
        "depression_severity": "mild",
        "stress_score": 12,
        "stress_severity": "severe",
        "isEmailPreference": True
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Assessment result saved successfully"
    assert data["data"]["anxiety_score"] == 10
    assert data["data"]["depression_score"] == 8
    assert data["data"]["stress_score"] == 12


def test_create_assessment_without_scores(logged_in_client):
    """Assessment can be created with only isEmailPreference"""
    response = logged_in_client.post("/api/v1/assessments/create", json={
        "isEmailPreference": False
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Assessment result saved successfully"


def test_create_assessment_missing_email_preference(logged_in_client):
    response = logged_in_client.post("/api/v1/assessments/create", json={
        "anxiety_score": 10,
        "anxiety_severity": "moderate"
        # isEmailPreference is missing
    })
    assert response.status_code == 422


def test_create_assessment_unauthenticated(client):
    response = client.post("/api/v1/assessments/create", json={
        "anxiety_score": 10,
        "anxiety_severity": "moderate",
        "isEmailPreference": True
    })
    assert response.status_code == 401


# ─────────────────────────────────────────
# GET ASSESSMENT TESTS
# ─────────────────────────────────────────

def test_get_my_assessments_success(logged_in_client):
    logged_in_client.post("/api/v1/assessments/create", json={
        "anxiety_score": 10,
        "anxiety_severity": "moderate",
        "isEmailPreference": True
    })
    response = logged_in_client.get("/api/v1/assessments/my-assessment")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Assessment result of current user fetched successfully"
    assert isinstance(data["data"], list)
    assert len(data["data"]) > 0


def test_get_my_assessments_empty(logged_in_client):
    logged_in_client.delete("/api/v1/assessments/delete")
    response = logged_in_client.get("/api/v1/assessments/my-assessment")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["data"], list)


def test_get_my_assessments_unauthenticated(client):
    response = client.get("/api/v1/assessments/my-assessment")
    assert response.status_code == 401


# ─────────────────────────────────────────
# DELETE ASSESSMENT TESTS
# ─────────────────────────────────────────

def test_delete_assessments_success(logged_in_client):
    logged_in_client.post("/api/v1/assessments/create", json={
        "anxiety_score": 10,
        "anxiety_severity": "moderate",
        "isEmailPreference": True
    })
    response = logged_in_client.delete("/api/v1/assessments/delete")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "All assessments deleted successfully"