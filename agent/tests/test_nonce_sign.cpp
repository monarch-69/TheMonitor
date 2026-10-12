#include <fstream>

using namespace std;

int main()
{
    ifstream test{"~/.config/telemetry/config.json"};
    
    if (!test.is_open())
        printf("config.json not found using '~'\n");

    test.open("/home/sage-debian/.config/telemetry/config.json");
    
    if (test.is_open())
        printf("BINGO! File found using /home/sage-debian\n");

    return 0;
}
