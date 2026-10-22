// Funzioni: dichiarazione e definizione, parametri per valore, per
// riferimento e per riferimento costante, overloading, argomenti di default.
#include <iostream>
#include <string>
#include <vector>
using namespace std;

//@region dichiarazioni
// Dichiarazioni (prototipi): nome, parametri e tipo di ritorno.
// Il corpo arriva più sotto, dopo il main.
double media(const vector<int>& v);
void minMax(const vector<int>& v, int& mn, int& mx);
//@endregion

//@region overloading
// Stesso nome, parametri diversi: il compilatore sceglie in base agli argomenti.
int massimo(int a, int b) { return a > b ? a : b; }
double massimo(double a, double b) { return a > b ? a : b; }
int massimo(int a, int b, int c) { return massimo(massimo(a, b), c); }
//@endregion

//@region default
// sep ha un valore di default: si può omettere nella chiamata.
void stampa(const vector<int>& v, const string& sep = ", ") {
    for (size_t i = 0; i < v.size(); i++) {
        if (i > 0) cout << sep;
        cout << v[i];
    }
    cout << '\n';
}
//@endregion

//@region main
int main() {
    vector<int> voti = {28, 30, 24, 27};
    cout << "media: " << media(voti) << '\n';
    int lo, hi;
    minMax(voti, lo, hi);                   // lo e hi vengono riempiti dalla funzione
    cout << "minimo " << lo << ", massimo " << hi << '\n';
    cout << massimo(3, 9) << ' ' << massimo(2.5, 1.5) << ' ' << massimo(4, 1, 7) << '\n';
    stampa(voti);                           // sep = ", "
    stampa(voti, " | ");
    return 0;
}
//@endregion

//@region definizioni
// Definizioni: il corpo delle funzioni dichiarate in alto.
double media(const vector<int>& v) {        // const &: nessuna copia, nessuna modifica
    double somma = 0;
    for (int x : v) somma += x;
    return somma / v.size();
}

void minMax(const vector<int>& v, int& mn, int& mx) {   // due risultati: due riferimenti
    mn = mx = v[0];
    for (int x : v) {
        if (x < mn) mn = x;
        if (x > mx) mx = x;
    }
}
//@endregion
