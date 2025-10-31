#pragma once

#include <string>
#include <cstdint>
#include <utility>
#include <vector>

#define MAX_CONNECTION_LISTEN 5


// Internet status codes
#define STATUS_OK 200
#define STATUS_INTERNAL_ERROR 500

#define CRLF "\r\n"
#define STATUS_OK_HEADER "HTTP/1.1 200 OK"
#define STATUS_INTERNAL_ERROR_HEADER "HTTP/1.1 500 Internal Server Error"

struct TcpSocket {
public:
    std::string host;
    uint16_t port;

private:
    int socketfd;

public:
    TcpSocket() : TcpSocket("127.0.0.1", 8080) {};
    TcpSocket(std::string&& host, uint16_t port) : host(host), port(port) { };
    
    void listener();
    int descriptor();
};

struct HttpResponse {
    int socketfd;
    uint16_t statuscode;
    std::string body;
    std::vector<std::pair<std::string, std::string>> headers;

    HttpResponse(): HttpResponse(-1) {};
    HttpResponse(int socketfd) : socketfd(socketfd), statuscode(200), body("") {
        this->headers.reserve(10);
    };
    void header(std::string&& header, std::string&& value);
    uint8_t send();
    std::string build();
};
