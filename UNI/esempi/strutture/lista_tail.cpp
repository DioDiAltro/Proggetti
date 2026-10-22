// Lista con il puntatore all'ultimo nodo (tail): l'inserimento in coda
// diventa Θ(1) perché non serve più scorrere la lista per trovare la fine.
#include <iostream>
using namespace std;

struct Nodo {
    int val;
    Nodo* next;
};

//@region lista
struct Lista {
    Nodo* head = nullptr;   // primo nodo
    Nodo* tail = nullptr;   // ultimo nodo: va aggiornato a ogni modifica in fondo
};

void aggiungiInCoda(Lista& L, int x) {          // Θ(1)
    Nodo* nuovo = new Nodo{x, nullptr};
    if (L.tail == nullptr) {                    // lista vuota: primo e ultimo
        L.head = nuovo;
        L.tail = nuovo;
    } else {
        L.tail->next = nuovo;                   // l'ultimo punta al nuovo
        L.tail = nuovo;                         // e il nuovo diventa l'ultimo
    }
}

void togliInTesta(Lista& L) {                   // Θ(1); pre: lista non vuota
    Nodo* tmp = L.head;
    L.head = L.head->next;
    if (L.head == nullptr)                      // era l'unico nodo:
        L.tail = nullptr;                       // anche tail va azzerato
    delete tmp;
}
//@endregion

void stampa(const Lista& L) {
    for (Nodo* p = L.head; p != nullptr; p = p->next)
        cout << p->val << " -> ";
    cout << "nullptr";
    if (L.tail != nullptr) cout << "   (tail: " << L.tail->val << ")";
    cout << '\n';
}

int main() {
    Lista L;
    int dati[] = {8, 15, 23};
    for (int x : dati)
        aggiungiInCoda(L, x);
    stampa(L);

    togliInTesta(L);
    togliInTesta(L);
    stampa(L);
    togliInTesta(L);                            // ora è vuota: head e tail nulli
    stampa(L);

    aggiungiInCoda(L, 42);                      // funziona solo se tail è stato azzerato
    stampa(L);

    while (L.head != nullptr)
        togliInTesta(L);
    return 0;
}
