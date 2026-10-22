// Tre modi di inserire un nodo in una lista concatenata semplice:
// in testa, in coda e dopo un nodo dato.
#include <iostream>
using namespace std;

struct Nodo {
    int val;
    Nodo* next;
};

//@region inserimenti
// In testa: Θ(1). head è un riferimento: cambia.
void inserisciInTesta(Nodo*& head, int x) {
    Nodo* nuovo = new Nodo{x, nullptr};     //@t-new
    nuovo->next = head;                     //@t-link
    head = nuovo;                           //@t-head
}

// In coda: si cerca l'ultimo nodo, Θ(n).
void inserisciInCoda(Nodo*& head, int x) {
    Nodo* nuovo = new Nodo{x, nullptr};     //@c-new
    if (head == nullptr) {                  //@c-empty
        head = nuovo;                       //@c-head
        return;
    }
    Nodo* p = head;                         //@c-init
    while (p->next != nullptr)              //@c-test
        p = p->next;                        //@c-adv
    p->next = nuovo;                        //@c-link
}

// Dopo il nodo p (non nullptr): Θ(1).
void inserisciDopo(Nodo* p, int x) {
    Nodo* nuovo = new Nodo{x, nullptr};     //@d-new
    nuovo->next = p->next;                  //@d-link
    p->next = nuovo;                        //@d-p
}
//@endregion

Nodo* cerca(Nodo* head, int x) {
    Nodo* p = head;
    while (p != nullptr && p->val != x)
        p = p->next;
    return p;
}

void stampa(Nodo* head) {
    for (Nodo* p = head; p != nullptr; p = p->next)
        cout << p->val << " -> ";
    cout << "nullptr\n";
}

void libera(Nodo*& head) {
    while (head != nullptr) {
        Nodo* succ = head->next;
        delete head;
        head = succ;
    }
}

int main() {
    Nodo* head = nullptr;
    inserisciInCoda(head, 15);        // lista vuota: il nuovo diventa la testa
    inserisciInCoda(head, 23);
    inserisciInTesta(head, 8);
    stampa(head);                     // 8 -> 15 -> 23 -> nullptr

    inserisciDopo(cerca(head, 15), 16);
    inserisciInCoda(head, 42);
    stampa(head);                     // 8 -> 15 -> 16 -> 23 -> 42 -> nullptr

    libera(head);
    return 0;
}
