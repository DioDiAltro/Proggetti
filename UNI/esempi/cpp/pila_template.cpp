// Template: una funzione e una classe scritte una volta sola, per ogni tipo.
#include <iostream>
#include <string>
#include <vector>
using namespace std;

//@region funzione
template <typename T>
T massimo(const T& a, const T& b) {
    return (a < b) ? b : a;             // a T si chiede solo di avere <
}
//@endregion

//@region pila
template <typename T>
class Pila {
    vector<T> dati;                     // il vector fa il lavoro: la cima è in fondo
public:
    void push(const T& x) { dati.push_back(x); }
    void pop() { dati.pop_back(); }     // precondizione: pila non vuota
    const T& top() const { return dati.back(); }
    bool vuota() const { return dati.empty(); }
    int dimensione() const { return dati.size(); }
};
//@endregion

int main() {
    cout << massimo(3, 7) << ' ' << massimo(2.5, -1.0) << ' '
         << massimo(string("ciao"), string("mondo")) << '\n';

    Pila<int> p;                        // T = int
    for (int i = 1; i <= 4; i++) p.push(i * i);
    cout << "in cima: " << p.top() << ", elementi: " << p.dimensione() << '\n';
    while (!p.vuota()) {
        cout << p.top() << ' ';
        p.pop();
    }
    cout << '\n';

    Pila<string> parole;                // T = string: stesso codice, altro tipo
    parole.push("primo");
    parole.push("secondo");
    cout << "in cima: " << parole.top() << '\n';
    return 0;
}
