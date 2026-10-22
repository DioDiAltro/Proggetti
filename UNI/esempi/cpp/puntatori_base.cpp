// Puntatori: indirizzo (&), dereferenziazione (*), nullptr, e il confronto
// con i riferimenti.
#include <iostream>
using namespace std;

int main() {
    int x = 10;
    int* p = &x;                // p contiene l'indirizzo di x
    cout << "x = " << x << ", *p = " << *p << '\n';
    *p = 20;                    // scrive in x passando da p
    cout << "dopo *p = 20: x = " << x << '\n';
    cout << "p punta a x? " << (p == &x ? "sì" : "no") << '\n';

    int y = 7;
    p = &y;                     // un puntatore può cambiare bersaglio
    cout << "ora *p = " << *p << '\n';

    int& r = x;                 // un riferimento è un altro nome di x, per sempre
    r = 30;
    cout << "dopo r = 30: x = " << x << '\n';

    int* q = nullptr;           // "non punta a niente"
    if (q == nullptr) cout << "q è nullo: non va dereferenziato\n";
    if (!q) cout << "in una condizione nullptr vale false\n";
    return 0;
}
