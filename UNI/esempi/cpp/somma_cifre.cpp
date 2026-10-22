// Somma delle cifre di un numero: un ciclo while con % e /.
// È il programma da eseguire "a mano" nel capitolo sulle basi.
#include <iostream>
using namespace std;

//@region main
int main() {
    int n = 4096;                                   //@n
    int somma = 0;                                  //@somma
    while (n > 0) {                                 //@cond
        int cifra = n % 10;     // l'ultima cifra   //@cifra
        somma += cifra;                             //@add
        n /= 10;                // toglie l'ultima  //@div
    }                                               //@end-body
    cout << "somma delle cifre: " << somma << '\n'; //@print
    return 0;                                       //@ret
}
//@endregion
