// Esercizio: inverti una lista concatenata semplice "sul posto",
// cioè senza creare nodi nuovi, cambiando solo i puntatori next.
#include <iostream>
using namespace std;

struct Nodo {
    int val;
    Nodo* next;
};

//@region soluzione
Nodo* inverti(Nodo* head) {
    Nodo* prev = nullptr;
    Nodo* curr = head;
    while (curr != nullptr) {
        Nodo* succ = curr->next;   // salvo il resto della lista
        curr->next = prev;         // giro la freccia
        prev = curr;               // avanzo di un passo
        curr = succ;
    }
    return prev;                   // prev è il vecchio ultimo nodo
}
//@endregion

Nodo* creaLista(const int* v, int n) {
    Nodo* head = nullptr;
    for (int i = n - 1; i >= 0; i--) head = new Nodo{v[i], head};
    return head;
}

void stampa(const Nodo* p) {
    for (; p != nullptr; p = p->next) cout << p->val << ' ';
    cout << '\n';
}

void libera(Nodo* p) {
    while (p != nullptr) {
        Nodo* succ = p->next;
        delete p;
        p = succ;
    }
}

int main() {
    int v[] = {1, 2, 3, 4, 5};
    Nodo* lista = creaLista(v, 5);
    stampa(lista);
    lista = inverti(lista);
    stampa(lista);
    libera(lista);
    stampa(inverti(nullptr));      // lista vuota: deve funzionare lo stesso
    return 0;
}
