# Sset the compiler and it's flags
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Iinclude -g

# Directories
SRC = src
INC = include
OBJ = obj
BIN = main

# Source files and object files
SOURCES := $(wildcard $(SRC)/*.cpp)
# above would be SOURCES = src/file1.cpp src/file2.cpp ...
OBJECTS := $(pathsubst $(SRC)/%.cpp, $(OBJ)/%.o, $(SOURCES))

# Rule
# Default Rule
all: $(BIN)

# Linking Rule
$(BIN): $(OBJECTS)
	$(CXX) $(SOURCES) $(OBJECTS) -o $@

# Compiling Rule
$(OBJ)/%.o: $(SRC)/%.cpp | $(OBJ)
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Making sure obj folder exists
$(OBJ):
	mkdir -p $(OBJ)

clean:
	rm main

.PHONY: all clean
