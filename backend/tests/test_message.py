import pytest
from unittest.mock import patch

@pytest.fixture
def logged_in_client(client):
    client.post("/api/v1/users/register-user", json={
        "name": "TestUser",
        "email": "msguser@example.com",
        "password": "TestPass99",
        "gender": "male"
    })
    login_response = client.post("/api/v1/users/login", json={
        "email": "msguser@example.com",
        "password": "TestPass99"
    })
    access_token = login_response.cookies.get("access_token")
    refresh_token = login_response.cookies.get("refresh_token")
    client.cookies.set("access_token", access_token)
    client.cookies.set("refresh_token", refresh_token)
    return client


@pytest.fixture
def chat_id(logged_in_client):
    response = logged_in_client.post("/api/v1/chats/")
    return response.json()["data"]["chat_id"]


@patch("app.routes.message.ask_gemini", return_value="I am here to help you!")
def test_send_message_success(mock_gemini, logged_in_client, chat_id):
    response = logged_in_client.post(f"/api/v1/messages/{chat_id}/message", json={
        "role": "user",
        "message_text": "I am feeling anxious today"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Message from Assisstant received successfully"
    assert data["data"]["role"] == "model"
    assert data["data"]["message_text"] == "I am here to help you!"


@patch("app.routes.message.ask_gemini", return_value="I am here to help you!")
def test_send_message_unauthenticated(mock_gemini, client):
    response = client.post("/api/v1/messages/1/message", json={
        "role": "user",
        "message_text": "Hello"
    })
    assert response.status_code == 401


@patch("app.routes.message.ask_gemini", return_value="I am here to help you!")
def test_send_message_missing_text(mock_gemini, logged_in_client, chat_id):
    response = logged_in_client.post(f"/api/v1/messages/{chat_id}/message", json={
        "role": "user"
    })
    assert response.status_code == 422


@patch("app.routes.message.ask_gemini", return_value="I am here to help you!")
def test_get_messages_success(mock_gemini, logged_in_client, chat_id):
    logged_in_client.post(f"/api/v1/messages/{chat_id}/message", json={
        "role": "user",
        "message_text": "Hello"
    })
    response = logged_in_client.get(f"/api/v1/messages/{chat_id}/get")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "All messages for chat_id fetched successfully"
    assert isinstance(data["data"], list)
    assert len(data["data"]) > 0