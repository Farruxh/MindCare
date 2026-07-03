import pytest

# ─────────────────────────────────────────
# SIGNUP TESTS
# ─────────────────────────────────────────

def test_signup_success(client):
    response = client.post("/api/v1/users/register-user", json={
        "name": "Alice",
        "email": "alice@example.com",
        "password": "StrongPass123",
        "gender": "female"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Account created successfully"
    assert data["data"]["email"] == "alice@example.com"


def test_signup_duplicate_email(client):
    payload = {
        "name": "Bob",
        "email": "bob@example.com",
        "password": "Pass1234",
        "gender": "male"
    }
    client.post("/api/v1/users/register-user", json=payload)
    response = client.post("/api/v1/users/register-user", json=payload)
    assert response.status_code == 409


def test_signup_missing_name(client):
    response = client.post("/api/v1/users/register-user", json={
        "email": "test@example.com",
        "password": "Pass1234",
        "gender": "male"
    })
    assert response.status_code == 422


def test_signup_missing_gender(client):
    response = client.post("/api/v1/users/register-user", json={
        "name": "Test User",
        "email": "test2@example.com",
        "password": "Pass1234"
    })
    assert response.status_code == 422


def test_signup_invalid_email(client):
    response = client.post("/api/v1/users/register-user", json={
        "name": "Test",
        "email": "not-an-email",
        "password": "Pass1234",
        "gender": "male"
    })
    assert response.status_code == 422


def test_signup_missing_password(client):
    response = client.post("/api/v1/users/register-user", json={
        "name": "Test",
        "email": "test3@example.com",
        "gender": "male"
    })
    assert response.status_code == 422


# ─────────────────────────────────────────
# LOGIN TESTS
# ─────────────────────────────────────────

def test_login_success(client):
    client.post("/api/v1/users/register-user", json={
        "name": "Charlie",
        "email": "charlie@example.com",
        "password": "MyPassword99",
        "gender": "male"
    })
    response = client.post("/api/v1/users/login", json={
        "email": "charlie@example.com",
        "password": "MyPassword99"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Log in successfully"
    assert data["data"]["email"] == "charlie@example.com"


def test_login_wrong_password(client):
    client.post("/api/v1/users/register-user", json={
        "name": "Dave",
        "email": "dave@example.com",
        "password": "CorrectPass99",
        "gender": "male"
    })
    response = client.post("/api/v1/users/login", json={
        "email": "dave@example.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 400


def test_login_nonexistent_user(client):
    response = client.post("/api/v1/users/login", json={
        "email": "ghost@example.com",
        "password": "SomePass123"
    })
    assert response.status_code == 400


def test_login_missing_password(client):
    response = client.post("/api/v1/users/login", json={
        "email": "someone@example.com"
    })
    assert response.status_code == 422


def test_login_missing_email(client):
    response = client.post("/api/v1/users/login", json={
        "password": "SomePass123"
    })
    assert response.status_code == 422


# ─────────────────────────────────────────
# PROTECTED ROUTE TESTS
# ─────────────────────────────────────────

@pytest.fixture
def logged_in_client(client):
    client.post("/api/v1/users/register-user", json={
        "name": "Eve",
        "email": "eve@example.com",
        "password": "EvePass99",
        "gender": "female"
    })
    login_response = client.post("/api/v1/users/login", json={
        "email": "eve@example.com",
        "password": "EvePass99"
    })
    #  Manually set cookies to fix secure=True issue
    access_token = login_response.cookies.get("access_token")
    refresh_token = login_response.cookies.get("refresh_token")
    client.cookies.set("access_token", access_token)
    client.cookies.set("refresh_token", refresh_token)
    return client


def test_get_me_authenticated(logged_in_client):
    response = logged_in_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["email"] == "eve@example.com"


def test_get_me_unauthenticated(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_logout(logged_in_client):
    response = logged_in_client.get("/api/v1/users/logout")
    assert response.status_code == 200