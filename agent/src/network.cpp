#include <cstdio>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <pthread.h>
#include <netinet/in.h>
#include "../include/network.hpp"

using namespace std;

void TcpSocket::listener()
{
    this->socketfd = socket(AF_INET, SOCK_STREAM, 0);
    if (this->socketfd == -1) {
        perror("Socket descriptor failed.");
        exit(-1);
    }
    
    sockaddr_in address;

    address.sin_family = AF_INET;
    if (inet_pton(AF_INET, this->host.c_str(), &address.sin_addr) <= 0) {
        perror("Invalid interface.");
        exit(-1);
    }
    address.sin_port = htons(this->port);

    if (bind(this->socketfd, (sockaddr*)&address, sizeof(address)) == -1) {
        perror("Socket binding failed.");
        exit(-1);
    }

    if (listen(this->socketfd, MAX_CONNECTION_LISTEN) == -1) {
        perror("Listening failed.");
        exit(-1);
    }
}

int TcpSocket::descriptor()
{
    return this->socketfd;
}

void HttpResponse::header(std::string&& header, std::string&& value)
{
    headers.push_back(make_pair(header, value));
}

string HttpResponse::build()
{
    string response;

    // Building the response
    // 1. generate the status code
    // 2. add the headers
    // 3. add the body
    switch (this->statuscode) {
        case STATUS_OK: response += STATUS_OK_HEADER; break;
        case STATUS_INTERNAL_ERROR: response += STATUS_INTERNAL_ERROR_HEADER; break;
    }
    response += CRLF;
    for (const auto& [header, value]: this->headers)
        response += (header + ": " + value + CRLF);
    response += CRLF;
    response += this->body;

    return response;
}

uint8_t HttpResponse::send()
{
    // First generate the actual response with the headers and body
    string response = this->build();
    // Now send the response
    printf("Built Response: %s\n", response.c_str());
    

    return 0;
}

// int main()
// {
//     TcpSocket socket;
//     socket.listener();
//
//     printf("Added the listener\n");
//
//     while (true) {
//         sockaddr_in client_addr;
//         socklen_t len = sizeof(client_addr);
//         int client_fd = accept(socket.descriptor(), (sockaddr*)&client_addr, &len);
//
//         if (client_fd == -1) {
//             perror("Client acceptance failed.\n");
//             return -1;
//         }
//
//         char buffer[1024];
//
//         printf("Client connected! Serving the request\n");
//         read(client_fd, buffer, 1024);
//         printf("From client: %s\n",buffer);
//     }
//
//     return 0;
// }
