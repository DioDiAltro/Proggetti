// Tre funzioni hash: metodo della divisione, metodo della moltiplicazione
// e una funzione per le stringhe (polinomiale, calcolata con Horner).
#include <cmath>
#include <iomanip>
#include <iostream>
#include <string>
using namespace std;

//@region divisione
int hDivisione(int k, int m) {           // k >= 0
    return k % m;
}
//@endregion

//@region negativi
int hDivisioneSicura(int k, int m) {     // funziona anche con k < 0
    return ((k % m) + m) % m;            // in C++ -7 % 5 vale -2, non 3
}
//@endregion

//@region moltiplicazione
int hMoltiplicazione(int k, int m) {     // k >= 0
    const double A = 0.6180339887;       // (√5 − 1) / 2, il valore suggerito da Knuth
    double prodotto = k * A;
    double frazione = prodotto - floor(prodotto);   // parte frazionaria di k·A
    return int(m * frazione);            // un numero tra 0 e m − 1
}
//@endregion

//@region stringhe
int hStringa(const string& s, int m) {
    long long h = 0;
    for (char c : s)                     // Horner: h = h·31 + carattere
        h = (h * 31 + static_cast<unsigned char>(c)) % m;   // modulo a ogni passo: niente overflow
    return int(h);
}
//@endregion

int main() {
    int chiavi[] = {10, 22, 31, 4, 15, 28, 17, 88, 59};
    cout << "   k   k mod 11   moltiplicazione (m = 16)\n";
    for (int k : chiavi)
        cout << setw(4) << k << setw(11) << hDivisione(k, 11) << setw(12) << hMoltiplicazione(k, 16) << '\n';

    cout << "-7 % 5 = " << -7 % 5 << ", hDivisioneSicura(-7, 5) = " << hDivisioneSicura(-7, 5) << '\n';

    string parole[] = {"pila", "coda", "lista", "albero"};
    for (const string& w : parole)
        cout << "hStringa(\"" << w << "\", 13) = " << hStringa(w, 13) << '\n';
    return 0;
}
