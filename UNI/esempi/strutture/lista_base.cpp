// Lista concatenata semplice: il nodo, lo scorrimento, la ricerca,
// l'inserimento in testa e la liberazione di tutta la memoria.
#include <iostream>
using namespace std;

//@region nodo
struct Nodo {
    int val;      // il dato
    Nodo* next;   // indirizzo del nodo successivo (nullptr se è l'ultimo)
};
//@endregion

//@region testa
void inserisciInTesta(Nodo*& head, int x) {
    Nodo* nuovo = new Nodo{x, nullptr};   // il nodo nasce nello heap
    nuovo->next = head;                   // punta al vecchio primo nodo
    head = nuovo;                         // e diventa il primo
}
//@endregion

//@region scorri
void stampa(Nodo* head) {
    for (Nodo* p = head; p != nullptr; p = p->next)
        cout << p->val << " -> ";
    cout << "nullptr\n";
}

int lunghezza(Nodo* head) {
    int n = 0;
    for (Nodo* p = head; p != nullptr; p = p->next)
        n++;
    return n;
}
//@endregion

//@region cerca
// Restituisce il primo nodo che contiene x, oppure nullptr.
Nodo* cerca(Nodo* head, int x) {
    Nodo* p = head;                          //@c-init
    while (p != nullptr && p->val != x)      //@c-test
        p = p->next;                         //@c-next
    return p;                                //@c-ret
}
//@endregion

//@region libera
void libera(Nodo*& head) {
    while (head != nullptr) {
        Nodo* succ = head->next;   // salva il successivo PRIMA di cancellare
        delete head;
        head = succ;
    }
}
//@endregion

int main() {
    Nodo* head = nullptr;   // lista vuota
    int dati[] = {42, 23, 15, 8};
    for (int x : dati)
        inserisciInTesta(head, x);   // ogni nuovo nodo va davanti

    stampa(head);
    cout << "lunghezza: " << lunghezza(head) << '\n';

    Nodo* p = cerca(head, 23);
    if (p != nullptr)
        cout << "cerca(23): trovato, il successivo vale " << p->next->val << '\n';
    cout << "cerca(7):  " << (cerca(head, 7) == nullptr ? "nullptr, non trovato" : "trovato") << '\n';

    libera(head);
    cout << "dopo libera: ";
    stampa(head);
    return 0;
}
