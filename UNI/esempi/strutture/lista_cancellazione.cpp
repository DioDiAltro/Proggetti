// Cancellazione per valore in una lista concatenata semplice.
// Il caso speciale è la testa: il primo nodo non ha un precedente.
#include <iostream>
using namespace std;

struct Nodo {
    int val;
    Nodo* next;
};

//@region cancella
// Toglie il primo nodo che contiene x. Restituisce false se x non c'è.
bool cancella(Nodo*& head, int x) {
    if (head == nullptr) return false;                      //@vuota
    if (head->val == x) {                                   //@test-testa
        Nodo* tmp = head;                                   //@salva-testa
        head = head->next;                                  //@sposta-testa
        delete tmp;                                         //@del-testa
        return true;                                        //@ok-testa
    }
    Nodo* prev = head;                                      //@prev-init
    while (prev->next != nullptr && prev->next->val != x)   //@cerca
        prev = prev->next;                                  //@avanza
    if (prev->next == nullptr) return false;                //@non-trovato
    Nodo* tmp = prev->next;                                 //@salva
    prev->next = tmp->next;                                 //@scavalca
    delete tmp;                                             //@delete
    return true;                                            //@ok
}
//@endregion

void inserisciInTesta(Nodo*& head, int x) {
    head = new Nodo{x, head};
}

void stampa(Nodo* head) {
    for (Nodo* p = head; p != nullptr; p = p->next)
        cout << p->val << " -> ";
    cout << "nullptr\n";
}

//@region libera
void libera(Nodo*& head) {
    while (head != nullptr) {
        Nodo* succ = head->next;   // dopo il delete head->next non si può più leggere
        delete head;
        head = succ;
    }
}
//@endregion

int main() {
    Nodo* head = nullptr;
    int dati[] = {42, 23, 15, 8};
    for (int x : dati)
        inserisciInTesta(head, x);
    stampa(head);                                  // 8 -> 15 -> 23 -> 42 -> nullptr

    cout << boolalpha;
    cout << "cancella(23): " << cancella(head, 23) << "  ";
    stampa(head);
    cout << "cancella(8):  " << cancella(head, 8) << "  ";   // la testa
    stampa(head);
    cout << "cancella(7):  " << cancella(head, 7) << "  ";   // 7 non c'è
    stampa(head);

    libera(head);
    return 0;
}
