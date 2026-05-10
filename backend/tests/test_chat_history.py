import pytest

@pytest.fixture
def logged_in_client(client):
    client.post("/api/v1/users/register-user", json={
        "name": "TestUser",
        "email": "chatuser@example.com",
        "password": "TestPass99",
        "gender": "male"
    })
    login_response = client.post("/api/v1/users/login", json={
        "email": "chatuser@example.com",
        "password": "TestPass99"
    })
    access_token = login_response.cookies.get("access_token")
    refresh_token = login_response.cookies.get("refresh_token")
    client.cookies.set("access_token", access_token)
    client.cookies.set("refresh_token", refresh_token)
    return client


def test_create_chat_success(logged_in_client):
    response = logged_in_client.post("/api/v1/chats/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Chat History created successfully"
    assert "chat_id" in data["data"]


def test_create_chat_unauthenticated(client):
    response = client.post("/api/v1/chats/")
    assert response.status_code == 401


def test_get_all_chats_success(logged_in_client):
    logged_in_client.post("/api/v1/chats/")
    response = logged_in_client.get("/api/v1/chats/all")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "All Chats fetched successfully"
    assert isinstance(data["data"], list)
    assert len(data["data"]) > 0


def test_delete_chat_by_id(logged_in_client):
    create = logged_in_client.post("/api/v1/chats/")
    chat_id = create.json()["data"]["chat_id"]
    response = logged_in_client.delete(f"/api/v1/chats/{chat_id}/delete-by-id")
    assert response.status_code == 200