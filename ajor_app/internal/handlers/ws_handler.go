package handlers

import (
    "net/http"
    "github.com/gorilla/websocket"
    "log"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)

// HandleWebSocket upgrades the HTTP connection to a WebSocket and manages clients
func HandleWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("WebSocket upgrade error:", err)
        return
    }
    defer conn.Close()
    clients[conn] = true

    for {
        _, _, err := conn.ReadMessage()
        if err != nil {
            delete(clients, conn)
            break
        }
    }
}

// BroadcastNotification sends a message to all connected WebSocket clients
func BroadcastNotification(message []byte) {
    for client := range clients {
        err := client.WriteMessage(websocket.TextMessage, message)
        if err != nil {
            client.Close()
            delete(clients, client)
        }
    }
} 