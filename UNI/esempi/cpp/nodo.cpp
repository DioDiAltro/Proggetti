// struct Nodo: un valore e il puntatore al nodo successivo.
// Si costruisce una lista inserendo in testa, la si stampa e la si libera.
#include <iostream>
#include <vector>
using namespace std;

//@region tutto
struct Nodo {
    int val;
    Nodo* next;
};

Nodo* costruisci(const vector<int>& valori) {
    Nodo* testa = nullptr;                       //@c-testa
    for (int x : valori) {                       //@c-for
        Nodo* nuovo = new Nodo{x, testa};        //@c-new
        testa = nuovo;                           //@c-link
    }
    return testa;                                //@c-ret
}

void stampa(const Nodo* testa) {
    for (const Nodo* p = testa; p != nullptr; p = p->next)   //@s-for
        cout << p->val << ' ';                   //@s-print
    cout << '\n';                                //@s-end
}

void libera(Nodo* testa) {
    while (testa != nullptr) {                   //@l-while
        Nodo* dopo = testa->next;                //@l-dopo
        delete testa;                            //@l-delete
        testa = dopo;                            //@l-next
    }
}

int main() {
    vector<int> valori = {8, 5, 3};              //@m-valori
    Nodo* lista = costruisci(valori);            //@m-costruisci
    stampa(lista);                               //@m-stampa
    libera(lista);                               //@m-libera
    lista = nullptr;                             //@m-null
    return 0;
}
//@endregion
