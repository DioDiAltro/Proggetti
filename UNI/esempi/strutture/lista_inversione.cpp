// Inversione di una lista concatenata "sul posto": nessun nodo nuovo,
// si girano soltanto le frecce. Versione iterativa e versione ricorsiva.
#include <iostream>
using namespace std;

struct Nodo {
    int val;
    Nodo* next;
};

//@region inverti
Nodo* inverti(Nodo* head) {
    Nodo* prev = nullptr;              //@init-prev
    Nodo* curr = head;                 //@init-curr
    while (curr != nullptr) {          //@loop
        Nodo* next = curr->next;       //@salva-next
        curr->next = prev;             //@gira
        prev = curr;                   //@avanza-prev
        curr = next;                   //@avanza-curr
    }
    return prev;                       //@ret
}
//@endregion

//@region ricorsiva
Nodo* invertiRic(Nodo* head) {
    if (head == nullptr || head->next == nullptr)
        return head;                       // 0 o 1 nodi: già invertita
    Nodo* nuovaTesta = invertiRic(head->next);
    head->next->next = head;               // il successivo ora punta a me
    head->next = nullptr;                  // e io divento l'ultimo
    return nuovaTesta;
}
//@endregion

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
    for (int x = 5; x >= 1; x--)
        head = new Nodo{x, head};      // 1 -> 2 -> 3 -> 4 -> 5
    stampa(head);

    head = inverti(head);              // senza "head =" si perde la lista
    stampa(head);

    head = invertiRic(head);           // di nuovo al dritto
    stampa(head);

    libera(head);
    return 0;
}
