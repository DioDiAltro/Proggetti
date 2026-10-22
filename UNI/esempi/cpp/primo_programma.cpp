// Il primo programma: la struttura che avrà ogni esempio del corso.
#include <iostream>     // cout e cin stanno qui
using namespace std;    // così si scrive cout invece di std::cout

int main() {            // il programma comincia sempre da main
    int n = 10;
    int somma = n * (n + 1) / 2;    // 1 + 2 + ... + n, la formula di Gauss
    cout << "La somma dei numeri da 1 a " << n << " vale " << somma << '\n';
    return 0;           // 0 = "tutto bene" per il sistema operativo
}
